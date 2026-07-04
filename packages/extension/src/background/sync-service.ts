/**
 * Sync Service - 同步服务模块
 *
 * 提供完整的文章同步功能，支持 DSL 平台和 CMS 账户。
 * 主要供 MCP 使用，避免 service worker 自己给自己发消息的问题。
 */
import {
  syncToMultiplePlatforms,
  getAllPlatformMetas,
  getPlatformPreprocessConfigs,
  type SyncDetailProgress,
} from '../adapters'
import * as wordpressAdapter from '../adapters/cms/wordpress'
import * as metaweblogAdapter from '../adapters/cms/metaweblog'
import * as devtoAdapter from '../adapters/api-key/devto'
import { createLogger } from '../lib/logger'

const logger = createLogger('SyncService')

// 同步结果类型
export interface SyncResult {
  platform: string
  platformName?: string
  success: boolean
  postUrl?: string
  draftOnly?: boolean
  message?: string
  error?: string
}

// 同步状态类型
type SyncHistoryStatus = 'syncing' | 'completed' | 'failed' | 'cancelled'

// 同步状态
interface ActiveSyncState {
  syncId: string
  status: 'syncing' | 'completed' | 'failed' | 'cancelled'
  article: {
    title: string
    cover?: string
    content?: string
    html?: string
    markdown?: string
  } | null
  selectedPlatforms: string[]
  results: SyncResult[]
  startTime: number
}

// 历史记录项
interface SyncHistoryItem {
  id: string
  status: SyncHistoryStatus
  title: string
  cover?: string
  platforms: string[]
  results: SyncResult[]
  startTime: number
  endTime?: number
}

// 同步配置
interface SyncOptions {
  skipHistory?: boolean
  source?: string
}

// 进度回调
export interface SyncProgressCallbacks {
  onResult?: (result: SyncResult) => void
  onImageProgress?: (platform: string, current: number, total: number) => void
  onDetailProgress?: (progress: SyncDetailProgress) => void
}

const SYNC_STATE_KEY = 'activeSyncState'
const MAX_HISTORY_ITEMS = 25

// Badge 颜色
const BADGE_COLORS = {
  syncing: '#3B82F6',   // 蓝色
  success: '#22C55E',   // 绿色
  error: '#EF4444',     // 红色
  partial: '#F59E0B',   // 橙色
}

/**
 * 生成唯一同步ID
 */
export function generateSyncId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 更新扩展 Badge
 */
async function updateBadge(state: ActiveSyncState | null) {
  if (!state) {
    await chrome.action.setBadgeText({ text: '' })
    return
  }

  if (state.status === 'syncing') {
    // 同步中不显示 badge，避免卡住后残留
    await chrome.action.setBadgeText({ text: '' })
  } else if (state.status === 'completed') {
    const successCount = state.results.filter(r => r.success).length
    const total = state.selectedPlatforms.length
    const failedCount = total - successCount

    if (failedCount === 0) {
      await chrome.action.setBadgeText({ text: '✓' })
      await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.success })
    } else if (successCount === 0) {
      await chrome.action.setBadgeText({ text: '!' })
      await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.error })
    } else {
      await chrome.action.setBadgeText({ text: `${successCount}` })
      await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.partial })
    }

    // 5秒后清除 badge
    setTimeout(async () => {
      const storage = await chrome.storage.local.get(SYNC_STATE_KEY)
      if (storage[SYNC_STATE_KEY]?.status === 'completed') {
        await chrome.action.setBadgeText({ text: '' })
      }
    }, 5000)
  } else if (state.status === 'failed' || state.status === 'cancelled') {
    await chrome.action.setBadgeText({ text: '!' })
    await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.error })

    setTimeout(async () => {
      const storage = await chrome.storage.local.get(SYNC_STATE_KEY)
      if (storage[SYNC_STATE_KEY]?.status === 'failed' || storage[SYNC_STATE_KEY]?.status === 'cancelled') {
        await chrome.action.setBadgeText({ text: '' })
      }
    }, 5000)
  }
}

/**
 * 保存同步状态
 */
async function saveSyncState(state: ActiveSyncState) {
  await chrome.storage.local.set({ [SYNC_STATE_KEY]: state })
  await updateBadge(state)
}

/**
 * 创建同步历史记录
 */
