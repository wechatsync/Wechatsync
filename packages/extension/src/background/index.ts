import {
  initAdapters,
  checkAllPlatformsAuth,
  checkPlatformAuth,
  getAllPlatformMetas,
  cancelSync,
  getAdapter,
  getPlatformPreprocessConfigs,
} from '../adapters'
import * as wordpressAdapter from '../adapters/cms/wordpress'
import * as metaweblogAdapter from '../adapters/cms/metaweblog'
import { startMcpClient, stopMcpClient, getMcpStatus, mcpClient } from '../mcp/client'
import { createLogger } from '../lib/logger'
import {
  trackInstall,
  trackCmsSync,
  trackFeatureUse,
  trackArticleExtract,
  trackMcpUsage,
  trackCmsManagement,
  recordInstallTimestamp,
  inferErrorType,
  trackMilestone,
  trackGrowthMetrics,
} from '../lib/analytics'
import { checkSyncFrequency, recordSync } from '../lib/rate-limit'
import { checkForUpdates, isUpdateDismissed } from '../lib/version-check'
import { fetchRemoteConfig, fetchConfigIfNeeded } from '../lib/remote-config'
import {
  performSync,
  generateSyncId,
  saveSyncState,
  clearSyncState,
  SYNC_STATE_KEY,
  BADGE_COLORS,
  type ActiveSyncState,
} from './sync-service'

const logger = createLogger('Background')

type CMSType = 'wordpress' | 'typecho' | 'metaweblog'

// 消息类型
type MessageAction =
  | { type: 'GET_PLATFORMS' }
  | { type: 'CHECK_ALL_AUTH'; payload?: { forceRefresh?: boolean } }
  | { type: 'CHECK_AUTH'; payload: { platformId: string } }
  | { type: 'SYNC_ARTICLE'; payload: { article: any; platforms: string[]; allSelectedPlatforms?: string[]; skipHistory?: boolean; source?: string; syncId?: string } }
  | { type: 'OPEN_SYNC_PAGE'; path?: string }
  | { type: 'TEST_CMS_CONNECTION'; payload: { type: CMSType; url: string; username: string; password: string } }
  | { type: 'SYNC_TO_CMS'; payload: { accountId: string; article: any } }
  | { type: 'MCP_ENABLE' }
  | { type: 'MCP_DISABLE' }
  | { type: 'MCP_STATUS' }
  | { type: 'MCP_SET_SERVER_URL'; payload: { url: string } }
  | { type: 'MCP_WATCH_START' }
  | { type: 'MCP_WATCH_STOP' }
  | { type: 'TRACK_ARTICLE_EXTRACT'; payload: { source: string; success: boolean; hasTitle?: boolean; hasContent?: boolean; hasCover?: boolean; contentLength?: number } }
  | { type: 'GET_SYNC_STATE' }
  | { type: 'CLEAR_SYNC_STATE' }
  | { type: 'UPDATE_SYNC_STATUS'; payload: { status: 'syncing' | 'completed' } }
  | { type: 'CANCEL_SYNC' }
  | { type: 'START_SYNC_FROM_EDITOR'; article: any; platforms: string[]; syncId?: string }
  | { type: 'UPLOAD_IMAGE'; payload: { src: string; platform?: string } }
  | { type: 'MAGIC_CALL'; payload: { methodName: string; data: any } }
  | { type: 'CLEAR_UPDATE_BADGE' }
  | { type: 'GET_PREPROCESS_CONFIGS'; platforms: string[] }
  | { type: 'TRIGGER_OPEN_EDITOR' }

/**
 * 消息处理
 */
chrome.runtime.onMessage.addListener((message: MessageAction, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => sendResponse({ error: error.message }))

  return true // 异步响应
})

