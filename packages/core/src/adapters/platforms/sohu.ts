/**
 * 搜狐号适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PreprocessConfig, PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Sohu')

interface SohuAccountInfo {
  id: string
  nickName: string
  avatar: string
}

/**
 * 生成设备 ID (dv-id)
 */
function generateDeviceId(): string {
  const chars = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export class SohuAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'sohu',
    name: '搜狐号',
    icon: 'https://mp.sohu.com/favicon.ico',
    homepage: 'https://mp.sohu.com/mpfe/v3/main/first/page?newsType=1',
    capabilities: ['article', 'draft', 'image_upload'],
  }

  /** 预处理配置: 搜狐号将表格整体转为 SVG 图片，避免平台清洗 HTML 表格样式 */
  readonly preprocessConfig: Partial<PreprocessConfig> = {
    outputFormat: 'html' as const,
    tableFormat: 'svg-image',
    boldHeadingLevels: [3],
  }

  private accountInfo: SohuAccountInfo | null = null
  private deviceId: string = generateDeviceId()
  private spCm: string = ''

  /** 搜狐号 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://mp.sohu.com/*',
      headers: {
        'Origin': 'https://mp.sohu.com',
        'Referer': 'https://mp.sohu.com/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  async checkAuth(): Promise<AuthResult> {
    try {
      // 使用 /account/list 获取所有子账号（搜狐号支持多个子账号）
      const response = await this.runtime.fetch(
        `https://mp.sohu.com/mpbp/bp/account/list?_=${Date.now()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const res = await response.json() as {
        code: number
        data?: {
          data?: Array<{
            accounts: SohuAccountInfo[]
          }>
        }
      }

      logger.debug('checkAuth response:', res)

      if (res.code !== 2000000 || !res.data?.data?.[0]?.accounts?.length) {
        return { isAuthenticated: false }
      }

      // 收集所有子账号
      const allAccounts: SohuAccountInfo[] = []
      for (const group of res.data.data) {
        if (group.accounts) {
          allAccounts.push(...group.accounts)
        }
      }

      if (allAccounts.length === 0) {
        return { isAuthenticated: false }
      }

      // 默认使用第一个子账号
      this.accountInfo = allAccounts[0]
      logger.info(`Using account: ${this.accountInfo.nickName} (id: ${this.accountInfo.id})` +
        (allAccounts.length > 1 ? `, ${allAccounts.length} sub-accounts available` : ''))

      // 获取 mp-cv cookie 用于 sp-cm header
      await this.fetchSpCm()

      // 如果有多个子账号，在用户名中标注
      const displayName = allAccounts.length > 1
        ? `${this.accountInfo.nickName} (共${allAccounts.length}个子账号)`
        : this.accountInfo.nickName

      return {
        isAuthenticated: true,
        userId: String(this.accountInfo.id),
        username: displayName,
        avatar: this.accountInfo.avatar,
      }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  /**
   * 获取 sp-cm 值 (从 cookie 或生成)
   */
  private async fetchSpCm(): Promise<void> {
    try {
      // 尝试通过 runtime 获取 cookie（如果支持）
      if (this.runtime.getCookie) {
        const cookieValue = await this.runtime.getCookie('.sohu.com', 'mp-cv')
        if (cookieValue) {
          this.spCm = cookieValue
          logger.debug('Got sp-cm from cookie:', this.spCm)
          return
        }
      }
      // fallback: 生成一个
      this.spCm = `100-${Date.now()}-${generateDeviceId()}`
      logger.debug('Generated sp-cm:', this.spCm)
    } catch (error) {
      // fallback: 生成一个
      this.spCm = `100-${Date.now()}-${generateDeviceId()}`
      logger.debug('Fallback sp-cm:', this.spCm)
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish...')

      // 1. 确保已登录
      if (!this.accountInfo) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('请先登录搜狐号')
        }
      }

      // Use pre-processed HTML content directly
      let content = article.html || ''

      // Process images
      content = await this.processImages(
        content,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['sohu.com'],
          onProgress: options?.onImageProgress,
        }
      )

      // 4. 保存草稿 (v2 API - JSON 格式)
      const postData = {
        title: article.title,
        brief: '',
        content: content,
        channelId: 24,
        categoryId: -1,
        id: 0,
        userColumnId: 0,
        columnNewsIds: [],
        businessCode: 0,
        declareOriginal: false,
        cover: '',
        topicIds: [],
        isAd: 0,
        userLabels: '[]',
        reprint: false,
        customTags: '',
        infoResource: 0,
        sourceUrl: '',
        visibleToLoginedUsers: 0,
        attrIds: [],
        auto: true,
        accountId: Number(this.accountInfo!.id),
      }

      const response = await this.runtime.fetch(
        `https://mp.sohu.com/mpbp/bp/news/v4/news/draft/v2?accountId=${this.accountInfo!.id}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'dv-id': this.deviceId,
            'sp-cm': this.spCm,
          },
          body: JSON.stringify(postData),
        }
      )

      const res = await response.json() as {
        success: boolean
        data?: string | number
        msg?: string
      }

      logger.debug(' Save response:', res)

      if (!res.success) {
        throw new Error(res.msg || '保存失败')
      }

      const postId = res.data
      const draftUrl = `https://mp.sohu.com/mpfe/v4/contentManagement/news/addarticle?spm=smmp.articlelist.0.0&contentStatus=2&id=${postId}`

      return this.createResult(true, {
        postId: String(postId),
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  /**
   * 通过 URL 上传图片
   */
  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    if (!this.accountInfo) {
      throw new Error('未登录')
    }

    // 1. 下载图片
    const imageResponse = await fetch(src)
    if (!imageResponse.ok) {
      throw new Error('图片下载失败: ' + src)
    }
    const imageBlob = await imageResponse.blob()

    // 2. 上传到搜狐
    const formData = new FormData()
    const filename = imageBlob.type === 'image/svg+xml' ? 'table.svg' : 'image.jpg'
    formData.append('file', imageBlob, filename)
    formData.append('accountId', this.accountInfo.id)

    const uploadResponse = await this.runtime.fetch(
      'https://mp.sohu.com/commons/front/outerUpload/image/file?accountId='+  this.accountInfo.id,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    const res = await uploadResponse.json() as {
      url?: string
      msg?: string
    }

    logger.debug(' Image upload response:', res)
    if (!res.url) {
      throw new Error('图片上传失败:'+ (res.msg))
    }

    return {
      url: res.url,
    }
  }
}
