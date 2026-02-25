/**
 * 文章提取器 Content Script
 * 从当前页面提取文章内容
 *
 * 提取策略:
 * 1. 特定平台提取器 (微信公众号等)
 * 2. Safari ReaderArticleFinder (通用，效果最佳)
 * 3. Mozilla Readability (通用，作为回退)
 * 4. <article> 标签 (最后手段)
 *
 * 内容格式:
 * - 在页面端使用 Turndown + 原生 DOM 将 HTML 转为 Markdown
 * - Service Worker 只需处理 Markdown，无需 DOM 解析
 */

import { extractArticle as extractWithReader, ReaderResult } from '../lib/reader'
import { htmlToMarkdownNative, type PreprocessConfig } from '@wechatsync/core'
import { createLogger } from '../lib/logger'
import { preprocessContentDOM, preprocessForPlatform, backupAndSimplifyCodeBlocks, restoreCodeBlocks, type PreprocessResult } from '../lib/content-processor'

const logger = createLogger('Extractor')

interface ExtractedArticle {
  title: string
  markdown: string   // Markdown 格式（主要）
  html?: string      // 原始 HTML（可选，用于某些平台）
  summary?: string
  cover?: string
  source: {
    url: string
    platform: string
  }
}

/**
 * 提取文章内容
 */
function extractArticle(): ExtractedArticle | null {
  const url = window.location.href

  // 微信公众号
  if (url.includes('mp.weixin.qq.com')) {
    return extractWeixinArticle()
  }

  // 通用提取 (使用 Safari Reader / Readability)
  return extractGenericArticle()
}

/**
 * 提取微信公众号文章
 */
function extractWeixinArticle(): ExtractedArticle | null {
  const title = document.querySelector('#activity-name')?.textContent?.trim()
  const contentEl = document.querySelector('#js_content')
  const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
  const summary = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

  if (!title || !contentEl) {
    return null
  }

  // 在原始 DOM 上简化代码块（innerText 只在真实 DOM 上正确工作）
  const codeBlockBackups = backupAndSimplifyCodeBlocks(contentEl)

  try {
    // 克隆内容元素（此时代码块已经是简化后的纯文本）
    const clonedContent = contentEl.cloneNode(true) as HTMLElement

    // 恢复原始 DOM（尽早恢复，避免影响页面显示）
    restoreCodeBlocks(codeBlockBackups)

    // 预处理克隆的内容
    preprocessContentDOM(clonedContent)

    // 获取 HTML 并转换为 Markdown
    const html = clonedContent.innerHTML
    const markdown = htmlToMarkdownNative(html)

    return {
      title,
      markdown,
      html, // 保留原始 HTML，微信平台需要
      summary: summary || undefined,
      cover: cover || undefined,
      source: {
        url: window.location.href,
        platform: 'weixin',
      },
    }
  } catch (e) {
    restoreCodeBlocks(codeBlockBackups)
    throw e
  }
}

/**
 * 通用文章提取
 * 使用 Safari ReaderArticleFinder / Mozilla Readability
 */
function extractGenericArticle(): ExtractedArticle | null {
  // 使用统一的 Reader 提取器
  const result = extractWithReader()

  if (result) {
    return readerResultToArticle(result)
  }

  // 如果 Reader 提取失败，尝试简单的选择器
  return extractWithSelectors()
}

/**
 * 将 ReaderResult 转换为 ExtractedArticle
 */
function readerResultToArticle(result: ReaderResult): ExtractedArticle {
  // 创建临时 DOM 进行预处理
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = result.content
  preprocessContentDOM(tempDiv)
  const processedHtml = tempDiv.innerHTML

  // 转换为 Markdown
  const markdown = htmlToMarkdownNative(processedHtml)

  return {
    title: result.title,
    markdown,
    html: processedHtml, // 预处理后的 HTML
    summary: result.excerpt,
    cover: result.leadingImage || result.mainImage,
    source: {
      url: window.location.href,
      platform: result.extractor,
    },
  }
}

/**
 * 使用 CSS 选择器提取 (最后手段)
 */
