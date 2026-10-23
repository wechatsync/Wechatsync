/**
 * 代码适配器基类
 *
 * 架构说明:
 * - Content Script (有 DOM): 负责所有 HTML/DOM 处理
 *   - 代码块处理 (使用 innerText)
 *   - 懒加载图片处理
 *   - HTML 转 Markdown
 * - Service Worker (无 DOM): 只负责 API 调用
 *   - 接收已处理好的 html 和 markdown
 *   - 图片上传 (URL 替换，不需要 DOM)
 *   - 调用平台 API
 *
 * 适配器接收的 Article 对象:
 * - article.html: 已预处理的 HTML (代码块已简化，图片已处理)
 * - article.markdown: 已转换的 Markdown
 *
 * 适配器只需:
 * 1. 选择使用 html 还是 markdown
 * 2. 处理图片上传 (如果平台需要)
 * 3. 调用平台 API
 */
import type { Article, AuthResult, SyncResult, PlatformMeta, HeaderRule } from '../types'
import type { RuntimeInterface } from '../runtime/interface'
import type { PlatformAdapter, PublishOptions } from './types'
import { createLogger } from '../lib/logger'
import { parseMarkdownImages } from '../lib/markdown-images'

const logger = createLogger('CodeAdapter')

/**
 * 图片上传结果
 */
export interface ImageUploadResult {
  /** 新的图片 URL */
  url: string
  /** 额外的 img 属性 */
  attrs?: Record<string, string | number>
}

/**
 * 图片处理选项
 */
export interface ImageProcessOptions {
  /** 跳过匹配这些模式的图片 */
  skipPatterns?: string[]
  /** 进度回调 */
  onProgress?: (current: number, total: number) => void
}

/**
 * 代码适配器基类
 */
export abstract class CodeAdapter implements PlatformAdapter {
  abstract readonly meta: PlatformMeta
  protected runtime!: RuntimeInterface

  /** Header 规则 ID 列表（用于请求拦截） */
  protected headerRuleIds: string[] = []

  async init(runtime: RuntimeInterface): Promise<void> {
    this.runtime = runtime
  }

  // ============ 抽象方法，子类必须实现 ============

  abstract checkAuth(): Promise<AuthResult>
  abstract publish(article: Article, options?: PublishOptions): Promise<SyncResult>

  // ============ Header 规则管理 ============

  /**
   * 添加 Header 规则
   * @param rule 规则配置
   * @returns 规则 ID
   */
  protected async addHeaderRule(rule: Omit<HeaderRule, 'id'>): Promise<string | null> {
    if (!this.runtime.headerRules) return null

    const ruleId = await this.runtime.headerRules.add(rule)
    this.headerRuleIds.push(ruleId)
    return ruleId
  }

  /**
   * 批量添加 Header 规则
   * @param rules 规则配置列表
   */
  protected async addHeaderRules(rules: Array<Omit<HeaderRule, 'id'>>): Promise<void> {
    for (const rule of rules) {
      await this.addHeaderRule(rule)
    }
    if (this.headerRuleIds.length > 0) {
      logger.debug(`[${this.meta.id}] Header rules added:`, this.headerRuleIds)
    }
  }

  /**
   * 清除所有已添加的 Header 规则
   */
  protected async clearHeaderRules(): Promise<void> {
    if (!this.runtime.headerRules || this.headerRuleIds.length === 0) return

    for (const ruleId of this.headerRuleIds) {
      await this.runtime.headerRules.remove(ruleId)
    }
    logger.debug(`[${this.meta.id}] Header rules cleared:`, this.headerRuleIds)
    this.headerRuleIds = []
  }

  /**
   * 在 Header 规则保护下执行操作
   * 自动设置规则，执行完成后自动清除
   * @param rules 规则配置列表
   * @param fn 要执行的操作
   */
  protected async withHeaderRules<T>(
    rules: Array<Omit<HeaderRule, 'id'>>,
    fn: () => Promise<T>
  ): Promise<T> {
    await this.addHeaderRules(rules)
    try {
      return await fn()
    } finally {
      await this.clearHeaderRules()
    }
  }

  // ============ HTTP 请求能力 ============

