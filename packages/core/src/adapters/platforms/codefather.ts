/**
 * 编程导航：写入 add_post 本地草稿并打开编辑器，必须由用户人工发布。
 * 沿用网站 24 小时缓存有效期，不跨设备同步，不调用 post/add 或 post/edit。
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, PlatformMeta, SyncResult } from '../../types'
import type { PublishOptions } from '../types'

const API_ORIGIN = 'https://api.codefather.cn'
const SITE_ORIGIN = 'https://www.codefather.cn'

export class CodefatherAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'codefather',
    name: '编程导航',
    icon: `${SITE_ORIGIN}/favicon.ico`,
    homepage: `${SITE_ORIGIN}/add/passage`,
    capabilities: ['article', 'draft', 'image_upload'],
  }

  readonly preprocessConfig = { outputFormat: 'markdown' as const }

  private readonly HEADER_RULES = [{
    urlFilter: 'https://api.codefather.cn/api/*',
    headers: { Origin: SITE_ORIGIN, Referer: `${SITE_ORIGIN}/` },
    resourceTypes: ['xmlhttprequest'],
  }]

  async checkAuth(): Promise<AuthResult> {
    try {
      return await this.withHeaderRules(this.HEADER_RULES, async () => {
        const response = await this.runtime.fetch(`${API_ORIGIN}/api/user/get/login`, {
          method: 'GET', credentials: 'include',
        })
        if (!response.ok) throw new Error(`登录检测失败（HTTP ${response.status}）`)
        const result = await response.json() as {
          code?: number
          message?: string
          data?: { id?: string | number; userName?: string; userAvatar?: string }
        }
        if (result.code !== 0 || !result.data?.id) {
          return { isAuthenticated: false, error: result.message || '请先登录编程导航' }
        }
        return {
          isAuthenticated: true,
          userId: String(result.data.id),
          username: result.data.userName,
          avatar: result.data.userAvatar,
        }
      })
    } catch (error) {
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  private imageUrl(result: { code?: number; message?: string; data?: string }): string {
    if (result.code !== 0 || typeof result.data !== 'string' || !result.data) {
      throw new Error(result.message || '编程导航图片上传失败：未返回图片地址')
    }
    if (new URL(result.data).protocol !== 'https:') throw new Error('编程导航返回了无效图片地址')
    return result.data
  }

  async uploadImage(file: Blob, filename = 'image.png'): Promise<string> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      const form = new FormData()
      form.append('file', file, filename)
      const result = await this.postMultipart<{ code?: number; message?: string; data?: string }>(
        `${API_ORIGIN}/api/file/upload?biz=post_picture&compress=true`, form,
      )
      return this.imageUrl(result)
    })
  }

  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    if (src.startsWith('data:image/')) {
      return { url: await this.uploadImage(await this.dataUriToBlob(src)) }
    }
    const parsed = new URL(src)
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('不支持的图片地址')
    if (parsed.hostname === 'pic.code-nav.cn') return { url: src }
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      const result = await this.postJson<{ code?: number; message?: string; data?: string }>(
        `${API_ORIGIN}/api/file/url/upload`, { biz: 'post_picture', compress: true, url: src },
      )
      return { url: this.imageUrl(result) }
    })
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    try {
      const tabs = this.runtime.tabs
      if (!tabs) throw new Error('编程导航本地草稿需要浏览器扩展运行时')
      if (!article.title.trim() || article.title.length > 100 || !article.markdown.trim()) {
        throw new Error('编程导航要求非空标题和正文，标题最多 100 字')
      }
      if ((await tabs.query(`${SITE_ORIGIN}/add/passage*`)).length > 0) {
        throw new Error('请先保存并关闭编程导航已有编辑器，再同步本地草稿')
      }
      const auth = await this.checkAuth()
      if (!auth.isAuthenticated) throw new Error(auth.error || '请先登录编程导航')

      let imageFailures = 0
      const content = await this.processImages(article.markdown, async src => {
        try { return await this.uploadImageByUrl(src) } catch (error) { imageFailures++; throw error }
      }, { onProgress: options?.onImageProgress })

      // 先打开非编辑页面，写缓存后再导航，避免 React 已挂载而不恢复缓存。
      const tab = await tabs.create(`${SITE_ORIGIN}/`, true)
      await tabs.waitForLoad(tab.id)
      // 上传和页面加载可能耗时；在写缓存前再次保护期间新打开的编辑器。
      if ((await tabs.query(`${SITE_ORIGIN}/add/passage*`)).length > 0) {
        throw new Error('请先保存并关闭编程导航已有编辑器，再同步本地草稿')
      }
      const cached = await tabs.executeScript(tab.id, ({ origin, value }: { origin: string; value: Record<string, unknown> }) => {
        try {
          if (location.origin !== origin) throw new Error('编程导航页面域名不匹配')
          // 空字符串与不存在都表示无草稿；其他未知或未过期内容仍保留。
          const previous = localStorage.getItem('add_post')
          if (previous !== null && previous !== '') {
            let replaceable = false
            try {
              const draft = JSON.parse(previous)
              const fields = draft?.value
              const stringFields = ['title', 'content', 'description', 'cover', 'thumbnailCover']
              replaceable = draft !== null && typeof draft === 'object' && !Array.isArray(draft)
                && Object.keys(draft).every(key => key === 'value' || key === 'expires')
                && fields !== null && typeof fields === 'object' && !Array.isArray(fields)
                && Object.keys(fields).length > 0
                && Object.entries(fields).every(([key, field]) => key === 'tags'
                  ? Array.isArray(field) && field.every(tag => typeof tag === 'string')
                  : stringFields.includes(key) && typeof field === 'string')
                && typeof draft.expires === 'number' && Number.isFinite(draft.expires)
                && draft.expires > 0 && draft.expires < Date.now()
            } catch { /* 不覆盖损坏或新版格式 */ }
            if (!replaceable) {
              throw new Error('编程导航已有本地草稿，请先在网站处理或清除后重试')
            }
          }
          const raw = JSON.stringify({ value, expires: Date.now() + 86400000 })
          localStorage.setItem('add_post', raw)
          if (localStorage.getItem('add_post') !== raw) throw new Error('编程导航本地草稿写入校验失败')
          return { success: true, error: '' }
        } catch (error) {
          // 不依赖页面异常跨 chrome.scripting 边界传播，显式返回原因。
          return { success: false, error: error instanceof Error ? error.message : String(error) }
        }
      }, [{ origin: SITE_ORIGIN, value: {
        title: article.title,
        content,
        description: article.summary,
        tags: article.tags,
      } }])
      if (!cached) throw new Error('编程导航页面脚本未返回结果，请刷新后重试')
      if (!cached.success) throw new Error(cached.error)
      const editorUrl = this.meta.homepage
      await tabs.executeScript(tab.id, (url: string) => { location.assign(url) }, [editorUrl])
      return this.createResult(true, {
        postUrl: editorUrl,
        draftOnly: true,
        message: '已保存到当前浏览器的本地草稿（24 小时有效），请在编程导航编辑器人工确认并发布；不跨设备同步'
          + (imageFailures ? `；${imageFailures} 张图片转存失败，已保留原链接，请检查` : ''),
      })
    } catch (error) {
      return this.createResult(false, { error: (error as Error).message })
    }
  }
}