async function createHistoryItem(
  syncId: string,
  article: { title: string; cover?: string },
  platforms: string[]
): Promise<void> {
  try {
    const storage = await chrome.storage.local.get('syncHistory')
    const existingHistory: SyncHistoryItem[] = storage.syncHistory || []

    const historyItem: SyncHistoryItem = {
      id: syncId,
      status: 'syncing',
      title: article.title || '未知文章',
      cover: article.cover,
      platforms,
      results: [],
      startTime: Date.now(),
    }

    const newHistory = [historyItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS)
    await chrome.storage.local.set({ syncHistory: newHistory })
    logger.info('History created:', syncId, historyItem.title)
  } catch (error) {
    logger.error('Failed to create history:', error)
  }
}

/**
 * 更新同步历史记录
 */
async function updateHistoryItem(
  syncId: string,
  status: SyncHistoryStatus,
  results: SyncResult[],
  allPlatformMetas: Array<{ id: string; name: string }>
): Promise<void> {
  try {
    const storage = await chrome.storage.local.get('syncHistory')
    const existingHistory: SyncHistoryItem[] = storage.syncHistory || []

    const resultsWithNames = results.map(r => ({
      ...r,
      platformName: r.platformName || allPlatformMetas.find(p => p.id === r.platform)?.name || r.platform,
    }))

    const updatedHistory = existingHistory.map(item => {
      if (item.id === syncId) {
        return {
          ...item,
          status,
          results: resultsWithNames,
          endTime: Date.now(),
        }
      }
      return item
    })

    await chrome.storage.local.set({ syncHistory: updatedHistory })
    logger.info('History updated:', syncId, status)
  } catch (error) {
    logger.error('Failed to update history:', error)
  }
}

/**
 * 执行文章同步
 *
 * @param article 文章数据
 * @param platforms 目标平台ID列表
 * @param options 同步选项
 * @param callbacks 进度回调
 * @returns 同步结果
 */
