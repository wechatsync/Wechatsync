/**
 * 豆瓣适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { DoubanImageData } from '../../lib'
import type { PublishOptions } from '../types'
import { markdownToDraft } from '../../lib'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Douban')

const EDITOR_URL = 'https://www.douban.com/topic/create?subtype=note'

export class DoubanAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'douban',
    name: '豆瓣',
    icon: 'https://www.douban.com/favicon.ico',
    homepage: EDITOR_URL,
    capabilities: ['article', 'draft', 'image_upload'],
  }

  /** 预处理配置: 豆瓣使用 Markdown 格式 (转换为 Draft.js) */
  readonly preprocessConfig = {
    outputFormat: 'markdown' as const,
  }

  private userId: string = ''
  private ck: string = ''
  private uploadAuthToken: string = ''

  /** 豆瓣 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://*.douban.com/*',
      headers: {
        'Origin': 'https://www.douban.com',
        'Referer': 'https://www.douban.com',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  async checkAuth(): Promise<AuthResult> {
    try {
      // 豆瓣已改版：旧 /note/create 编辑器下线，新编辑器在 __INIT_STATE__ 中提供用户信息
      const response = await this.runtime.fetch(EDITOR_URL, {
        method: 'GET',
        credentials: 'include',
      })

      const html = await response.text()

      const userIdMatch = html.match(/user:\s*\{\s*"id":\s*"(\d+)"/)
      const userNameMatch = html.match(/user:\s*\{[^}]*?"name":\s*"([^"]+)"/)
      const avatarMatch = html.match(/user:\s*\{[^}]*?"avatar":\s*"([^"]+)"/)
      const uploadTokenMatch = html.match(/upload_auth_token:\s*['"]([^'"]+)['"]/)

      if (!userIdMatch) {
        return { isAuthenticated: false }
      }

      // CSRF 令牌取自 .douban.com 域的 ck cookie
      const ck = this.runtime.getCookie
        ? await this.runtime.getCookie('.douban.com', 'ck')
        : (await this.runtime.cookies.get('.douban.com')).find(c => c.name === 'ck')?.value
      if (!ck) {
        return { isAuthenticated: false }
      }

      this.userId = userIdMatch[1]
      this.ck = ck
      this.uploadAuthToken = uploadTokenMatch ? uploadTokenMatch[1] : ''
      let username = this.userId
      if (userNameMatch) {
        try {
          username = JSON.parse(`"${userNameMatch[1]}"`)
        } catch {
          username = userNameMatch[1]
        }
      }

      logger.debug('Auth info:', {
        userId: this.userId,
        hasUploadToken: !!this.uploadAuthToken,
      })

      return {
        isAuthenticated: true,
        userId: this.userId,
        username,
        avatar: avatarMatch ? avatarMatch[1].replace(/\\\//g, '/') : '',
      }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish...')

      // 1. 确保已登录
      if (!this.ck) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('请先登录豆瓣')
        }
      }

      // Use pre-processed markdown content directly
      let content = article.markdown || ''

      // Process images - collect full image data
      const imageDataMap = new Map<string, DoubanImageData>()
      content = await this.processImages(
        content,
        async (src) => {
          const result = await this.uploadImageWithFullData(src)
          // 保存完整图片数据，用 newUrl 作为 key
          imageDataMap.set(result.url, result.imageData)
          return result
        },
        {
          skipPatterns: ['doubanio.com', 'douban.com'],
          onProgress: options?.onImageProgress,
        }
      )

      // Markdown to Draft.js format (pass in image data)
      const draftContent = markdownToDraft(content, imageDataMap)

      // 多图格式：1_图片ID,2_图片ID
      const imageIds = Array.from(imageDataMap.values())
        .map((img, i) => `${i + 1}_${img.id}`)
        .join(',')

      // 旧接口 /j/note/autosave 已下线，新编辑器把日记作为 topic 发布
      const response = await this.runtime.fetch(
        'https://m.douban.com/rexxar/api/v2/topic/post',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': this.ck,
          },
          body: JSON.stringify({
            title: article.title,
            content: draftContent,
            image_ids: imageIds,
            topic_tag_ids: '',
            interest_tags: '',
            is_event: false,
            subtype: 'note',
            // 私密发布（仅自己可见），代替旧版草稿
            accessible: 'private',
            explanation_types: '',
            send_status: true,
            original: false,
            is_activity_rule: false,
            enable_item_tag: false,
          }),
        }
      )

      const res = await response.json() as { id?: string; url?: string; msg?: string; localized_message?: string }
      logger.debug('Publish response:', res)

      if (!response.ok || !res.id) {
        throw new Error(res.localized_message || res.msg || `发布失败 (${response.status})`)
      }

      return this.createResult(true, {
        postId: res.id,
        postUrl: res.url || `https://www.douban.com/topic/${res.id}/`,
        draftOnly: options?.draftOnly ?? true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  /**
   * 上传图片并返回完整数据
   */
  private async uploadImageWithFullData(src: string): Promise<ImageUploadResult & { imageData: DoubanImageData }> {
    if (!this.ck || !this.uploadAuthToken) {
      throw new Error('未获取上传凭证')
    }

    // 1. 下载图片
    const imageResponse = await fetch(src)
    if (!imageResponse.ok) {
      throw new Error('图片下载失败: ' + src)
    }
    const imageBlob = await imageResponse.blob()

    // 2. 上传到豆瓣
    const formData = new FormData()
    formData.append('ck', this.ck)
    formData.append('image_file', imageBlob, 'image.jpg')
    formData.append('primary_color', '')
    formData.append('upload_auth_token', this.uploadAuthToken)

    const uploadResponse = await this.runtime.fetch(
      'https://upload.douban.com/j/group/topic/add_photo',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    const res = await uploadResponse.json() as {
      photo?: {
        id: string
        url: string
        thumb: string
        width: number
        height: number
        file_name: string
        file_size: number
      }
    }

    logger.debug('Image upload response:', res)

    if (!res.photo?.url) {
      throw new Error('图片上传失败')
    }

    const photo = res.photo

    // 返回带完整图片数据
    return {
      url: photo.url,
      imageData: {
        id: photo.id,
        url: photo.url,
        thumb: photo.thumb,
        width: photo.width,
        height: photo.height,
        file_name: photo.file_name,
        file_size: photo.file_size,
      }
    }
  }
}
