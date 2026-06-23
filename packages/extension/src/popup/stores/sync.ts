import { create } from 'zustand'
import {
  trackRetry,
  trackContentProfile,
  trackFunnel,
  trackPlatformSelection,
  trackDraftClick,
  trackChurnSignal,
  trackImplicitFeedback,
} from '../../lib/analytics'
import { checkSyncFrequency } from '../../lib/rate-limit'
import { createLogger } from '../../lib/logger'

const logger = createLogger('SyncStore')

/**
 * 追踪文章内容特征
 */
function trackArticleProfile(article: { content?: string; cover?: string }, source: string) {
  if (!article.content) return

  const content = article.content
  // 计算字数（去除 HTML 标签）
  const textContent = content.replace(/<[^>]+>/g, '')
  const wordCount = textContent.length

  // 计算图片数量
  const imageMatches = content.match(/<img[^>]+>/gi)
  const imageCount = imageMatches?.length || 0

  // 检查是否有代码块
  const hasCode = /<pre[^>]*>|<code[^>]*>/i.test(content)

  // 检查是否有视频
  const hasVideo = /<video[^>]*>|<iframe[^>]*>/i.test(content)

  trackContentProfile({
    source,
    wordCount,
    imageCount,
    hasCode,
    hasCover: !!article.cover,
    hasVideo,
  }).catch(() => {})
}

interface Platform {
  id: string
  name: string
  icon: string
  homepage: string
  isAuthenticated: boolean
  username?: string
  avatar?: string
  // 区分平台类型：dsl 为 DSL 定义的平台，cms 为自建站点
  sourceType: 'dsl' | 'cms'
  // CMS 类型（仅 cms 类型有效）
  cmsType?: 'wordpress' | 'typecho' | 'metaweblog'
}

interface Article {
  title: string
  content: string
  summary?: string
  cover?: string
}

interface SyncResult {
  platform: string
  platformName?: string
  success: boolean
  postUrl?: string
  draftOnly?: boolean
  error?: string
}

interface ImageProgress {
  platform: string
  current: number
  total: number
}

// 同步阶段类型
type SyncStage = 'starting' | 'uploading_images' | 'saving' | 'completed' | 'failed'

// 平台同步详细进度
interface PlatformProgress {
  platform: string
  platformName: string
  stage: SyncStage
  imageProgress?: { current: number; total: number }
  error?: string
}

type SyncHistoryStatus = 'syncing' | 'completed' | 'failed' | 'cancelled'

interface SyncHistoryItem {
  id: string  // syncId
  status: SyncHistoryStatus
  title: string
  cover?: string
  platforms: string[]  // 选中的平台ID列表
  results: SyncResult[]
  startTime: number
  endTime?: number
  // 兼容旧格式
  timestamp?: number
}

interface SyncState {
  // 状态
  status: 'loading' | 'idle' | 'syncing' | 'completed'
  article: Article | null
  platforms: Platform[]
  selectedPlatforms: string[]
  results: SyncResult[]
  error: string | null

  // 当前同步任务ID（用于过滤消息）
  currentSyncId: string | null

  // 图片上传进度
  imageProgress: ImageProgress | null

  // 平台详细同步进度
  platformProgress: Map<string, PlatformProgress>

  // 同步历史
  history: SyncHistoryItem[]

  // 是否已恢复状态
  recovered: boolean

  // 频率限制警告
  rateLimitWarning: string | null

  // Actions
  loadPlatforms: () => Promise<void>
  loadArticle: () => Promise<void>
  loadHistory: () => Promise<void>
  recoverSyncState: () => Promise<void>
  togglePlatform: (platformId: string) => void
  selectAll: () => void
  deselectAll: () => void
  checkRateLimit: () => Promise<string | null>
  startSync: () => Promise<void>
  retryFailed: () => Promise<void>
  reset: () => void
  updateProgress: (result: SyncResult) => void
  updateImageProgress: (progress: ImageProgress | null) => void
  updateDetailProgress: (progress: PlatformProgress) => void
  clearSyncState: () => Promise<void>
  updateArticle: (updates: Partial<Article>) => void
  clearRateLimitWarning: () => void
}

// 最大历史记录数
const MAX_HISTORY_ITEMS = 25

// Storage key for selected platforms
const SELECTED_PLATFORMS_KEY = 'selectedPlatforms'