function extractWithSelectors(): ExtractedArticle | null {
  // 尝试常见的文章选择器
  const selectors = {
    title: [
      'h1',
      'article h1',
      '.article-title',
      '.post-title',
      '[itemprop="headline"]',
    ],
    content: [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '[itemprop="articleBody"]',
      'main',
    ],
  }

  let title: string | null = null
  for (const selector of selectors.title) {
    const el = document.querySelector(selector)
    if (el?.textContent?.trim()) {
      title = el.textContent.trim()
      break
    }
  }

  let html: string | null = null
  for (const selector of selectors.content) {
    const el = document.querySelector(selector)
    if (el?.innerHTML) {
      // 在原始 DOM 上简化代码块
      const codeBlockBackups = backupAndSimplifyCodeBlocks(el)

      try {
        // 克隆并预处理
        const clonedContent = el.cloneNode(true) as HTMLElement

        // 恢复原始 DOM
        restoreCodeBlocks(codeBlockBackups)

        preprocessContentDOM(clonedContent)
        html = clonedContent.innerHTML
        break
      } catch (e) {
        restoreCodeBlocks(codeBlockBackups)
        throw e
      }
    }
  }

  // 回退到 meta 标签
  if (!title) {
    title = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
      || document.title
  }

  if (!title || !html) {
    return null
  }

  // 转换为 Markdown
  const markdown = htmlToMarkdownNative(html)

  const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
  const summary = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

  return {
    title,
    markdown,
    html, // 保留原始 HTML
    summary: summary || undefined,
    cover: cover || undefined,
    source: {
      url: window.location.href,
      platform: 'selector',
    },
  }
}

// ========== 悬浮按钮 ==========

let floatingButton: HTMLDivElement | null = null

function injectFloatingButton() {
  if (floatingButton) return
  // 微信公众号页面已有专属悬浮按钮，不重复注入
  if (window.location.hostname === 'mp.weixin.qq.com') return

  const btn = document.createElement('div')
  btn.id = 'wechatsync-floating-btn'
  btn.title = '同步文章'
  btn.style.cssText = `
    position: fixed !important;
    right: 24px !important;
    bottom: 88px !important;
    height: 40px !important;
    padding: 0 16px !important;
    border-radius: 20px !important;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%) !important;
    box-shadow: 0 4px 12px rgba(7, 193, 96, 0.35) !important;
    cursor: pointer !important;
    z-index: 2147483646 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s !important;
    user-select: none !important;
    color: white !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    border: none !important;
  `
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
    </svg>
    <span style="color:white;font-size:14px;font-weight:500;">同步</span>
  `

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)'
    btn.style.boxShadow = '0 6px 20px rgba(7, 193, 96, 0.45)'
  })
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)'
    btn.style.boxShadow = '0 4px 12px rgba(7, 193, 96, 0.35)'
  })
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_OPEN_EDITOR' })
  })

  document.body.appendChild(btn)
  floatingButton = btn
}

function removeFloatingButton() {
  if (floatingButton) {
    floatingButton.remove()
    floatingButton = null
  }
}

// 初始化：读取设置决定是否注入
chrome.storage.local.get('floatingButtonEnabled', (result) => {
  if (result.floatingButtonEnabled) {
    injectFloatingButton()
  }
})

// 监听设置变化，实时响应
chrome.storage.onChanged.addListener((changes) => {
  if (changes.floatingButtonEnabled) {
    if (changes.floatingButtonEnabled.newValue) {
      injectFloatingButton()
    } else {
      removeFloatingButton()
    }
  }
})

// ========== 编辑器注入 ==========

let editorIframe: HTMLIFrameElement | null = null
let editorContainer: HTMLDivElement | null = null

/**
 * 打开编辑器
 */
function openEditor(article: ExtractedArticle, platforms: any[], selectedPlatformIds?: string[]) {
  if (editorContainer) {
    // 已经打开，重新发送数据
    sendDataToEditor(article, platforms, selectedPlatformIds)
    return
  }

  // 创建全屏容器
  editorContainer = document.createElement('div')
  editorContainer.id = 'wechatsync-editor-container'
  editorContainer.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  `

  // 创建 iframe
  editorIframe = document.createElement('iframe')
  editorIframe.src = chrome.runtime.getURL('src/editor/index.html')
  editorIframe.style.cssText = `
    width: 100vw !important;
    height: 100vh !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
  `

  editorContainer.appendChild(editorIframe)
  document.body.appendChild(editorContainer)

  // 禁止页面滚动
  document.body.style.overflow = 'hidden'

  // 等待 iframe 准备好后发送数据
  const handleEditorReady = (event: MessageEvent) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      if (data.type === 'EDITOR_READY') {
        sendDataToEditor(article, platforms, selectedPlatformIds)
        window.removeEventListener('message', handleEditorReady)
      }
    } catch (e) {
      // ignore
    }
  }
  window.addEventListener('message', handleEditorReady)
}

/**
 * 发送数据到编辑器
 */
function sendDataToEditor(article: ExtractedArticle, platforms: any[], selectedPlatformIds?: string[]) {
  if (!editorIframe?.contentWindow) return

  // 发送文章数据
  editorIframe.contentWindow.postMessage(JSON.stringify({
    type: 'ARTICLE_DATA',
    article: {
      title: article.title,
      content: article.html || article.markdown,
      cover: article.cover,
      url: article.source.url,
    },
  }), '*')

  // 发送平台数据（包含已选中的平台）
  editorIframe.contentWindow.postMessage(JSON.stringify({
    type: 'PLATFORMS_DATA',
    platforms,
    selectedPlatformIds, // 传递已选中的平台 ID
  }), '*')
}