  /**
   * GET 请求
   */
  protected async get<T = unknown>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.runtime.fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })
    return this.parseResponse<T>(response)
  }

  /**
   * POST 请求 (JSON)
   */
  protected async postJson<T = unknown>(
    url: string,
    data: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.runtime.fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    return this.parseResponse<T>(response)
  }

  /**
   * POST 请求 (Form)
   */
  protected async postForm<T = unknown>(
    url: string,
    data: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.runtime.fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      },
      body: new URLSearchParams(data),
    })
    return this.parseResponse<T>(response)
  }

  /**
   * POST 请求 (Multipart)
   */
  protected async postMultipart<T = unknown>(
    url: string,
    formData: FormData,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.runtime.fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    })
    return this.parseResponse<T>(response)
  }

  /**
   * 解析响应
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()

    // 尝试解析 JSON
    try {
      return JSON.parse(text) as T
    } catch {
      return text as T
    }
  }

  // ============ 图片处理能力 ============

  /**
   * 处理文章图片 (使用正则提取 URL，兼容 Service Worker)
   * 同时支持 HTML 和 Markdown 格式
   * - HTML: <img src="url" alt="text">
   * - Markdown: ![text](url)
   *
   * 注意: 这个方法只做 URL 提取和替换，不涉及 DOM 解析
   */
  protected async processImages(
    content: string,
    uploadFn: (src: string) => Promise<ImageUploadResult>,
    options?: ImageProcessOptions
  ): Promise<string> {
    const { skipPatterns = [], onProgress } = options || {}

    // 提取所有图片（HTML + Markdown）
    const matches: { full: string; src: string; alt?: string; type: 'html' | 'markdown' }[] = []

    // 1. HTML 格式: <img ... src="url" ...> (兼容双引号、单引号、无引号)
    // 无引号分支限定 URL 形态，避免把 alt 等属性值里的 "src=" 误当作图片地址
    const htmlImgRegex = /<img[^>]+src=(?:"([^"]*)"|'([^']*)'|((?:https?:)?\/\/[^\s>"']+|data:[^\s>"']+))[^>]*>/gi
    let match
    while ((match = htmlImgRegex.exec(content)) !== null) {
      const src = match[1] || match[2] || match[3]
      if (src) matches.push({ full: match[0], src, type: 'html' })
    }

    // 2. Markdown 格式: ![alt](url)
    for (const mdMatch of parseMarkdownImages(content)) {
      matches.push({ full: mdMatch.full, src: mdMatch.src, alt: mdMatch.alt, type: 'markdown' })
    }

    if (matches.length === 0) {
      return content
    }

    logger.debug(`Found ${matches.length} images to process (HTML + Markdown)`)

    let result = content
    const uploadedMap = new Map<string, ImageUploadResult>()
    let processed = 0

    for (const { full, src, alt, type } of matches) {
      // 跳过空 src
      if (!src) continue

      // 跳过匹配的模式（但不跳过 data URI）
      if (!src.startsWith('data:')) {
        const shouldSkip = skipPatterns.some(pattern => src.includes(pattern))
        if (shouldSkip) {
          logger.debug(`Skipping matched pattern: ${src}`)
          continue
        }
      }

      processed++
      onProgress?.(processed, matches.length)

      try {
        // 检查是否已上传过
        let uploadResult = uploadedMap.get(src)

        if (!uploadResult) {
          logger.debug(`Uploading image ${processed}/${matches.length}: ${src.startsWith('data:') ? 'data URI' : src}`)
          // uploadFn 应该能处理 URL 和 data URI（通过 fetch）
          uploadResult = await uploadFn(src)
          uploadedMap.set(src, uploadResult)
        }

        // 根据格式构建替换内容
        let replacement: string
        if (type === 'html') {
          // HTML 格式
          replacement = `<img src="${uploadResult.url}"`
          if (uploadResult.attrs) {
            for (const [key, value] of Object.entries(uploadResult.attrs)) {
              replacement += ` ${key}="${value}"`
            }
          }
          replacement += ' />'
        } else {
          // Markdown 格式
          replacement = `![${alt || ''}](${uploadResult.url})`
        }

        // 替换原内容
        result = result.replace(full, replacement)

        logger.debug(`Image uploaded: ${uploadResult.url}`)
      } catch (error) {
        logger.error(`Failed to upload image: ${src}`, error)
        // 继续处理其他图片
      }

      // 避免请求过快
      await this.delay(300)
    }

    return result
  }

  /**
   * 上传图片（子类实现）
   * 默认实现抛出错误
   */
  protected async uploadImageByUrl(_src: string): Promise<ImageUploadResult> {
    throw new Error('uploadImageByUrl not implemented')
  }

  /**
   * 通过 Blob 上传图片（公开方法，实现 PlatformAdapter 接口）
   * 默认实现：转为 data URI，调用 uploadImageByUrl
   * 子类可以覆盖以提供更优的实现
   */
  async uploadImage(file: Blob, _filename?: string): Promise<string> {
    const dataUri = await this.blobToDataUri(file)
    const result = await this.uploadImageByUrl(dataUri)
    return result.url
  }

  /**
   * Blob 转 data URI
   */
  protected async blobToDataUri(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('Failed to read blob as data URI'))
        }
      }
      reader.onerror = () => reject(new Error('FileReader error'))
      reader.readAsDataURL(blob)
    })
  }

  /**
   * data URI 转 Blob
   */
  protected async dataUriToBlob(dataUri: string): Promise<Blob> {
    const response = await fetch(dataUri)
    return response.blob()
  }

  // ============ 工具方法 ============

  /**
   * 延迟
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 创建同步结果
   */
  protected createResult(success: boolean, data?: Partial<SyncResult>): SyncResult {
    return {
      platform: this.meta.id,
      success,
      timestamp: Date.now(),
      ...data,
    }
  }
}