// 保存选中的平台到 storage
async function saveSelectedPlatforms(platformIds: string[]) {
  try {
    await chrome.storage.local.set({ [SELECTED_PLATFORMS_KEY]: platformIds })
  } catch (e) {
    logger.error('Failed to save selected platforms:', e)
  }
}

// 从 storage 加载选中的平台
async function loadSelectedPlatforms(): Promise<string[] | null> {
  try {
    const result = await chrome.storage.local.get(SELECTED_PLATFORMS_KEY)
    return result[SELECTED_PLATFORMS_KEY] || null
  } catch (e) {
    logger.error('Failed to load selected platforms:', e)
    return null
  }
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'loading',
  article: null,
  platforms: [],
  selectedPlatforms: [],
  results: [],
  error: null,
  currentSyncId: null,
  imageProgress: null,
  platformProgress: new Map(),
  history: [],
  recovered: false,
  rateLimitWarning: null,

  recoverSyncState: async () => {
    // 避免重复恢复
    if (get().recovered) return

    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SYNC_STATE' })
      const syncState = response?.syncState

      if (syncState) {
        logger.debug('Recovering sync state:', syncState.status, syncState.syncId)

        set({
          status: syncState.status,
          article: syncState.article,
          selectedPlatforms: Array.isArray(syncState.selectedPlatforms) ? syncState.selectedPlatforms : [],
          results: syncState.results || [],
          currentSyncId: syncState.syncId || null,
          recovered: true,
        })

        // 如果是同步中状态，继续监听进度
        if (syncState.status === 'syncing') {
          logger.debug('Sync in progress, listening for updates...')
        }
      } else {
        set({ recovered: true })
      }
    } catch (error) {
      logger.error('Failed to recover sync state:', error)
      set({ recovered: true })
    }
  },

  clearSyncState: async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'CLEAR_SYNC_STATE' })
    } catch (error) {
      logger.error('Failed to clear sync state:', error)
    }
  },

  updateArticle: (updates) => {
    const currentArticle = get().article
    if (currentArticle) {
      set({
        article: {
          ...currentArticle,
          ...updates,
        },
      })
    }
  },

  loadPlatforms: async () => {
    // 如果正在同步或已完成，不覆盖状态
    const currentStatus = get().status
    const preserveStatus = currentStatus === 'syncing' || currentStatus === 'completed'

    if (!preserveStatus) {
      set({ status: 'loading' })
    }

    try {
      // CHECK_ALL_AUTH 现在返回 DSL 和 CMS 合并的列表
      const platformResponse = await chrome.runtime.sendMessage({ type: 'CHECK_ALL_AUTH' })

      // 只保留已认证的平台
      const allPlatforms: Platform[] = (platformResponse.platforms || [])
        .filter((p: any) => p.isAuthenticated)

      // 加载保存的平台选择
      const savedSelections = await loadSelectedPlatforms()
      const authenticatedIds = allPlatforms.map(p => p.id)

      // 过滤出仍然有效的已选平台（已登录的平台）
      let selectedPlatforms: string[] = []
      if (savedSelections && savedSelections.length > 0) {
        selectedPlatforms = savedSelections.filter(id => authenticatedIds.includes(id))
      }

      // 如果正在同步或已完成，只更新平台列表，不改变状态和选择
      if (preserveStatus) {
        set({ platforms: allPlatforms })
      } else {
        set({ platforms: allPlatforms, status: 'idle', selectedPlatforms })
      }
    } catch (error) {
      logger.error('Failed to load platforms:', error)
      if (!preserveStatus) {
        set({ status: 'idle', error: (error as Error).message })
      }
    }
  },

  loadArticle: async () => {
    // 如果已有恢复的文章（同步中/完成状态），不覆盖
    const { article: existingArticle, status } = get()
    if (existingArticle && (status === 'syncing' || status === 'completed')) {
      logger.debug('loadArticle - skipped, using recovered article')
      return
    }

    try {
      // 首先检查是否有从页面按钮点击传来的待同步文章
      const storage = await chrome.storage.local.get('pendingArticle')
      if (storage.pendingArticle) {
        logger.debug('loadArticle - found pending article:', storage.pendingArticle.title)
        set({ article: storage.pendingArticle })
        // 追踪内容特征
        trackArticleProfile(storage.pendingArticle, 'popup')
        // 清除已读取的文章
        await chrome.storage.local.remove('pendingArticle')
        return
      }

      // 如果没有待同步文章，尝试从当前标签页提取
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      logger.debug('loadArticle - current tab:', tab?.url)
      if (!tab?.id) return

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ARTICLE' })
      logger.debug('loadArticle - response:', response)
      if (response?.article) {
        set({ article: response.article })
        // 追踪内容特征
        trackArticleProfile(response.article, 'popup')
      }
    } catch (error) {
      logger.error('Failed to extract article:', error)
    }
  },

  loadHistory: async () => {
    try {
      const storage = await chrome.storage.local.get('syncHistory')
      set({ history: storage.syncHistory || [] })
    } catch (error) {
      logger.error('Failed to load history:', error)
    }
  },

  togglePlatform: (platformId: string) => {
    const { selectedPlatforms } = get()
    const isSelected = selectedPlatforms.includes(platformId)
    const newSelected = isSelected
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId]

    set({ selectedPlatforms: newSelected })

    // 保存到 storage
    saveSelectedPlatforms(newSelected)

    // 追踪平台选择行为
    trackPlatformSelection(
      isSelected ? 'deselect' : 'select',
      platformId,
      newSelected.length
    ).catch(() => {})
  },

  selectAll: () => {
    const { platforms } = get()
    const allIds = platforms.filter(p => p.isAuthenticated).map(p => p.id)
    set({ selectedPlatforms: allIds })
    // 保存到 storage
    saveSelectedPlatforms(allIds)
    // 追踪全选
    trackPlatformSelection('select_all', 'all', allIds.length).catch(() => {})
  },

  deselectAll: () => {
    set({ selectedPlatforms: [] })
    // 保存到 storage
    saveSelectedPlatforms([])
    // 追踪取消全选
    trackPlatformSelection('deselect_all', 'all', 0).catch(() => {})
  },

  checkRateLimit: async () => {
    const { selectedPlatforms } = get()
    return checkSyncFrequency(selectedPlatforms)
  },

  startSync: async () => {
    const { article, selectedPlatforms, platforms } = get()
    logger.debug('startSync called', { article, selectedPlatforms })

    if (!article) {
      set({ error: '未检测到文章内容' })
      return
    }

    if (selectedPlatforms.length === 0) {
      set({ error: '请选择要同步的平台' })
      return
    }

    // 追踪漏斗：开始同步
    trackFunnel('sync_started', 'popup', { platform_count: selectedPlatforms.length }).catch(() => {})

    // 生成 syncId（在发送消息前设置，以便立即过滤消息）
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    set({ status: 'syncing', results: [], error: null, imageProgress: null, platformProgress: new Map(), currentSyncId: syncId })

    try {
      // SYNC_ARTICLE 现在同时处理 DSL 和 CMS 平台
      // 传递 syncId 给 background，background 会用这个 ID
      const response = await chrome.runtime.sendMessage({
        type: 'SYNC_ARTICLE',
        payload: { article, platforms: selectedPlatforms, syncId },
      })

      const allResults: SyncResult[] = response.results || []
      const rateLimitWarning: string | null = response.rateLimitWarning || null

      // 为结果添加平台名称（如果 background 没有添加）
      const resultsWithNames = allResults.map((r: SyncResult) => ({
        ...r,
        platformName: r.platformName || platforms.find(p => p.id === r.platform)?.name || r.platform,
      }))

      // 历史记录由 background 保存，这里只刷新显示
      const storage = await chrome.storage.local.get('syncHistory')
      const newHistory: SyncHistoryItem[] = storage.syncHistory || []

      set({
        status: 'completed',
        results: resultsWithNames,
        history: newHistory,
        imageProgress: null,
        rateLimitWarning,
      })

      // 追踪流失预警：多次失败
      const failedCount = resultsWithNames.filter((r: SyncResult) => !r.success).length
      if (failedCount >= 3) {
        trackChurnSignal('multiple_failures', {
          failed_count: failedCount,
          total_count: resultsWithNames.length,
        }).catch(() => {})
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        status: 'idle',
        imageProgress: null,
      })
      // 追踪隐式反馈：同步出错后放弃
      trackImplicitFeedback('abandon_after_error', {
        error: (error as Error).message,
      }).catch(() => {})
    }
  },

  retryFailed: async () => {
    const { article, results, platforms } = get()

    if (!article) {
      set({ error: '未检测到文章内容' })
      return
    }

    // 获取失败的平台
    const failedPlatformIds = results.filter(r => !r.success).map(r => r.platform)

    if (failedPlatformIds.length === 0) {
      return
    }

    // 保留成功的结果
    const successResults = results.filter(r => r.success)

    // 追踪重试行为
    trackRetry('popup', failedPlatformIds, 2, failedPlatformIds.length).catch(() => {})

    // 生成新的 syncId
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    set({ status: 'syncing', results: successResults, error: null, imageProgress: null, platformProgress: new Map(), currentSyncId: syncId })

    try {
      // SYNC_ARTICLE 现在同时处理 DSL 和 CMS 平台
      const response = await chrome.runtime.sendMessage({
        type: 'SYNC_ARTICLE',
        payload: { article, platforms: failedPlatformIds, skipHistory: true, syncId },
      })

      const retryResults: SyncResult[] = response.results || []

      // 为结果添加平台名称（如果 background 没有添加）
      const retryResultsWithNames = retryResults.map((r: SyncResult) => ({
        ...r,
        platformName: r.platformName || platforms.find(p => p.id === r.platform)?.name || r.platform,
      }))

      const allResults = [...successResults, ...retryResultsWithNames]

      // 更新历史记录中最新的条目 - 从 storage 读取
      const storage = await chrome.storage.local.get('syncHistory')
      const existingHistory: SyncHistoryItem[] = storage.syncHistory || []
      if (existingHistory.length > 0) {
        const updatedHistory = [...existingHistory]
        updatedHistory[0] = {
          ...updatedHistory[0],
          results: allResults,
        }
        await chrome.storage.local.set({ syncHistory: updatedHistory })
        set({ history: updatedHistory })
      }

      set({
        status: 'completed',
        results: allResults,
        imageProgress: null,
      })
    } catch (error) {
      set({
        error: (error as Error).message,
        status: 'completed',
        imageProgress: null,
      })
    }
  },

  reset: () => {
    set({
      status: 'idle',
      results: [],
      error: null,
      imageProgress: null,
      platformProgress: new Map(),
    })
    // 清除持久化的同步状态
    chrome.runtime.sendMessage({ type: 'CLEAR_SYNC_STATE' }).catch(() => {})
  },

  updateProgress: (result: SyncResult) => {
    set(state => {
      const newResults = [...state.results, result]
      // Auto-transition to completed when all platforms are done.
      // This handles the case where popup was closed during sync and
      // reopened — the startSync response handler won't fire, so we
      // detect completion here from individual SYNC_PROGRESS messages.
      const isComplete = state.status === 'syncing' &&
        newResults.length >= state.selectedPlatforms.length
      return {
        results: newResults,
        ...(isComplete ? { status: 'completed' as const, imageProgress: null } : {}),
      }
    })
  },

  updateImageProgress: (progress: ImageProgress | null) => {
    set({ imageProgress: progress })
  },

  updateDetailProgress: (progress: PlatformProgress) => {
    set(state => {
      const newMap = new Map(state.platformProgress)
      newMap.set(progress.platform, progress)
      return { platformProgress: newMap }
    })
  },

  // 追踪草稿链接点击
  onDraftClick: (platform: string) => {
    trackDraftClick(platform).catch(() => {})
  },

  // 追踪立即重试（隐式反馈）
  onImmediateRetry: () => {
    trackImplicitFeedback('immediate_retry').catch(() => {})
  },

  // 清除频率限制警告
  clearRateLimitWarning: () => {
    set({ rateLimitWarning: null })
  },
}))

// 监听来自 background 的进度消息
chrome.runtime.onMessage.addListener((message) => {
  // 获取当前 syncId，只处理匹配的消息
  const { currentSyncId } = useSyncStore.getState()

  // 如果消息带有 syncId，需要匹配当前的 syncId
  if (message.syncId && currentSyncId && message.syncId !== currentSyncId) {
    logger.debug('Ignoring message with different syncId:', message.syncId, 'current:', currentSyncId)
    return
  }

  if (message.type === 'SYNC_PROGRESS') {
    const result = message.payload?.result
    if (result) {
      useSyncStore.getState().updateProgress(result)
    }
  }
  if (message.type === 'IMAGE_PROGRESS') {
    if (message.payload) {
      useSyncStore.getState().updateImageProgress(message.payload)
    }
  }
  if (message.type === 'SYNC_DETAIL_PROGRESS') {
    const progress = message.payload
    if (progress?.platform) {
      useSyncStore.getState().updateDetailProgress(progress)
    }
  }
})