async function handleMessage(message: MessageAction, sender?: chrome.runtime.MessageSender) {
  switch (message.type) {
    case 'GET_PLATFORMS': {
      await initAdapters()
      const platforms = getAllPlatformMetas()
      return { platforms }
    }

    case 'CHECK_ALL_AUTH': {
      const forceRefresh = message.payload?.forceRefresh ?? false
      const dslPlatforms = await checkAllPlatformsAuth(forceRefresh)

      // 为 DSL 平台添加 sourceType
      const dslWithType = dslPlatforms.map((p: any) => ({
        ...p,
        sourceType: 'dsl' as const,
      }))

      // 同时加载 CMS 账户
      const cmsStorage = await chrome.storage.local.get('cmsAccounts')
      const cmsAccounts = cmsStorage.cmsAccounts || []
      const cmsPlatforms = cmsAccounts
        .filter((a: any) => a.isConnected)
        .map((a: any) => ({
          id: a.id,
          name: a.name,
          icon: getCmsIcon(a.type),
          homepage: a.url,
          isAuthenticated: true,
          username: a.username,
          sourceType: 'cms' as const,
          cmsType: a.type,
        }))

      const allPlatforms = [...dslWithType, ...cmsPlatforms]
      // 缓存完整平台列表，供 popup 启动时立即渲染
      chrome.storage.local.set({ platformListCache: allPlatforms }).catch(() => {})
      return { platforms: allPlatforms }
    }

    case 'CHECK_AUTH': {
      const { platformId } = message.payload
      const auth = await checkPlatformAuth(platformId)
      return { auth }
    }

    case 'SYNC_ARTICLE': {
      const { article, platforms, allSelectedPlatforms, skipHistory, source = 'popup', syncId: passedSyncId } = message.payload
      const senderTabId = sender?.tab?.id

      const rateLimitWarning = await checkSyncFrequency(platforms)

      const syncId = passedSyncId || generateSyncId()

      const sendProgress = (msg: Record<string, unknown>) => {
        const msgWithSyncId = { ...msg, syncId }
        chrome.runtime.sendMessage(msgWithSyncId).catch(() => {})
        if (senderTabId) {
          chrome.tabs.sendMessage(senderTabId, msgWithSyncId).catch(() => {})
        }
      }

      const { results: allResults } = await performSync(
        article,
        platforms,
        {
          skipHistory,
          source,
          syncId,
          allSelectedPlatforms,
          preprocessArticle: article.platformContents
            ? undefined
            : async (normalizedArticle, dslPlatformIds, sourcePlatform) => {
                const platformsToPreprocess = dslPlatformIds.filter((id: string) => id !== sourcePlatform)
                if (platformsToPreprocess.length === 0) return normalizedArticle
                try {
                  const configs = getPlatformPreprocessConfigs(platformsToPreprocess)
                  const { deepCleanEnabled = false } = await chrome.storage.local.get('deepCleanEnabled')
                  for (const key of Object.keys(configs)) {
                    configs[key] = {
                      ...configs[key],
                      normalizeViaMarkdown: sourcePlatform === 'weixin' ? false : deepCleanEnabled,
                    }
                  }
                  const rawHtml = normalizedArticle.html || normalizedArticle.content || ''
                  if (!rawHtml) return normalizedArticle

                  let targetTabId = senderTabId
                  if (!targetTabId) {
                    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    targetTabId = activeTab?.id
                  }
                  if (!targetTabId) return normalizedArticle

                  const response = await chrome.tabs.sendMessage(targetTabId, {
                    type: 'PREPROCESS_FOR_PLATFORMS',
                    payload: { rawHtml, platforms: platformsToPreprocess, configs },
                  })
                  if (response?.platformContents) {
                    return { ...normalizedArticle, platformContents: response.platformContents }
                  }
                } catch (error) {
                  logger.debug('Preprocess failed, using original content:', error)
                }
                return normalizedArticle
              },
        },
        {
          onResult: (result) => {
            sendProgress({ type: 'SYNC_PROGRESS', payload: { result } })
          },
          onImageProgress: (platform, current, total) => {
            sendProgress({ type: 'IMAGE_PROGRESS', payload: { platform, current, total } })
          },
          onDetailProgress: (progress) => {
            sendProgress({ type: 'SYNC_DETAIL_PROGRESS', payload: progress })
          },
        }
      )

      const successfulPlatforms = allResults
        .filter(r => r.success)
        .map(r => r.platform)
      if (successfulPlatforms.length > 0) {
        recordSync(successfulPlatforms).catch(() => {})
      }

      return { results: allResults, rateLimitWarning, syncId }
    }

    case 'OPEN_SYNC_PAGE': {
      // 获取扩展的 popup 页面 URL (支持 hash 路由)
      const path = message.path || ''
      const popupUrl = chrome.runtime.getURL('src/popup/index.html') + (path ? `#${path}` : '')

      // 窗口尺寸
      const width = 396
      const height = 560

      // 获取当前窗口信息以计算居中位置
      const currentWindow = await chrome.windows.getCurrent()
      const left = currentWindow.left !== undefined && currentWindow.width !== undefined
        ? Math.round(currentWindow.left + (currentWindow.width - width) / 2)
        : undefined
      const top = currentWindow.top !== undefined && currentWindow.height !== undefined
        ? Math.round(currentWindow.top + (currentWindow.height - height) / 2)
        : undefined

      // 在新窗口中打开同步页面（居中显示）
      await chrome.windows.create({
        url: popupUrl,
        type: 'popup',
        width,
        height,
        left,
        top,
        focused: true,
      })
      return { success: true }
    }

    case 'TEST_CMS_CONNECTION': {
      const { type, url, username, password } = message.payload
      const credentials = { url, username, password }

      try {
        let result
        switch (type) {
          case 'wordpress':
            result = await wordpressAdapter.testConnection(credentials)
            break
          case 'typecho':
            result = await metaweblogAdapter.testTypechoConnection(credentials)
            break
          case 'metaweblog':
            result = await metaweblogAdapter.testConnection(credentials)
            break
          default:
            return { success: false, error: '不支持的 CMS 类型' }
        }
        // 追踪 CMS 测试连接
        trackCmsManagement('test', type, result.success).catch(() => {})
        return result
      } catch (error) {
        trackCmsManagement('test', type, false).catch(() => {})
        return { success: false, error: (error as Error).message }
      }
    }

    case 'SYNC_TO_CMS': {
      const { accountId, article } = message.payload

      try {
        // 获取账户信息
        const storage = await chrome.storage.local.get(['cmsAccounts', `cms_pwd_${accountId}`])
        const accounts = storage.cmsAccounts || []
        const account = accounts.find((a: any) => a.id === accountId)

        if (!account) {
          return { success: false, error: '账户不存在' }
        }

        const password = storage[`cms_pwd_${accountId}`]
        if (!password) {
          return { success: false, error: '密码未找到，请重新添加账户' }
        }

        const credentials = {
          url: account.url,
          username: account.username,
          password,
        }

        let result
        switch (account.type) {
          case 'wordpress':
            result = await wordpressAdapter.publish(credentials, article, { draftOnly: true })
            break
          case 'typecho':
            result = await metaweblogAdapter.publishToTypecho(credentials, article, { draftOnly: true })
            break
          case 'metaweblog':
            result = await metaweblogAdapter.publish(credentials, article, { draftOnly: true })
            break
          default:
            return { success: false, error: '不支持的 CMS 类型' }
        }

        // 追踪 CMS 同步结果（含错误类型）
        trackCmsSync('popup', account.type, result.success).catch(() => {})
        if (result.success) {
          // 追踪 CMS 用户里程碑
          trackMilestone('cms_user').catch(() => {})
        } else if (result.error) {
          // 额外追踪错误类型用于问题分析
          trackFeatureUse('cms_sync_error', {
            cms_type: account.type,
            error_type: inferErrorType(result.error),
          }).catch(() => {})
        }

        // 更新同步状态（用于 popup 恢复）
        const currentState = await chrome.storage.local.get(SYNC_STATE_KEY)
        const syncState = currentState[SYNC_STATE_KEY] as ActiveSyncState | undefined
        if (syncState) {
          const cmsResult = {
            platform: accountId,
            platformName: account.name,
            success: result.success,
            postUrl: result.postUrl,
            draftOnly: true,
            error: result.error,
          }
          syncState.results.push(cmsResult)
          await saveSyncState(syncState)
        }

        // 记录同步频率
        if (result.success) {
          recordSync([accountId]).catch(() => {})
        }

        return {
          platform: account.name,
          success: result.success,
          postUrl: result.postUrl,
          postId: result.postId,
          error: result.error,
          draftOnly: true,
          timestamp: Date.now(),
        }
      } catch (error) {
        // 更新同步状态（记录失败）
        const currentState = await chrome.storage.local.get(SYNC_STATE_KEY)
        const syncState = currentState[SYNC_STATE_KEY] as ActiveSyncState | undefined
        if (syncState) {
          const cmsResult = {
            platform: accountId,
            platformName: accountId,
            success: false,
            error: (error as Error).message,
          }
          syncState.results.push(cmsResult)
          await saveSyncState(syncState)
        }
        return { success: false, error: (error as Error).message }
      }
    }

    case 'MCP_ENABLE': {
      // 检查是否已有 token，没有才生成新的
      const storage = await chrome.storage.local.get(['mcpToken', 'mcpServerUrl'])
      const token = storage.mcpToken || crypto.randomUUID()
      await chrome.storage.local.set({ mcpEnabled: true, mcpToken: token })
      // 设置 token、服务器地址并启动客户端
      mcpClient.setToken(token)
      if (storage.mcpServerUrl) {
        mcpClient.setServerUrl(storage.mcpServerUrl)
      }
      startMcpClient()
      logger.info(' MCP enabled')
      trackMcpUsage('enable').catch(() => {})
      // 追踪 MCP 用户里程碑
      trackMilestone('mcp_user').catch(() => {})
      return { success: true, token }
    }

    case 'MCP_DISABLE': {
      // 只关闭连接，保留 token（下次启用时复用）
      await chrome.storage.local.set({ mcpEnabled: false })
      mcpClient.clearToken()
      stopMcpClient()
      logger.info(' MCP disabled')
      trackMcpUsage('disable').catch(() => {})
      return { success: true }
    }

    case 'MCP_SET_SERVER_URL': {
      const url = message.payload.url
      await chrome.storage.local.set({ mcpServerUrl: url || '' })
      mcpClient.setServerUrl(url)
      // 地址变更后，断开重连
      if (mcpClient.isConnected()) {
        mcpClient.disconnect()
        mcpClient.resetReconnect()
      } else {
        mcpClient.resetReconnect()
      }
      return { success: true }
    }

    case 'MCP_WATCH_START': {
      mcpClient.setActivelyWatched(true)
      return { success: true }
    }

    case 'MCP_WATCH_STOP': {
      mcpClient.setActivelyWatched(false)
      return { success: true }
    }

    case 'MCP_STATUS': {
      const storage = await chrome.storage.local.get(['mcpEnabled', 'mcpToken', 'mcpServerUrl'])
      const mcpStatus = getMcpStatus()
      return {
        enabled: storage.mcpEnabled ?? false,
        connected: mcpStatus.connected,
        token: storage.mcpToken,  // 返回 token 供 MCP Server 使用
        serverUrl: storage.mcpServerUrl || '',
      }
    }

    case 'TRACK_ARTICLE_EXTRACT': {
      const { source, success, hasTitle, hasContent, hasCover, contentLength } = message.payload
      trackArticleExtract(source, success, { hasTitle, hasContent, hasCover, contentLength }).catch(() => {})
      return { success: true }
    }

    case 'GET_SYNC_STATE': {
      const storage = await chrome.storage.local.get(SYNC_STATE_KEY)
      return { syncState: storage[SYNC_STATE_KEY] || null }
    }

    case 'CLEAR_SYNC_STATE': {
      await clearSyncState()
      return { success: true }
    }

    case 'UPDATE_SYNC_STATUS': {
      const { status } = message.payload
      const currentState = await chrome.storage.local.get(SYNC_STATE_KEY)
      const syncState = currentState[SYNC_STATE_KEY] as ActiveSyncState | undefined
      if (syncState) {
        syncState.status = status
        await saveSyncState(syncState)
      }
      return { success: true }
    }

    case 'CANCEL_SYNC': {
      const cancelled = cancelSync()
      logger.info('Sync cancelled:', cancelled)
      return { success: cancelled }
    }

    case 'START_SYNC_FROM_EDITOR': {
      const { article, platforms, syncId: passedSyncId } = message
      const tabId = sender?.tab?.id

      if (!tabId) {
        return { error: 'No tab ID found' }
      }

      const syncId = passedSyncId || generateSyncId()

      const sendToTab = (msg: Record<string, unknown>) => {
        chrome.tabs.sendMessage(tabId, { ...msg, syncId }).catch(() => {})
      }

      const rateLimitWarning = await checkSyncFrequency(platforms)

      const { results: allResults } = await performSync(
        article,
        platforms,
        { source: 'editor', syncId },
        {
          onResult: (result) => {
            sendToTab({ type: 'SYNC_PROGRESS', result })
          },
          onImageProgress: (platform, current, total) => {
            sendToTab({ type: 'IMAGE_PROGRESS', platform, current, total })
          },
          onDetailProgress: (progress) => {
            sendToTab({ type: 'SYNC_DETAIL_PROGRESS', ...progress })
          },
        }
      )

      sendToTab({ type: 'SYNC_COMPLETE', rateLimitWarning })

      const successfulPlatforms = allResults
        .filter((r: any) => r.success)
        .map((r: any) => r.platform)
      if (successfulPlatforms.length > 0) {
        recordSync(successfulPlatforms).catch(() => {})
      }

      return { results: allResults, rateLimitWarning, syncId }
    }

    case 'UPLOAD_IMAGE': {
      const { src, platform = 'weibo' } = message.payload

      try {
        // 获取适配器
        const adapter = await getAdapter(platform)
        if (!adapter) {
          return { error: `Platform not found: ${platform}` }
        }

        // 检查适配器是否支持图片上传
        if (typeof adapter.uploadImage !== 'function') {
          return { error: `Platform ${platform} does not support image upload` }
        }

        // 处理 base64 或 URL
        let blob: Blob

        if (src.startsWith('data:')) {
          // data URI 格式: data:image/png;base64,xxxxx
          const matches = src.match(/^data:([^;]+);base64,(.+)$/)
          if (!matches) {
            return { error: 'Invalid data URI format' }
          }
          const mimeType = matches[1]
          const base64Data = matches[2]
          const binaryStr = atob(base64Data)
          const bytes = new Uint8Array(binaryStr.length)
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i)
          }
          blob = new Blob([bytes], { type: mimeType })
        } else {
          // URL 格式，需要先获取图片
          const response = await fetch(src)
          blob = await response.blob()
        }

        // 调用适配器上传
        const url = await adapter.uploadImage(blob)
        return { result: { url, platform } }
      } catch (error) {
        logger.error('Upload image failed:', error)
        return { error: (error as Error).message }
      }
    }

    case 'MAGIC_CALL': {
      const { methodName, data } = message.payload

      try {
        // 获取平台适配器
        const platform = data.account?.type || data.platform || 'weibo'
        const adapter = await getAdapter(platform)

        if (!adapter) {
          return { error: `Platform not found: ${platform}` }
        }

        // 检查方法是否存在
        if (typeof (adapter as any)[methodName] !== 'function') {
          return { error: `Method ${methodName} not found on platform ${platform}` }
        }

        // 调用方法
        const result = await (adapter as any)[methodName](data)
        return { result }
      } catch (error) {
        logger.error(`Magic call ${methodName} failed:`, error)
        return { error: (error as Error).message }
      }
    }

    case 'CLEAR_UPDATE_BADGE': {
      // 清除版本更新 badge
      await chrome.action.setBadgeText({ text: '' })
      logger.info('Update badge cleared')
      return { success: true }
    }

    case 'GET_PREPROCESS_CONFIGS': {
      // 获取平台预处理配置（供 content script 使用）
      await initAdapters()
      const configs = getPlatformPreprocessConfigs(message.platforms)
      return { configs }
    }

    case 'TRIGGER_OPEN_EDITOR': {
      // 悬浮按钮触发，与右键菜单逻辑相同
      const tabId = sender?.tab?.id
      if (!tabId) return { success: false }

      const dslPlatforms = await checkAllPlatformsAuth(false)
      const dslWithType = dslPlatforms.map((p: any) => ({
        ...p,
        sourceType: 'dsl' as const,
      }))

      const cmsStorage = await chrome.storage.local.get('cmsAccounts')
      const cmsAccounts = cmsStorage.cmsAccounts || []
      const cmsPlatforms = cmsAccounts
        .filter((a: any) => a.isConnected)
        .map((a: any) => ({
          id: a.id,
          name: a.name,
          icon: getCmsIcon(a.type),
          homepage: a.url,
          isAuthenticated: true,
          username: a.username,
          sourceType: 'cms' as const,
          cmsType: a.type,
        }))

      chrome.tabs.sendMessage(tabId, {
        type: 'OPEN_EDITOR',
        platforms: [...dslWithType, ...cmsPlatforms],
        selectedPlatforms: [],
      })
      return { success: true }
    }

    default:
      return { error: 'Unknown message type' }
  }
}