/**
 * 关闭编辑器
 */
function closeEditor() {
  if (editorContainer) {
    editorContainer.remove()
    editorContainer = null
    editorIframe = null
    document.body.style.overflow = ''
  }
}

/**
 * 为多个平台预处理内容
 * @param rawHtml 原始 HTML
 * @param platformIds 平台 ID 列表
 * @param configs 各平台的预处理配置
 * @returns 各平台的预处理结果
 */
function preprocessForMultiplePlatformsLocal(
  rawHtml: string,
  platformIds: string[],
  configs: Record<string, PreprocessConfig>
): Record<string, PreprocessResult> {
  const results: Record<string, PreprocessResult> = {}

  for (const platformId of platformIds) {
    const config = configs[platformId]
    if (config) {
      results[platformId] = preprocessForPlatform(rawHtml, config)
    } else {
      // 没有配置的平台使用默认处理
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = rawHtml
      preprocessContentDOM(tempDiv)
      const html = tempDiv.innerHTML
      results[platformId] = {
        html,
        markdown: htmlToMarkdownNative(html),
      }
    }
  }

  return results
}

/**
 * 监听编辑器消息
 */
window.addEventListener('message', async (event) => {
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

    if (data.type === 'CLOSE_EDITOR') {
      closeEditor()
    } else if (data.type === 'START_SYNC') {
      // 转发同步请求到 background
      // 编辑器传来的是 HTML content
      const rawHtml = data.article.content || ''
      const platforms: string[] = data.platforms || []

      // 从 background 获取各平台的预处理配置
      const configResponse = await chrome.runtime.sendMessage({
        type: 'GET_PREPROCESS_CONFIGS',
        platforms,
      })

      const configs: Record<string, PreprocessConfig> = configResponse?.configs || {}

      // 为每个平台分别预处理
      const platformContents = preprocessForMultiplePlatformsLocal(rawHtml, platforms, configs)

      logger.debug('Preprocessed contents for platforms:', Object.keys(platformContents))

      chrome.runtime.sendMessage({
        type: 'START_SYNC_FROM_EDITOR',
        article: {
          ...data.article,
          // 保留一份默认内容（兼容）
          html: rawHtml,
          markdown: htmlToMarkdownNative(rawHtml),
          // 各平台专属预处理内容
          platformContents,
        },
        platforms,
        syncId: data.syncId,  // 转发 syncId
      })
    }
  } catch (e) {
    logger.error('Error handling editor message:', e)
  }
})

/**
 * 监听 background 消息，转发同步进度到编辑器
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_ARTICLE') {
    const article = extractArticle()
    sendResponse({ article })
  } else if (message.type === 'OPEN_EDITOR') {
    // 打开编辑器
    const article = extractArticle()
    if (article) {
      // 传递平台列表和已选中的平台 ID
      openEditor(article, message.platforms || [], message.selectedPlatforms || [])
      sendResponse({ success: true })
    } else {
      sendResponse({ success: false, error: '无法提取文章内容' })
    }
  } else if (message.type === 'PREPROCESS_FOR_PLATFORMS') {
    // 为多个平台预处理内容（由 background 调用）
    const { rawHtml, platforms, configs } = message.payload as {
      rawHtml: string
      platforms: string[]
      configs: Record<string, PreprocessConfig>
    }
    const platformContents = preprocessForMultiplePlatformsLocal(rawHtml, platforms, configs)
    sendResponse({ platformContents })
  } else if (message.type === 'SYNC_PROGRESS') {
    // 转发同步进度到编辑器（带上 syncId）
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_PROGRESS',
      result: message.result,
      syncId: message.syncId,
    }), '*')
  } else if (message.type === 'SYNC_DETAIL_PROGRESS') {
    // 转发详细进度到编辑器（带上 syncId）
    // 兼容两种格式：message.payload (from SYNC_ARTICLE) 或直接展开 (from START_SYNC_FROM_EDITOR)
    const progress = message.payload || {
      platform: message.platform,
      platformName: message.platformName,
      stage: message.stage,
      imageProgress: message.imageProgress,
      result: message.result,
      error: message.error,
    }
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_DETAIL_PROGRESS',
      progress,
      syncId: message.syncId,
    }), '*')
  } else if (message.type === 'SYNC_COMPLETE') {
    // 同步完成（带上 syncId）
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_COMPLETE',
      rateLimitWarning: message.rateLimitWarning,
      syncId: message.syncId,
    }), '*')
  } else if (message.type === 'SYNC_ERROR') {
    // 同步错误（带上 syncId）
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_ERROR',
      error: message.error,
      syncId: message.syncId,
    }), '*')
  }
  return true
})
