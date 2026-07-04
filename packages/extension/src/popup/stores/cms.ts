import { create } from 'zustand'
import { createLogger } from '../../lib/logger'

const logger = createLogger('CMSStore')

export type CMSType = 'wordpress' | 'typecho' | 'metaweblog'
// 配置账号类型：CMS 与 API Key 平台复用同一套本地管理入口
export type ConfigAccountKind = 'cms' | 'apiKey'
// API Key 平台标识，当前仅支持 dev.to
export type ApiKeyProvider = 'devto'

export interface CMSAccount {
  id: string
  // 旧账号没有 kind 字段，缺省按 CMS 处理
  kind?: ConfigAccountKind
  type?: CMSType
  provider?: ApiKeyProvider
  name: string
  url?: string
  username?: string
  // 密码存储在 chrome.storage.local 中，不在状态里
  isConnected: boolean
  lastError?: string
}

type AddAccountInput = Omit<CMSAccount, 'id' | 'isConnected'> & { password: string }

interface CMSState {
  accounts: CMSAccount[]
  loading: boolean

  loadAccounts: () => Promise<void>
  addAccount: (account: AddAccountInput) => Promise<{ success: boolean; error?: string }>
  removeAccount: (id: string) => Promise<void>
  testConnection: (id: string) => Promise<{ success: boolean; error?: string }>
}

export const useCMSStore = create<CMSState>((set) => ({
  accounts: [],
  loading: false,

  loadAccounts: async () => {
    set({ loading: true })
    try {
      const storage = await chrome.storage.local.get('cmsAccounts')
      const accounts = storage.cmsAccounts || []
      set({ accounts, loading: false })
    } catch (error) {
      logger.error('Failed to load CMS accounts:', error)
      set({ loading: false })
    }
  },

  addAccount: async (accountData) => {
    try {
      // 直接从 storage 读取，避免 Zustand state 未加载导致覆盖
      const storage = await chrome.storage.local.get('cmsAccounts')
      const accounts: CMSAccount[] = storage.cmsAccounts || []
      // API Key 平台使用 provider 前缀，避免在 CLI 中显示为 cms_xxx
      const id = accountData.kind === 'apiKey' && accountData.provider
        ? `${accountData.provider}_${Date.now()}`
        : `cms_${Date.now()}`

      const newAccount: CMSAccount = {
        id,
        // 兼容旧 CMS 账号：未传 kind 时仍按 CMS 保存
        kind: accountData.kind || 'cms',
        type: accountData.type,
        provider: accountData.provider,
        name: accountData.name,
        url: accountData.url,
        username: accountData.username,
        isConnected: false,
      }

      // 测试连接
      const testResult = await chrome.runtime.sendMessage({
        type: 'TEST_CMS_CONNECTION',
        payload: {
          // 测试连接时带上 kind/provider，让 background 能分流到 API Key 适配器
          kind: accountData.kind || 'cms',
          type: accountData.type,
          provider: accountData.provider,
          url: accountData.url,
          username: accountData.username,
          password: accountData.password,
        },
      })

      if (!testResult.success) {
        return { success: false, error: testResult.error || '连接失败' }
      }

      newAccount.isConnected = true

      // 保存账户信息
      const updatedAccounts = [...accounts, newAccount]
      await chrome.storage.local.set({ cmsAccounts: updatedAccounts })

      // 单独保存密码 (加密存储)
      await chrome.storage.local.set({ [`cms_pwd_${id}`]: accountData.password })

      set({ accounts: updatedAccounts })
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },

  removeAccount: async (id: string) => {
    try {
      // 直接从 storage 读取，避免 state 未加载导致覆盖
      const storage = await chrome.storage.local.get('cmsAccounts')
      const accounts: CMSAccount[] = storage.cmsAccounts || []
      const updatedAccounts = accounts.filter(a => a.id !== id)
      await chrome.storage.local.set({ cmsAccounts: updatedAccounts })
      await chrome.storage.local.remove(`cms_pwd_${id}`)
      set({ accounts: updatedAccounts })
    } catch (error) {
      logger.error('Failed to remove CMS account:', error)
    }
  },

  testConnection: async (id: string) => {
    try {
      // 直接从 storage 读取，确保数据最新
      const storage = await chrome.storage.local.get(['cmsAccounts', `cms_pwd_${id}`])
      const accounts: CMSAccount[] = storage.cmsAccounts || []
      const account = accounts.find(a => a.id === id)
      if (!account) {
        return { success: false, error: '账户不存在' }
      }

      const password = storage[`cms_pwd_${id}`]

      const result = await chrome.runtime.sendMessage({
        type: 'TEST_CMS_CONNECTION',
        payload: {
          // 重新测试旧账号时缺省为 CMS，避免破坏已有配置
          kind: account.kind || 'cms',
          type: account.type,
          provider: account.provider,
          url: account.url,
          username: account.username,
          password,
        },
      })

      // 更新连接状态
      const updatedAccounts = accounts.map(a =>
        a.id === id
          ? { ...a, isConnected: result.success, lastError: result.error }
          : a
      )
      await chrome.storage.local.set({ cmsAccounts: updatedAccounts })
      set({ accounts: updatedAccounts })

      return result
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },
}))