export async function performSync(
  article: {
    title: string
    content?: string
    html?: string
    markdown?: string
    cover?: string
  },
  platforms: string[],
  options: SyncOptions = {},
  callbacks: SyncProgressCallbacks = {}
): Promise<{ results: SyncResult[]; syncId: string }> {
  const { skipHistory = false, source = 'mcp' } = options
  const { onResult, onImageProgress, onDetailProgress } = callbacks

  const allPlatformMetas = getAllPlatformMetas()
  const platformNameById = new Map(allPlatformMetas.map(meta => [meta.id, meta.name]))
  const syncId = generateSyncId()

  // 规范化文章对象，确保必需字段有默认值
  const normalizedArticle = {
    title: article.title,
    content: article.content || article.html || '',
    html: article.html || article.content || '',
    markdown: article.markdown || '',
    cover: article.cover,
  }

  // 获取 CMS 账户信息以区分 DSL 和 CMS
  const cmsStorage = await chrome.storage.local.get('cmsAccounts')
  const cmsAccounts = cmsStorage.cmsAccounts || []
  const cmsAccountIds = new Set(cmsAccounts.map((a: any) => a.id))

  // 分离 DSL 平台和 CMS 账户
  const dslPlatformIds = platforms.filter((id: string) => !cmsAccountIds.has(id))
  const cmsPlatformIds = platforms.filter((id: string) => cmsAccountIds.has(id))

  // 初始化同步状态
  const syncState: ActiveSyncState = {
    syncId,
    status: 'syncing',
    article: {
      title: normalizedArticle.title,
      cover: normalizedArticle.cover,
      content: normalizedArticle.content,
      html: normalizedArticle.html,
      markdown: normalizedArticle.markdown,
    },
    selectedPlatforms: platforms,
    results: [],
    startTime: Date.now(),
  }
  await saveSyncState(syncState)

  // 创建历史记录
  if (!skipHistory) {
    await createHistoryItem(syncId, normalizedArticle, platforms)
  }

  // 预处理内容（与 SYNC_ARTICLE 路径一致）
  // MCP/CLI 路径没有 senderTabId，需要找一个可用 tab 做 DOM 预处理
  // 同源平台跳过预处理（如微信到微信）
  const sourcePlatform = (article as any).source?.platform
  const platformsToPreprocess = dslPlatformIds.filter((id: string) => id !== sourcePlatform)
  let processedArticle: typeof normalizedArticle & { platformContents?: Record<string, { html: string; markdown: string }> } = normalizedArticle
  if (platformsToPreprocess.length > 0) {
    const configs = getPlatformPreprocessConfigs(platformsToPreprocess)
    // CLI/MCP 来源的 HTML 保留 <style> 标签（用户自定义排版）
    if (source === 'mcp') {
      for (const key of Object.keys(configs)) {
        configs[key] = { ...configs[key], keepStyles: true }
      }
    }
    const rawHtml = normalizedArticle.html || normalizedArticle.content || ''
    if (rawHtml) {
      const preprocessResult = await sendPreprocessMessage(rawHtml, platformsToPreprocess, configs)
      if (preprocessResult) {
        processedArticle = { ...normalizedArticle, platformContents: preprocessResult }
        logger.debug('Preprocessed for platforms:', Object.keys(preprocessResult))
      } else {
        logger.warn('DOM preprocessing unavailable — please ensure at least one web page is open in Chrome')
      }
    }
  }

  const allResults: SyncResult[] = []

  // 同步到 DSL 平台
  if (dslPlatformIds.length > 0) {
    await syncToMultiplePlatforms(dslPlatformIds, processedArticle, {
      onResult: (result) => {
        const resultWithName: SyncResult = {
          ...result,
          platformName: platformNameById.get(result.platform) || result.platform,
        }
        syncState.results.push(resultWithName)
        allResults.push(resultWithName)
        saveSyncState(syncState).catch(() => {})

        onResult?.(resultWithName)
      },
      onImageProgress: (platform, current, total) => {
        onImageProgress?.(platform, current, total)
      },
      onDetailProgress: (progress: SyncDetailProgress) => {
        onDetailProgress?.(progress)
      },
    }, source)
  }

  // 同步到 CMS 账户
  for (const accountId of cmsPlatformIds) {
    const account = cmsAccounts.find((a: any) => a.id === accountId)
    if (!account) {
      const cmsResult: SyncResult = {
        platform: accountId,
        platformName: platformNameById.get(accountId) || accountId,
        success: false,
        error: 'CMS 账户不存在',
      }
      allResults.push(cmsResult)
      syncState.results.push(cmsResult)
      saveSyncState(syncState).catch(() => {})
      onResult?.(cmsResult)
      onDetailProgress?.({ platform: accountId, platformName: cmsResult.platformName || accountId, stage: 'failed', error: cmsResult.error })
      continue
    }

    onDetailProgress?.({ platform: accountId, platformName: account.name, stage: 'starting' })

    try {
      const passwordStorage = await chrome.storage.local.get(`cms_pwd_${accountId}`)
      const password = passwordStorage[`cms_pwd_${accountId}`]

      if (!password) {
        const cmsResult: SyncResult = {
          platform: accountId,
          platformName: account.name,
          success: false,
          error: '密码未找到',
        }
        allResults.push(cmsResult)
        syncState.results.push(cmsResult)
        saveSyncState(syncState).catch(() => {})
        onResult?.(cmsResult)
        onDetailProgress?.({ platform: accountId, platformName: account.name, stage: 'failed', error: '密码未找到' })
        continue
      }

      onDetailProgress?.({ platform: accountId, platformName: account.name, stage: 'saving' })

      const credentials = { url: account.url, username: account.username, password }
      let result

      // MCP/CLI 同步复用配置账号存储，API Key 平台按 provider 分发
      if (account.kind === 'apiKey' && account.provider === 'devto') {
        result = await devtoAdapter.publish({ apiKey: password }, normalizedArticle, { draftOnly: true })
      } else {
        switch (account.type) {
          case 'wordpress':
            result = await wordpressAdapter.publish(credentials, normalizedArticle, { draftOnly: true })
            break
          case 'typecho':
            result = await metaweblogAdapter.publishToTypecho(credentials, normalizedArticle, { draftOnly: true })
            break
          case 'metaweblog':
            result = await metaweblogAdapter.publish(credentials, normalizedArticle, { draftOnly: true })
            break
          default:
            result = { success: false, error: '不支持的配置账号类型' }
        }
      }

      const cmsResult: SyncResult = {
        platform: accountId,
        platformName: account.name,
        success: result.success,
        postUrl: result.postUrl,
        draftOnly: true,
        message: result.message,
        error: result.error,
      }
      allResults.push(cmsResult)
      syncState.results.push(cmsResult)
      saveSyncState(syncState).catch(() => {})
      onResult?.(cmsResult)
      onDetailProgress?.({
        platform: accountId,
        platformName: account.name,
        stage: result.success ? 'completed' : 'failed',
        error: result.error,
      })
    } catch (error) {
      const cmsResult: SyncResult = {
        platform: accountId,
        platformName: account.name,
        success: false,
        error: (error as Error).message,
      }
      allResults.push(cmsResult)
      syncState.results.push(cmsResult)
      saveSyncState(syncState).catch(() => {})
      onResult?.(cmsResult)
      onDetailProgress?.({ platform: accountId, platformName: account.name, stage: 'failed', error: (error as Error).message })
    }
  }

  // 确定最终状态
  const successCount = allResults.filter(r => r.success).length
  const failedCount = allResults.length - successCount
  const finalStatus: SyncHistoryStatus =
    allResults.length === 0 && platforms.length > 0
      ? 'failed'
      : failedCount === allResults.length && allResults.length > 0
        ? 'failed'
        : 'completed'

  // 更新为完成状态
  syncState.status = finalStatus
  await saveSyncState(syncState)

  // 更新历史记录
  if (!skipHistory) {
    await updateHistoryItem(syncId, finalStatus, allResults, allPlatformMetas)
  }

  return { results: allResults, syncId }
}