/**
 * 创建右键菜单
 */
function createContextMenu() {
  chrome.contextMenus.create({
    id: 'wechatsync-open-editor',
    title: '同步助手 - 提取并编辑文章',
    contexts: ['page', 'selection'],
  })
}

// CMS 图标
function getCmsIcon(type: string): string {
  switch (type) {
    case 'wordpress':
      return 'https://s.w.org/style/images/about/WordPress-logotype-simplified.png'
    case 'typecho':
      return chrome.runtime.getURL('assets/typecho.ico')
    case 'metaweblog':
      return 'https://www.cnblogs.com/favicon.ico'
    default:
      return chrome.runtime.getURL('assets/icon-48.png')
  }
}

/**
 * 处理右键菜单点击
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'wechatsync-open-editor' && tab?.id) {
    try {
      // 获取 DSL 平台
      const dslPlatforms = await checkAllPlatformsAuth(false)

      // 为 DSL 平台添加 sourceType
      const dslWithType = dslPlatforms.map((p: any) => ({
        ...p,
        sourceType: 'dsl' as const,
      }))

      // 获取 CMS 账户
      const cmsStorage = await chrome.storage.local.get('cmsAccounts')
      const cmsAccounts = cmsStorage.cmsAccounts || []
      const cmsPlatforms = cmsAccounts
        .filter((a: any) => a.isConnected)
        .map((a: any) => ({
          id: a.id,
          name: a.name,
          icon: getCmsIcon(a.type),
          homepage: a.url,
          isAuthenticated: true,
          username: a.username,
          sourceType: 'cms' as const,
          cmsType: a.type,
        }))

      // 合并所有平台
      const allPlatforms = [...dslWithType, ...cmsPlatforms]

      // 发送消息到 content script 打开编辑器
      chrome.tabs.sendMessage(tab.id, {
        type: 'OPEN_EDITOR',
        platforms: allPlatforms,
        selectedPlatforms: [], // 右键打开时默认选中所有已登录平台
      })
    } catch (error) {
      logger.error(' Failed to open editor from context menu:', error)
    }
  }
})

/**
 * 扩展安装/更新
 */
