/**
 * B站适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Bilibili')

interface BilibiliUserInfo {
  mid: number
  uname: string
  face: string
  isLogin: boolean
}

export class BilibiliAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'bilibili',
    name: '哔哩哔哩',
    icon: 'https://www.bilibili.com/favicon.ico',
    homepage: 'https://member.bilibili.com/platform/upload/text',
    capabilities: ['article', 'draft', 'image_upload'],
  }

  /** 预处理配置: B站使用 HTML，移除外链 */
  readonly preprocessConfig = {
    outputFormat: 'html' as const,
    removeLinks: true,
  }

  private userInfo: BilibiliUserInfo | null = null
  private csrf: string = ''

  /** B站 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://api.bilibili.com/*',
      headers: {
        'Origin': 'https://member.bilibili.com',
        'Referer': 'https://member.bilibili.com/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  async checkAuth(): Promise<AuthResult> {
    try {
      const res = await this.get<{
        code: number
        data?: BilibiliUserInfo
      }>('https://api.bilibili.com/x/web-interface/nav?build=0&mobi_app=web')

      logger.debug('checkAuth response:', res)

      if (res.code === 0 && res.data?.isLogin) {
        this.userInfo = res.data
        await this.fetchCsrf()

        return {
          isAuthenticated: true,
          userId: String(res.data.mid),
          username: res.data.uname,
          avatar: res.data.face,
        }
      }

      return { isAuthenticated: false }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  private async fetchCsrf(): Promise<void> {
    try {
      if (this.runtime.getCookie) {
        const value = await this.runtime.getCookie('.bilibili.com', 'bili_jct')
        this.csrf = value || ''
      }
      logger.debug('CSRF token:', this.csrf ? 'obtained' : 'not found')
    } catch (e) {
      logger.error('Failed to get CSRF:', e)
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish...')

      if (!this.userInfo) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('请先登录B站')
        }
      }

      if (!this.csrf) {
        throw new Error('获取 CSRF token 失败，请刷新页面后重试')
      }

      // Use pre-processed HTML content directly
      let content = article.html || ''

      content = await this.processImages(
        content,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['hdslb.com', 'bilibili.com', 'biliimg.com'],
          onProgress: options?.onImageProgress,
        }
      )

      // B站要求所有图片必须在自家 CDN，移除上传失败仍保留原始 URL 的图片
      content = content.replace(/<img[^>]+src=(?:"([^"]*)"|'([^']*)'|((?:https?:)?\/\/[^\s>"']+|data:[^\s>"']+))[^>]*>/gi, (tag, s1, s2, s3) => {
        const src = s1 || s2 || s3 || ''
        return (src.includes('hdslb.com') || src.includes('bilibili.com') || src.includes('biliimg.com')) ? tag : ''
      })

      const res = await this.postForm<{
        code: number
        message?: string
        data?: { aid: number }
      }>(
        'https://api.bilibili.com/x/article/creative/draft/addupdate',
        {
          tid: '4',
          title: article.title,
          content: content,
          csrf: this.csrf,
          save: '0',
          pgc_id: '0',
        }
      )

      logger.debug('Draft response:', res)

      if (res.code !== 0 || !res.data?.aid) {
        logger.error('draft save failed', { code: res.code, message: res.message, contentLength: content.length })
        const detail = res.message || JSON.stringify(res).slice(0, 200)
        throw new Error(`保存草稿失败 (code=${res.code}, 内容长度=${content.length}): ${detail}`)
      }

      const draftUrl = `https://member.bilibili.com/platform/upload/text/edit?aid=${res.data.aid}`

      return this.createResult(true, {
        postId: String(res.data.aid),
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    if (!this.csrf) {
      throw new Error('CSRF token 未获取')
    }

    const imageResponse = await fetch(src)
    if (!imageResponse.ok) {
      throw new Error('图片下载失败: ' + src)
    }
    const imageBlob = await imageResponse.blob()

    const formData = new FormData()
    formData.append('binary', imageBlob, 'image.jpg')
    formData.append('csrf', this.csrf)

    const uploadUrl = 'https://api.bilibili.com/x/article/creative/article/upcover'
    const uploadResponse = await this.runtime.fetch(uploadUrl, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    const res = await uploadResponse.json() as {
      code: number
      message?: string
      data?: {
        url: string
        size: number
      }
    }

    logger.debug('Image upload response:', res)

    if (res.code !== 0 || !res.data?.url) {
      logger.error('image upload failed', { code: res.code, message: res.message, src: src.slice(0, 100) })
      throw new Error(`图片上传失败 (code=${res.code}): ${res.message || JSON.stringify(res).slice(0, 200)}`)
    }

    return {
      url: res.data.url,
      attrs: {
        size: String(res.data.size),
      },
    }
  }
}
