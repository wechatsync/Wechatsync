import type { RuntimeInterface, RuntimeConfig } from '@wechatsync/core'
import type { Cookie, HeaderRule } from '@wechatsync/core'

/**
 * Chrome 扩展运行时实现
 */
// 默认请求超时：30 秒
const DEFAULT_FETCH_TIMEOUT = 30 * 1000

export class ExtensionRuntime implements RuntimeInterface {
  readonly type = 'extension' as const
  // 使用时间戳+随机数避免规则 ID 冲突（扩展重载或并发场景）
  private ruleIdBase = Date.now() % 100000
  private ruleIdCounter = 0

  constructor(private config?: RuntimeConfig) {}

  /**
   * HTTP 请求 - 自动携带 cookies，带超时保护
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    const timeout = this.config?.timeout ?? DEFAULT_FETCH_TIMEOUT
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        credentials: options?.credentials ?? 'include',
        signal: controller.signal,
      })
      return response
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`请求超时（${timeout / 1000}秒）: ${url}`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Cookie 管理
   */
  cookies = {
    async get(domain: string): Promise<Cookie[]> {
      const cookies = await chrome.cookies.getAll({ domain })
      return cookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        expirationDate: c.expirationDate,
      }))
    },

    async set(cookie: Cookie): Promise<void> {
      await chrome.cookies.set({
        url: `https://${cookie.domain}${cookie.path || '/'}`,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: cookie.expirationDate,
      })
    },

    async remove(name: string, domain: string): Promise<void> {
      await chrome.cookies.remove({
        url: `https://${domain}`,
        name,
      })
    },
  }

  /**
   * 获取单个 Cookie 值（便捷方法）
   */
  async getCookie(domain: string, name: string): Promise<string | null> {
    const cookies = await chrome.cookies.getAll({ domain, name })
    return cookies.length > 0 ? cookies[0].value : null
  }

  /**
   * 持久化存储
   */
  storage = {
    async get<T>(key: string): Promise<T | null> {
      const result = await chrome.storage.local.get(key)
      return (result[key] as T) ?? null
    },

    async set<T>(key: string, value: T): Promise<void> {
      await chrome.storage.local.set({ [key]: value })
    },

    async remove(key: string): Promise<void> {
      await chrome.storage.local.remove(key)
    },
  }

  /**
   * 会话存储
   */
  session = {
    async get<T>(key: string): Promise<T | null> {
      const result = await chrome.storage.session.get(key)
      return (result[key] as T) ?? null
    },

    async set<T>(key: string, value: T): Promise<void> {
      await chrome.storage.session.set({ [key]: value })
    },
  }

  /**
   * Header 规则管理 (declarativeNetRequest)
   * 规则只对扩展自身发起的请求生效，不影响其他网页
   */
  headerRules = {
    add: async (rule: HeaderRule): Promise<string> => {
      // 组合 base + counter 生成唯一 ID，避免冲突
      const ruleId = this.ruleIdBase + this.ruleIdCounter++
      const id = `rule_${ruleId}`

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: ruleId,
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
              requestHeaders: Object.entries(rule.headers).map(
                ([header, value]) => ({
                  header,
                  operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                  value,
                })
              ),
            },
            condition: {
              urlFilter: rule.urlFilter,
              // 只对扩展自身发起的请求生效，不影响其他网页
              initiatorDomains: [chrome.runtime.id],
              resourceTypes: (rule.resourceTypes || [
                'xmlhttprequest',
              ]) as chrome.declarativeNetRequest.ResourceType[],
            },
          },
        ],
      })

      return id
    },

    remove: async (ruleId: string): Promise<void> => {
      const id = parseInt(ruleId.replace('rule_', ''), 10)
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [id],
      })
    },

    clear: async (): Promise<void> => {
      const rules = await chrome.declarativeNetRequest.getDynamicRules()
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
      })
    },
  }

  /**
   * 文件下载
   * Service Worker 中不支持 URL.createObjectURL，使用 data URL 替代
   */
  downloads = {
    async download(blob: Blob, filename: string, saveAs = true): Promise<number> {
      // 将 Blob 转换为 data URL
      const buffer = await blob.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      const mimeType = blob.type || 'application/octet-stream'
      const dataUrl = `data:${mimeType};base64,${base64}`

      const downloadId = await chrome.downloads.download({
        url: dataUrl,
        filename,
        saveAs,
      })
      return downloadId
    },
  }

  /**
   * Tab 管理
   */
  tabs = {
    async query(urlPattern: string): Promise<Array<{ id: number; url?: string }>> {
      const tabs = await chrome.tabs.query({ url: urlPattern })
      return tabs.filter(t => t.id !== undefined).map(t => ({ id: t.id!, url: t.url }))
    },

    async create(url: string, active = false): Promise<{ id: number }> {
      const tab = await chrome.tabs.create({ url, active })
      return { id: tab.id! }
    },

    async waitForLoad(tabId: number, timeout = 30000): Promise<void> {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener)
          reject(new Error('Tab load timeout'))
        }, timeout)

        const listener = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
          if (updatedTabId === tabId && info.status === 'complete') {
            clearTimeout(timeoutId)
            chrome.tabs.onUpdated.removeListener(listener)
            // 额外等待让页面 JS 初始化
            setTimeout(resolve, 1000)
          }
        }
        chrome.tabs.onUpdated.addListener(listener)
      })
    },

    async executeScript<T, A extends unknown[]>(
      tabId: number,
      func: (...args: A) => T | Promise<T>,
      args: A
    ): Promise<T> {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func: func as (...args: unknown[]) => unknown,
        args: args as unknown[],
      })

      const result = results[0]?.result as T
      return result
    },
  }

  /**
   * DOM 操作 - 通过 Offscreen Document 实现
   */
  dom = {
    parseHTML: async (html: string): Promise<Document> => {
      const parser = new DOMParser()
      return parser.parseFromString(html, 'text/html')
    },

    querySelector: (doc: Document, selector: string): Element | null => {
      return doc.querySelector(selector)
    },

    querySelectorAll: (doc: Document, selector: string): Element[] => {
      return Array.from(doc.querySelectorAll(selector))
    },

    getTextContent: (element: Element): string => {
      return element.textContent || ''
    },

    getInnerHTML: (element: Element): string => {
      return element.innerHTML
    },
  }
}

/**
 * 创建扩展运行时实例
 */
export function createExtensionRuntime(config?: RuntimeConfig): ExtensionRuntime {
  return new ExtensionRuntime(config)
}