chrome.runtime.onInstalled.addListener(async details => {
  logger.info(' Installed:', details.reason, details.previousVersion)

  // 创建右键菜单
  createContextMenu()

  // 预加载适配器
  await initAdapters()

  // 追踪安装/更新
  trackInstall(details.reason, details.previousVersion).catch(() => {})

  // 拉取远程配置
  fetchRemoteConfig().catch(() => {})

  // 记录安装时间（用于首次同步追踪）
  if (details.reason === 'install') {
    recordInstallTimestamp().catch(() => {})
  }

  // 升级时打开 changelog 页面
  if (details.reason === 'update') {
    const previousVersion = details.previousVersion || '0.0.0'
    const currentVersion = chrome.runtime.getManifest().version

    // 重要版本升级时显示更新日志
    const showChangelogVersions = ['2.0.8', '2.0.9']
    if (
      showChangelogVersions.includes(currentVersion) ||
      (previousVersion.startsWith('1.') && currentVersion.startsWith('2.'))
    ) {
      chrome.tabs.create({
        url: 'https://www.wechatsync.com/changelog?from=' + previousVersion + '&to=' + currentVersion,
        active: true,
      })
    }
  }

  // 首次安装时打开欢迎页
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'https://www.wechatsync.com/?utm_source=extension&utm_medium=install',
      active: true,
    })
  }
})

