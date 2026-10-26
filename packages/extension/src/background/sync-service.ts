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
import { DEFAULT_PREPROCESS_CONFIG, markdownToHtml } from '@wechatsync/core'
import * as wordpressAdapter from '../adapters/cms/wordpress'
import * as metaweblogAdapter from '../adapters/cms/metaweblog'
import { createLogger } from '../lib/logger'
import { countInlineSvg, countMermaidCodeBlocks, htmlMayContainMermaid, htmlMayContainSvg } from '../lib/mermaid-detect'

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
  // 只有 markdown 时转成 HTML，避免 CMS 等依赖 HTML 的链路拿到空正文
  const fallbackHtml = !article.content && !article.html && article.markdown
    ? markdownToHtml(article.markdown)
    : ''
  const normalizedArticle = {
    ...article,
    content: article.content || article.html || fallbackHtml,
    html: article.html || article.content || fallbackHtml,
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
  // 预处理/渲染过程中的问题要能被用户看到，不能静默降级
  const warnings: string[] = []

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
        // 含 Mermaid 代码块时必须在扩展页面里渲染成图片
        // （mermaid 库没有打进常驻 content script，只有扩展页面才有）
        const renderMermaid = htmlMayContainMermaid(rawHtml)
        // 含矢量图时必须在扩展页面里转成 PNG（微信会丢弃 SVG）
        const rasterizeSvg = htmlMayContainSvg(rawHtml)
        if (renderMermaid) {
          logger.info('检测到 Mermaid 代码块，将在扩展页面中渲染为图片')
        }
        if (rasterizeSvg) {
          logger.info('检测到矢量图（SVG），将在扩展页面中转换为 PNG 图片')
        }
        const preprocessResult = await sendPreprocessMessage(rawHtml, platformsToPreprocess, configs, {
          renderMermaid,
          rasterizeSvg,
        })
        if (preprocessResult?.platformContents) {
          processedArticle = { ...normalizedArticle, platformContents: preprocessResult.platformContents }
          logger.debug('Preprocessed for platforms:', Object.keys(preprocessResult.platformContents))

          const mermaidSummary = preprocessResult.mermaid
          if (mermaidSummary) {
            logger.info(
              `图表转换统计: 成功 ${mermaidSummary.rendered} 个，失败 ${mermaidSummary.failed} 个`
            )
            if (mermaidSummary.failed > 0) {
              warnings.push(
                `${mermaidSummary.failed} 个图表转换失败：${mermaidSummary.errors[0] || '未知原因'}`
              )
            }
          }

          // 兜底：预处理之后仍然以代码块形式存在的 Mermaid，
          // 说明这些流程图没能变成图片，必须让用户看到
          let leftoverMermaid = 0
          for (const id of platformsToPreprocess) {
            const count = countMermaidCodeBlocks(preprocessResult.platformContents[id]?.html || '')
            if (count > leftoverMermaid) leftoverMermaid = count
          }
          if (leftoverMermaid > 0) {
            logger.warn('仍有 Mermaid 代码块未转换成图片:', leftoverMermaid)
            warnings.push(`${leftoverMermaid} 个 Mermaid 图未能转换成图片（仍以代码块保留）`)
          }

          // 兜底：还有内联 SVG 的话，微信会把它们直接丢掉（正文出现空白缺口）
          let leftoverSvg = 0
          for (const id of platformsToPreprocess) {
            const count = countInlineSvg(preprocessResult.platformContents[id]?.html || '')
            if (count > leftoverSvg) leftoverSvg = count
          }
          if (leftoverSvg > 0) {
            logger.warn('仍有矢量图未转换成图片:', leftoverSvg)
            warnings.push(`${leftoverSvg} 个图形未能转换成图片（微信不支持 SVG 格式）`)
          }

          // 兜底：原文里的 Mermaid 代码块数量与渲染阶段处理的数量对不上，
          // 说明有流程图连尝试都没尝试，直接消失了，必须告诉用户
          const sourceMermaid = countMermaidCodeBlocks(rawHtml)
          const handled = mermaidSummary ? mermaidSummary.rendered + mermaidSummary.failed : 0
          if (sourceMermaid > handled) {
            const missing = sourceMermaid - handled
            logger.warn('有 Mermaid 代码块未被渲染处理:', missing)
            warnings.push(`${missing} 个 Mermaid 图被跳过（未能识别为流程图）`)
          }
        } else {
          const reason = preprocessResult?.error || '无法在扩展页面中完成 DOM 预处理'
          logger.warn('DOM preprocessing unavailable:', reason)
          warnings.push(
            renderMermaid || rasterizeSvg
              ? `DOM 预处理失败（${reason}），图表未能转换成图片`
              : `DOM 预处理失败（${reason}），正文可能未按平台规则清理`
          )
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
        // 把预处理/渲染过程中的问题带到结果里，用户才能看到原因
        if (warnings.length > 0) {
          const combined = [resultWithName.message, ...warnings].filter(Boolean).join('；')
          resultWithName.message = combined
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
      if (cmsPreprocessed.platformContents?._cms) {
        cmsArticle = {
          ...normalizedArticle,
          content: cmsPreprocessed.platformContents._cms.html,
          html: cmsPreprocessed.platformContents._cms.html,
        }
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

/**
 * 预处理页面的响应
 */
interface PreprocessResponse {
  platformContents: Record<string, { html: string; markdown: string }> | null
  mermaid?: { rendered: number; failed: number; errors: string[] }
  error?: string
}

async function sendPreprocessMessage(
  rawHtml: string,
  platforms: string[],
  configs: Record<string, unknown>,
  options: { renderMermaid?: boolean; rasterizeSvg?: boolean } = {}
): Promise<PreprocessResponse> {
  const { renderMermaid = false, rasterizeSvg = false } = options
  const message = {
    type: 'PREPROCESS_FOR_PLATFORMS',
    payload: { rawHtml, platforms, configs, renderMermaid, rasterizeSvg },
  }

  // Mermaid 渲染依赖 mermaid 库 + DOM，只有扩展页面（preprocessor 页）具备，
  // 因此直接走临时窗口，不经过常驻 content script
  if (renderMermaid || rasterizeSvg) {
    return await preprocessViaTemporaryTab(message)
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
        if (response?.platformContents) {
          return { platformContents: response.platformContents, mermaid: response.mermaid }
        }
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
): Promise<PreprocessResponse> {
  let windowId: number | undefined
  let tabId: number | undefined
  try {
    // 先挂监听再创建窗口：扩展页面加载很快，
    // 先创建窗口再注册监听可能错过 complete 事件
    const loaded = waitForPreprocessorTab(15000)

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
    if (!tabId) return { platformContents: null, error: '临时窗口没有创建出标签页' }

    await loaded

    const response = await chrome.tabs.sendMessage(tabId, message)
    if (response?.platformContents) {
      logger.debug('Preprocessed via temporary window')
      return {
        platformContents: response.platformContents,
        mermaid: response.mermaid,
        error: response.error,
      }
    }
    return { platformContents: null, error: response?.error || '预处理页面没有返回结果' }
  } catch (error) {
    const reason = (error as Error).message
    logger.warn('Temporary window preprocess failed:', error)
    return { platformContents: null, error: reason }
  } finally {
    if (windowId) {
      chrome.windows.remove(windowId).catch(() => {})
    }
  }
}

/**
 * 等待预处理页面加载完成
 *
 * 通过 URL 匹配标签页，避免依赖 windowId/tabId 的时序；
 * 同时保留轮询兜底，防止 onUpdated 事件丢失。
 */
function waitForPreprocessorTab(timeoutMs = 15000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      chrome.tabs.onUpdated.removeListener(listener)
      clearInterval(poller)
      clearTimeout(timeout)
      if (error) reject(error)
      else resolve()
    }

    const listener = (
      _id: number,
      info: chrome.tabs.TabChangeInfo,
      tab?: chrome.tabs.Tab
    ) => {
      if (info.status === 'complete' && tab?.url?.startsWith(PREPROCESSOR_URL)) {
        finish()
      }
    }

    const poller = setInterval(() => {
      chrome.tabs.query({ url: PREPROCESSOR_URL })
        .then((tabs) => {
          if (tabs.some(tab => tab.status === 'complete')) finish()
        })
        .catch(() => {})
    }, 200)

    const timeout = setTimeout(() => {
      finish(new Error(`扩展页面加载超时（${timeoutMs / 1000}s）`))
    }, timeoutMs)

    chrome.tabs.onUpdated.addListener(listener)
  })
}

