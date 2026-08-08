/**
 * Sync Service - 同步服务模块
 *
 * 提供完整的文章同步功能，支持 DSL 平台和 CMS 账户。
 * background/index.ts 的消息处理器和 MCP 客户端共用此模块。
 */
import {
  syncToMultiplePlatforms,
  getAllPlatformMetas,
  getPlatformPreprocessConfigs,
  type SyncDetailProgress,
} from '../adapters'
import { DEFAULT_PREPROCESS_CONFIG } from '@wechatsync/core'
import * as wordpressAdapter from '../adapters/cms/wordpress'
import * as metaweblogAdapter from '../adapters/cms/metaweblog'
import { createLogger } from '../lib/logger'

const logger = createLogger('SyncService')

export interface SyncResult {
  platform: string
  platformName?: string
  success: boolean
  postUrl?: string
  draftOnly?: boolean
  message?: string
  error?: string
}

export type SyncHistoryStatus = 'syncing' | 'completed' | 'failed' | 'cancelled'

export interface ActiveSyncState {
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

interface SyncOptions {
  skipHistory?: boolean
  source?: string
  syncId?: string
  allSelectedPlatforms?: string[]
}

export interface SyncProgressCallbacks {
  onResult?: (result: SyncResult) => void
  onImageProgress?: (platform: string, current: number, total: number) => void
  onDetailProgress?: (progress: SyncDetailProgress) => void
}

export const SYNC_STATE_KEY = 'activeSyncState'
const MAX_HISTORY_ITEMS = 25

export const BADGE_COLORS = {
  syncing: '#3B82F6',
  success: '#22C55E',
  error: '#EF4444',
  partial: '#F59E0B',
  update: '#8B5CF6',
}

export function generateSyncId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function updateBadge(state: ActiveSyncState | null) {
  if (!state) {
    await chrome.action.setBadgeText({ text: '' })
    return
  }

  if (state.status === 'syncing') {
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

export async function saveSyncState(state: ActiveSyncState) {
  await chrome.storage.local.set({ [SYNC_STATE_KEY]: state })
  await updateBadge(state)
}

export async function clearSyncState() {
  await chrome.storage.local.remove(SYNC_STATE_KEY)
  await chrome.action.setBadgeText({ text: '' })
}

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

export async function performSync(
  article: {
    title: string
    content?: string
    html?: string
    markdown?: string
    cover?: string
    source?: { platform?: string }
    platformContents?: Record<string, { html: string; markdown: string }>
  },
  platforms: string[],
  options: SyncOptions = {},
  callbacks: SyncProgressCallbacks = {}
): Promise<{ results: SyncResult[]; syncId: string }> {
  const { skipHistory = false, source = 'mcp', syncId: passedSyncId, allSelectedPlatforms } = options
  const { onResult, onImageProgress, onDetailProgress } = callbacks

  const allPlatformMetas = getAllPlatformMetas()
  const platformNameById = new Map(allPlatformMetas.map(meta => [meta.id, meta.name]))
  const syncId = passedSyncId || generateSyncId()

  // 展开保留原字段（source/rawHtml 等），微信→微信快路径依赖 source.platform + rawHtml
  const normalizedArticle = {
    ...article,
    content: article.content || article.html || '',
    html: article.html || article.content || '',
    markdown: article.markdown || '',
  }

  const cmsStorage = await chrome.storage.local.get('cmsAccounts')
  const cmsAccounts = cmsStorage.cmsAccounts || []
  const cmsAccountIds = new Set(cmsAccounts.map((a: any) => a.id))

  const dslPlatformIds = platforms.filter((id: string) => !cmsAccountIds.has(id))
  const cmsPlatformIds = platforms.filter((id: string) => cmsAccountIds.has(id))

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
    selectedPlatforms: allSelectedPlatforms || platforms,
    results: [],
    startTime: Date.now(),
  }
  await saveSyncState(syncState)

  if (!skipHistory) {
    await createHistoryItem(syncId, normalizedArticle, platforms)
  }

  const sourcePlatform = article.source?.platform
  const { deepCleanEnabled = false } = await chrome.storage.local.get('deepCleanEnabled')
  let processedArticle: any = normalizedArticle

  if (!article.platformContents) {
    const platformsToPreprocess = dslPlatformIds.filter((id: string) => id !== sourcePlatform)
    if (platformsToPreprocess.length > 0) {
      const configs = getPlatformPreprocessConfigs(platformsToPreprocess)
      // 用户设置覆盖 normalizeViaMarkdown，微信来源始终跳过
      for (const key of Object.keys(configs)) {
        configs[key] = {
          ...configs[key],
          normalizeViaMarkdown: sourcePlatform === 'weixin' ? false : deepCleanEnabled,
        }
      }
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
  }

  const allResults: SyncResult[] = []

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

  // CMS 内容也需要源平台链接清理，走 content script 预处理
  let cmsArticle = normalizedArticle
  if (cmsPlatformIds.length > 0) {
    const rawHtml = normalizedArticle.html || normalizedArticle.content || ''
    if (rawHtml) {
      // CMS 只需要源平台链接清理，关闭破坏性选项（旧版 CMS 内容是原样直传的）
      const cmsConfigs: Record<string, unknown> = {
        _cms: {
          ...DEFAULT_PREPROCESS_CONFIG,
          removeIframes: false,
          removeSpecialTags: false,
          removeSvgImages: false,
          keepStyles: true,
        },
      }
      const cmsPreprocessed = await sendPreprocessMessage(rawHtml, ['_cms'], cmsConfigs)
      if (cmsPreprocessed?._cms) {
        cmsArticle = { ...normalizedArticle, content: cmsPreprocessed._cms.html, html: cmsPreprocessed._cms.html }
      }
    }
  }

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

      switch (account.type) {
        case 'wordpress':
          result = await wordpressAdapter.publish(credentials, cmsArticle, { draftOnly: true })
          break
        case 'typecho':
          result = await metaweblogAdapter.publishToTypecho(credentials, cmsArticle, { draftOnly: true })
          break
        case 'metaweblog':
          result = await metaweblogAdapter.publish(credentials, cmsArticle, { draftOnly: true })
          break
        default:
          result = { success: false, error: '不支持的 CMS 类型' }
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

  const successCount = allResults.filter(r => r.success).length
  const failedCount = allResults.length - successCount
  const finalStatus: SyncHistoryStatus =
    allResults.length === 0 && platforms.length > 0
      ? 'failed'
      : failedCount === allResults.length && allResults.length > 0
        ? 'failed'
        : 'completed'

  syncState.status = finalStatus
  await saveSyncState(syncState)

  if (!skipHistory) {
    await updateHistoryItem(syncId, finalStatus, allResults, allPlatformMetas)
  }

  return { results: allResults, syncId }
}

async function sendPreprocessMessage(
  rawHtml: string,
  platforms: string[],
  configs: Record<string, unknown>
): Promise<Record<string, { html: string; markdown: string }> | null> {
  const message = {
    type: 'PREPROCESS_FOR_PLATFORMS',
    payload: { rawHtml, platforms, configs },
  }

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

  return await preprocessViaTemporaryTab(message)
}

const PREPROCESSOR_URL = chrome.runtime.getURL('src/preprocessor/index.html')

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

