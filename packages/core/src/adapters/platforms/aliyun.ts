/** 阿里云开发者社区：使用网页编辑器接口新建 Markdown 草稿。 */
import { CodeAdapter } from '../code-adapter'
import { uploadMarkdownImages } from '../../lib/markdown-image-upload'
import type { PublishOptions } from '../types'
import type { Article, AuthResult, PlatformMeta, SyncResult } from '../../types'

const ORIGIN = 'https://developer.aliyun.com'
const EDITOR_URL = `${ORIGIN}/article/new`
const API_URL = `${ORIGIN}/developer/api`
interface CsrfConfig {
  key: string
  value: string
}
interface ApiResponse<T> {
  success: boolean
  data?: T
}
interface UploadInfo {
  uploadUrl: string
  imageUrl: string
  header: Record<string, string>
}

export class AliyunAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'aliyun',
    name: '阿里云开发者社区',
    icon: `${ORIGIN}/favicon.ico`,
    homepage: EDITOR_URL,
    capabilities: ['article', 'draft', 'image_upload'],
  }
  readonly preprocessConfig = { outputFormat: 'markdown' as const }
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://developer.aliyun.com/developer/api/*',
      headers: { Origin: ORIGIN, Referer: EDITOR_URL },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  async checkAuth(): Promise<AuthResult> {
    try {
      const user = await this.requestJson<{
        uccId: string | number
        nickname?: string
        avatar?: string
      }>(`${API_URL}/my/user/getUser`, { credentials: 'include' }, '检查阿里云登录状态')
      if (!user.uccId) return { isAuthenticated: false }
      return {
        isAuthenticated: true,
        userId: String(user.uccId),
        username: user.nickname || String(user.uccId),
        avatar: user.avatar,
      }
    } catch {
      return { isAuthenticated: false }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withAliyunHeaders(async () => {
      if (!(await this.checkAuth()).isAuthenticated) throw new Error('请先登录阿里云开发者社区')
      // 每次读取当前编辑页配置，避免登录变化后复用旧 CSRF。
      const csrf = await this.getCsrfConfig()
      const content = await uploadMarkdownImages(
        article.markdown,
        (src) => this.uploadArticleImage(src, csrf, article.source?.url),
        options?.onImageProgress
      )
      const draft = await this.postApi<{ aid?: number | string }>(
        'articleDraft/putDraft',
        {
          title: article.title,
          abstractContent: article.summary || '',
          content,
          contentRender: '',
          // format:4 是语雀 lake；Markdown 编辑器使用 null。
          format: null,
          // 绝不复用前一次同步的 aid，避免覆盖用户已编辑的草稿。
          aid: null,
          productTags: [],
          freeTierVOS: [],
        },
        csrf,
        '保存阿里云草稿'
      )
      const postId = String(draft.aid ?? '')
      if (!/^[1-9]\d*$/.test(postId)) throw new Error('保存阿里云草稿失败：响应缺少有效草稿 ID')
      return this.createResult(true, {
        postId,
        postUrl: `${EDITOR_URL}?edit=${postId}`,
        draftOnly: true,
      })
    })
  }

  async uploadImage(file: Blob, filename?: string): Promise<string> {
    return this.withAliyunHeaders(async () => {
      const csrf = await this.getCsrfConfig()
      return this.uploadFile(file, csrf, filename)
    })
  }

  private async getCsrfConfig(): Promise<CsrfConfig> {
    const response = await this.fetchChecked(
      EDITOR_URL,
      { credentials: 'include' },
      '获取阿里云编辑页 CSRF'
    )
    const html = await response.text()
    const config = html.match(/\b(?:window\.)?GLOBAL_CONFIG\s*=\s*\{([\s\S]*?)\}\s*;/)?.[1]
    const key = config?.match(/["']csrf_key["']\s*:\s*["']([^"']+)["']/)?.[1]
    const value = config?.match(/["']csrf_val["']\s*:\s*["']([^"']+)["']/)?.[1]
    if (!key || !value) throw new Error('获取阿里云编辑页 CSRF 失败，请在浏览器中重新登录')
    return { key, value }
  }

  private async uploadArticleImage(
    src: string,
    csrf: CsrfConfig,
    sourceUrl?: string
  ): Promise<string> {
    let url: URL
    try {
      url = new URL(src.startsWith('//') ? `https:${src}` : src, sourceUrl)
      if (!['https:', 'http:', 'data:'].includes(url.protocol)) throw new Error()
    } catch {
      throw new Error('图片下载失败：无法解析图片地址，请提供完整地址或来源文章 URL')
    }
    const response = await this.fetchChecked(url.href, {}, '下载文章图片')
    return this.uploadFile(await response.blob(), csrf)
  }

  private async withAliyunHeaders<T>(action: () => Promise<T>): Promise<T> {
    const rules = this.runtime.headerRules
    const ids: string[] = []
    try {
      for (const rule of this.HEADER_RULES) {
        if (rules) ids.push(await rules.add(rule))
      }
      return await action()
    } finally {
      // 注册中心会复用实例；并发操作只移除各自创建的规则。
      for (const id of ids) await rules?.remove(id)
    }
  }

  private async uploadFile(file: Blob, csrf: CsrfConfig, filename?: string): Promise<string> {
    const extensions: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
    }
    const extension = extensions[file.type]
    if (!extension || !file.size) throw new Error('图片上传失败：图片为空或格式不受支持')
    const info = await this.postApi<UploadInfo>(
      'image/getImageUploadUrl',
      {
        imageName: filename?.split(/[\\/]/).pop() || `wechatsync-${Date.now()}.${extension}`,
        imageSize: file.size,
      },
      csrf,
      '获取阿里云图片上传地址'
    )
    if (
      !info.uploadUrl ||
      !info.imageUrl ||
      !info.header?.['content-type'] ||
      !info.header?.['x-oss-meta-author']
    ) {
      throw new Error('图片上传失败：上传凭证不完整')
    }
    // 官方编辑器将 OSS 地址切换到当前页面的 HTTPS 协议。
    const uploadUrl = this.httpsUrl(info.uploadUrl)
    const imageUrl = this.httpsUrl(info.imageUrl)
    await this.fetchChecked(
      uploadUrl,
      {
        method: 'PUT',
        headers: {
          'content-type': info.header['content-type'],
          'x-oss-meta-author': info.header['x-oss-meta-author'],
        },
        body: file,
      },
      '上传阿里云图片'
    )
    return imageUrl
  }

  private httpsUrl(value: string): string {
    try {
      const url = new URL(value.startsWith('//') ? `https:${value}` : value)
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
        throw new Error()
      url.protocol = 'https:'
      return url.href
    } catch {
      throw new Error('图片上传失败：服务端返回无效地址')
    }
  }

  private postApi<T>(
    path: string,
    body: Record<string, unknown>,
    csrf: CsrfConfig,
    operation: string
  ): Promise<T> {
    const query = new URLSearchParams({ [csrf.key]: csrf.value })
    return this.requestJson<T>(
      `${API_URL}/${path}?${query}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      operation
    )
  }

  private async requestJson<T>(url: string, options: RequestInit, operation: string): Promise<T> {
    const response = await this.fetchChecked(url, options, operation)
    let result: ApiResponse<T> | null
    try {
      result = (await response.json()) as ApiResponse<T>
    } catch {
      throw new Error(`${operation}失败：响应不是 JSON`)
    }
    if (!result?.success || !result.data) throw new Error(`${operation}失败：服务端未返回成功结果`)
    return result.data
  }

  private async fetchChecked(
    url: string,
    options: RequestInit,
    operation: string
  ): Promise<Response> {
    let response: Response
    try {
      response = await this.runtime.fetch(url, options)
    } catch {
      // runtime 的异常可能含 CSRF 或 OSS 签名 URL，不传入同步日志。
      throw new Error(`${operation}失败：网络请求失败`)
    }
    if (!response.ok) throw new Error(`${operation}失败：HTTP ${response.status}`)
    return response
  }
}