/**
 * 查找可用 tab 并发送 PREPROCESS_FOR_PLATFORMS 消息
 * 优先 active tab，否则遍历所有 http/https tab
 */
async function sendPreprocessMessage(
  rawHtml: string,
  platforms: string[],
  configs: Record<string, unknown>
): Promise<Record<string, { html: string; markdown: string }> | null> {
  const message = {
    type: 'PREPROCESS_FOR_PLATFORMS',
    payload: { rawHtml, platforms, configs },
  }

  // 1. 优先尝试已有的 tab（content script 响应最快）
  try {
    const candidateTabIds: number[] = []

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (activeTab?.id && activeTab.url?.match(/^https?:\/\//)) {
      candidateTabIds.push(activeTab.id)
    }

    const allTabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] })
    for (const tab of allTabs) {
      if (tab.id && !candidateTabIds.includes(tab.id)) {
        candidateTabIds.push(tab.id)
      }
    }

    for (const tabId of candidateTabIds) {
      try {
        const response = await chrome.tabs.sendMessage(tabId, message)
        if (response?.platformContents) return response.platformContents
      } catch {
        continue
      }
    }
  } catch (error) {
    logger.debug('Tab preprocess failed:', error)
  }

  // 2. 没有可用 tab，创建临时扩展页面 tab 用于预处理
  return await preprocessViaTemporaryTab(message)
}

const PREPROCESSOR_URL = chrome.runtime.getURL('src/preprocessor/index.html')

/**
 * 创建临时最小化窗口加载预处理页面，处理完后关闭
 * 使用独立窗口避免在用户 tab 栏闪烁
 */
async function preprocessViaTemporaryTab(
  message: { type: string; payload: unknown }
): Promise<Record<string, { html: string; markdown: string }> | null> {
  let windowId: number | undefined
  let tabId: number | undefined
  try {
    const win = await chrome.windows.create({
      url: PREPROCESSOR_URL,
      type: 'popup',
      width: 1,
      height: 1,
      left: 0,
      top: 0,
      focused: false,
    })
    windowId = win.id
    tabId = win.tabs?.[0]?.id
    if (!tabId) return null

    // 等待 tab 加载完成
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener)
        reject(new Error('Tab load timeout'))
      }, 5000)
      const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
        if (id === tabId && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)
          clearTimeout(timeout)
          resolve()
        }
      }
      chrome.tabs.onUpdated.addListener(listener)
    })

    const response = await chrome.tabs.sendMessage(tabId, message)
    if (response?.platformContents) {
      logger.debug('Preprocessed via temporary window')
      return response.platformContents
    }
    return null
  } catch (error) {
    logger.debug('Temporary window preprocess failed:', error)
    return null
  } finally {
    if (windowId) {
      chrome.windows.remove(windowId).catch(() => {})
    }
  }
}