/**
 * 启动时初始化 MCP（如果已启用）
 */
async function initMcpIfEnabled() {
  const storage = await chrome.storage.local.get(['mcpEnabled', 'mcpToken', 'mcpServerUrl'])
  if (storage.mcpEnabled) {
    if (storage.mcpToken) {
      mcpClient.setToken(storage.mcpToken)
      logger.info(' Starting MCP client with existing token...')
    } else {
      // 没有 token，生成新的
      const token = crypto.randomUUID()
      await chrome.storage.local.set({ mcpToken: token })
      mcpClient.setToken(token)
      logger.info(' Starting MCP client with new token...')
    }
    // 加载自定义服务器地址（支持远程桥接）
    if (storage.mcpServerUrl) {
      mcpClient.setServerUrl(storage.mcpServerUrl)
    }
    startMcpClient()
  }
}

// 启动 MCP 客户端（如果已启用）
initMcpIfEnabled()

/**
 * 预检查平台认证状态（后台静默执行）
 * 在扩展启动/安装时预热缓存，提升 popup 打开速度
 */
async function preCheckPlatformsAuth() {
  logger.info(' Pre-checking platform auth...')
  try {
    await checkAllPlatformsAuth(false) // 使用缓存，不强制刷新
    logger.info(' Pre-check completed')
  } catch (error) {
    logger.error(' Pre-check failed:', error)
  }
}

