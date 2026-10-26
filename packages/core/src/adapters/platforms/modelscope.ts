/**
 * 魔搭社区 (modelscope.cn) 适配器
 *
 * 鉴权方式: Cookie 鉴权（浏览器登录态）
 * 文章 API: web 内部接口，走 Cookie + X-CSRF-TOKEN
 *
 * 已逆向确认的 API:
 * - GET  /api/v1/users/login/info          检查登录态
 * - POST /api/v1/articles                  创建草稿 (multipart/form-data)
 * - PUT  /api/v1/articles                  更新文章 (multipart/form-data)
 * - GET  /api/v1/articles/{id}             查询文章
 * - PUT  /api/v1/articles/{id}/publish     发布文章 (JSON body {})
 * - DELETE /api/v1/articles/{id}           删除文章
 *
 * 写模型 (multipart 字段):
 * Id, Type(2=文章), IsCourse(0), GmtUpdated, Title, Description,
 * ImageUrl, Path(用户名), Domains, Subjects, RelatedDataset,
 * RelatedModel, RelatedPaper, RelatedStudio, ContentDraft(编辑器 JSONML 树)
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'
import { buildContentDraft } from '../../lib/html-to-jsonml'

const logger = createLogger('ModelScope')

interface ModelScopeUserInfo {
  Code: number
  Data?: {
    NickName?: string
    HavanaId?: string
    UserName?: string
    Name?: string
    FromSite?: string
    Avatar?: string
  }
  Message?: string
}

interface ModelScopeApiResponse {
  Code: number
  Data?: {
    Id?: number
    Articles?: Array<Record<string, unknown>>
    [key: string]: unknown
  }
  Message?: string
  Success?: boolean
}

export class ModelScopeAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'modelscope',
    name: '魔搭社区',
    icon: 'https://www.modelscope.cn/favicon.ico',
    homepage: 'https://www.modelscope.cn',
    capabilities: ['article', 'draft', 'image_upload', 'cover'],
  }

  /** 预处理配置: 魔搭使用 HTML (转换为其编辑器 JSONML 树) */
  readonly preprocessConfig = {
    outputFormat: 'html' as const,
    processCodeBlocks: true,
    processLazyImages: true,
    removeIframes: true,
    removeComments: true,
  }

  private csrfToken: string | null = null
  private userInfo: ModelScopeUserInfo['Data'] | null = null

  /** 魔搭 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://www.modelscope.cn/api/*',
      headers: {
        'Origin': 'https://www.modelscope.cn',
        'Referer': 'https://www.modelscope.cn/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  /**
   * 安全解码 cookie 值 (可能 URL 编码)
   */
  private decodeCsrfToken(value: string): string {
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  /**
   * 获取 CSRF Token (从 cookie csrf_token，需 URL 解码)
   */
  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken

    if (this.runtime.getCookie) {
      // csrf_token 可能在 .modelscope.cn 或 .www.modelscope.cn
      const domains = ['www.modelscope.cn', 'modelscope.cn', '.modelscope.cn']
      for (const domain of domains) {
        const value = await this.runtime.getCookie(domain, 'csrf_token')
        if (value) {
          // 前端会 decodeURIComponent
          this.csrfToken = this.decodeCsrfToken(value)
          logger.debug('Got csrf_token from cookie')
          return this.csrfToken
        }
      }
    }

    // 降级: 从 document.cookie 读取
    try {
      const response = await this.runtime.fetch('https://www.modelscope.cn/', {
        method: 'GET',
        credentials: 'include',
      })
      await response.text()
      if (this.runtime.getCookie) {
        for (const domain of ['www.modelscope.cn', 'modelscope.cn']) {
          const value = await this.runtime.getCookie(domain, 'csrf_token')
          if (value) {
            this.csrfToken = this.decodeCsrfToken(value)
            return this.csrfToken
          }
        }
      }
    } catch (error) {
      logger.debug('Failed to refresh csrf_token:', error)
    }

    throw new Error('获取 CSRF Token 失败，请先登录魔搭社区并刷新页面')
  }

  /**
   * 检查登录状态
   */
  async checkAuth(): Promise<AuthResult> {
    try {
      const response = await this.runtime.fetch('https://www.modelscope.cn/api/v1/users/login/info', {
        method: 'GET',
        credentials: 'include',
      })

      const text = await response.text()
      let data: ModelScopeUserInfo
      try {
        data = JSON.parse(text)
      } catch {
        return { isAuthenticated: false, error: '响应格式错误' }
      }

      if (data.Code !== 200 || !data.Data) {
        return { isAuthenticated: false }
      }

      this.userInfo = data.Data

      return {
        isAuthenticated: true,
        username: data.Data.NickName,
        userId: data.Data.HavanaId,
        avatar: data.Data.Avatar,
      }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  /**
   * 获取用户 Path (用户名, 用于文章 URL)
   * login/info 返回的 Name 字段是用户唯一标识 (如 leonalgo)
   */
  private async getPath(): Promise<string> {
    if (this.userInfo?.Name) return this.userInfo.Name

    const response = await this.runtime.fetch('https://www.modelscope.cn/api/v1/users/login/info', {
      method: 'GET',
      credentials: 'include',
    })
    const data = JSON.parse(await response.text()) as ModelScopeUserInfo
    const name = data.Data?.Name
    if (!name) {
      throw new Error('无法获取用户名，请重新登录魔搭社区')
    }
    this.userInfo = data.Data
    return name
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish to modelscope...')

      // 1. 获取 CSRF Token
      const csrfToken = await this.getCsrfToken()
      if (!csrfToken) {
        throw new Error('获取 CSRF Token 失败，请刷新页面后重试')
      }

      // 2. 获取用户名 (Path)
      const path = await this.getPath()

      // 3. 处理图片上传
      let html = article.html || ''
      if (html && this.meta.capabilities.includes('image_upload')) {
        html = await this.processImages(
          html,
          (src) => this.uploadImageByUrl(src),
          {
            skipPatterns: ['modelscope.cn', 'resources.modelscope.cn', 'cdn.modelscope.cn'],
            onProgress: options?.onImageProgress,
          }
        )
      }

      // 4. 转换内容为编辑器 JSONML 树
      const contentDraft = await buildContentDraft(html, article.markdown, (htmlStr) =>
        this.runtime.dom.parseHTML(htmlStr)
      )
      logger.debug('ContentDraft length:', contentDraft.length)

      // 5. 构建 multipart 表单
      const formData = new FormData()
      formData.append('Type', '2') // 2 = 文章
      formData.append('IsCourse', '0')
      formData.append('GmtUpdated', String(Math.floor(Date.now() / 1000)))
      formData.append('Title', article.title || '')
      formData.append('Description', article.summary || article.markdown.slice(0, 100) || '')
      formData.append('ImageUrl', article.cover || '')
      formData.append('Path', path)
      formData.append('Domains', '[]')
      formData.append('Subjects', '[]')
      formData.append('RelatedDataset', '[]')
      formData.append('RelatedModel', '[]')
      formData.append('RelatedPaper', '[]')
      formData.append('RelatedStudio', '[]')
      formData.append('ContentDraft', contentDraft)

      // 6. 创建草稿
      logger.debug('Creating draft...')
      const createResponse = await this.runtime.fetch('https://www.modelscope.cn/api/v1/articles', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
        body: formData,
      })

      const createText = await createResponse.text()
      logger.debug('Create response:', createResponse.status, createText.substring(0, 300))

      let createData: ModelScopeApiResponse
      try {
        createData = JSON.parse(createText)
      } catch {
        throw new Error(`创建草稿失败: 响应不是有效 JSON - ${createText.substring(0, 100)}`)
      }

      if (createData.Code !== 200) {
        // 处理登录失效
        if (createData.Code === 10010109003 || createResponse.status === 401) {
          throw new Error('未登录或登录已过期，请重新登录魔搭社区')
        }
        throw new Error(`创建草稿失败: ${createData.Message || createData.Code}`)
      }

      const postId = String(createData.Data?.Id || '')
      if (!postId) {
        throw new Error('创建草稿失败: 未获取到文章 ID')
      }

      logger.debug('Draft created:', postId)

      // 7. 是否直接发布
      if (!options?.draftOnly) {
        const publishResponse = await this.runtime.fetch(
          `https://www.modelscope.cn/api/v1/articles/${postId}/publish`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'X-CSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        )

        const publishText = await publishResponse.text()
        logger.debug('Publish response:', publishResponse.status, publishText.substring(0, 300))

        let publishData: ModelScopeApiResponse
        try {
          publishData = JSON.parse(publishText)
        } catch {
          throw new Error(`发布失败: 响应不是有效 JSON - ${publishText.substring(0, 100)}`)
        }

        if (publishData.Code !== 200) {
          throw new Error(`发布失败: ${publishData.Message || publishData.Code}`)
        }

        const postUrl = `https://www.modelscope.cn/learn/articles/${postId}`

        return this.createResult(true, {
          postId,
          postUrl,
          draftOnly: false,
        })
      }

      // 仅草稿
      const draftUrl = `https://www.modelscope.cn/learn/edit/${postId}`
      return this.createResult(true, {
        postId,
        postUrl: draftUrl,
        draftOnly: true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  /**
   * 上传图片到魔搭
   *
   * 前端真实流程（逆向自 OSSUpload 组件，chunk 88508；已在浏览器实测验证）:
   * 1. POST /api/v1/rm/uploadUrl   {FileName, Type:"RACE_IMAGE"} → 获取预签名 UploadUrl
   * 2. PUT  <UploadUrl>            octet-stream 二进制上传
   * 3. POST /api/v1/rm/downloadUrl {FileUrl, Type:"RACE_IMAGE"} → 获取最终 CDN DownloadUrl
   *    （OSS 索引有延迟，DownloadUrl 可能为空，需重试）
   */
  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    const csrfToken = await this.getCsrfToken()

    // 下载图片
    const imageResponse = await fetch(src)
    if (!imageResponse.ok) {
      throw new Error('图片下载失败: ' + src)
    }
    const imageBlob = await imageResponse.blob()

    // 1. 获取预签名上传 URL
    const fileName = `${Date.now()}-wechatsync.${this.guessExt(src)}`
    const presignResponse = await this.runtime.fetch(
      'https://www.modelscope.cn/api/v1/rm/uploadUrl',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ FileName: fileName, Type: 'RACE_IMAGE' }),
      }
    )

    const presignText = await presignResponse.text()
    let presignData: ModelScopeApiResponse
    try {
      presignData = JSON.parse(presignText)
    } catch {
      throw new Error(`获取上传地址失败: ${presignText.substring(0, 100)}`)
    }
    if (presignData.Code !== 200) {
      throw new Error(`获取上传地址失败: ${presignData.Message || presignData.Code}`)
    }

    const presign = presignData.Data as { UploadUrl?: string } | undefined
    const uploadUrl = presign?.UploadUrl
    if (!uploadUrl) {
      throw new Error('获取上传地址失败: 未返回 UploadUrl')
    }

    // 2. PUT 二进制到 OSS（预签名 URL，无需鉴权头）
    const putResponse = await this.runtime.fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-oss-meta-author': 'aliy',
      },
      body: imageBlob,
    })
    if (!putResponse.ok) {
      throw new Error(`图片上传失败: HTTP ${putResponse.status}`)
    }

    // 3. 换取最终 CDN 地址（必须带 Type；OSS 索引有延迟，空 DownloadUrl 时重试）
    let imageUrl = ''
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await this.delay(1200)
      const downloadResponse = await this.runtime.fetch(
        'https://www.modelscope.cn/api/v1/rm/downloadUrl',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({ FileUrl: uploadUrl.split('?')[0], Type: 'RACE_IMAGE' }),
        }
      )

      const downloadText = await downloadResponse.text()
      let downloadData: ModelScopeApiResponse
      try {
        downloadData = JSON.parse(downloadText)
      } catch {
        throw new Error(`获取图片地址失败: ${downloadText.substring(0, 100)}`)
      }
      if (downloadData.Code !== 200 || !downloadData.Success) {
        throw new Error(`获取图片地址失败: ${downloadData.Message || downloadData.Code}`)
      }

      const download = downloadData.Data as { DownloadUrl?: string } | undefined
      if (download?.DownloadUrl) {
        imageUrl = download.DownloadUrl
        break
      }
      // DownloadUrl 为空说明 OSS 未索引完成，稍后重试
    }

    if (!imageUrl) {
      throw new Error('获取图片地址失败: 未返回 DownloadUrl（OSS 索引延迟，已重试 3 次）')
    }

    logger.info('Image uploaded:', imageUrl)
    return {
      url: imageUrl,
    }
  }

  /**
   * 从 URL 或 data URI 猜测图片扩展名
   */
  private guessExt(src: string): string {
    if (src.startsWith('data:')) {
      const mime = src.substring(5, src.indexOf(';'))
      if (mime === 'image/jpeg') return 'jpg'
      if (mime === 'image/gif') return 'gif'
      if (mime === 'image/webp') return 'webp'
      return 'png'
    }
    const match = src.split('?')[0].match(/\.(jpe?g|png|gif|webp|bmp)$/i)
    return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'png'
  }
}