// 浏览器启动时预检查
chrome.runtime.onStartup.addListener(() => {
  logger.info(' Browser started, pre-checking auth...')
  preCheckPlatformsAuth()
})

// Service Worker 激活时也预检查（首次加载或唤醒）
preCheckPlatformsAuth()

// 设置每日增长指标追踪
chrome.alarms.create('daily_growth_metrics', { periodInMinutes: 24 * 60 })
// 设置远程配置定期拉取（每 6 小时）
chrome.alarms.create('remote_config_fetch', { periodInMinutes: 6 * 60 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily_growth_metrics') {
    trackGrowthMetrics().catch(() => {})
  }
  if (alarm.name === 'remote_config_fetch') {
    fetchRemoteConfig().catch(() => {})
  }
})

// 首次启动时也追踪一次增长指标
trackGrowthMetrics().catch(() => {})

// 首次启动时拉取远程配置（带缓存检查）
fetchConfigIfNeeded().catch(() => {})

// 检查版本更新（用于 ZIP 安装用户）
// 如有新版本，在扩展图标上显示 badge 提醒
checkForUpdates().then(async (result) => {
  if (result.hasUpdate && result.info) {
    // 检查用户是否已忽略此版本
    const isDismissed = await isUpdateDismissed(result.info.version)
    if (!isDismissed) {
      // 显示更新 badge
      await chrome.action.setBadgeText({ text: 'NEW' })
      await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.update })
      logger.info('Update badge shown for version:', result.info.version)
    }
  }
}).catch(() => {})

/**
 * 清理遗留的动态规则（防止扩展崩溃后规则残留影响其他网站）
 */
async function clearOrphanedRules() {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules()
    if (rules.length > 0) {
      logger.info(`Clearing ${rules.length} orphaned dynamic rules...`)
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(r => r.id),
      })
      logger.info('Orphaned rules cleared')
    }
  } catch (error) {
    logger.error('Failed to clear orphaned rules:', error)
  }
}

// 启动时清理遗留规则
clearOrphanedRules()

logger.info('Service Worker started')
