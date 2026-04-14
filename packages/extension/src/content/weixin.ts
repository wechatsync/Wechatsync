/**
 * 微信公众号文章页 Content Script
 * FAB 按钮 → 打开 SyncDialog iframe overlay
 */

import { htmlToMarkdownNative, type PreprocessConfig } from '@wechatsync/core'
import { preprocessContentDOM, preprocessForPlatform, backupAndSimplifyCodeBlocks, restoreCodeBlocks } from '../lib/content-processor'
import { createSyncFab } from '../lib/fab'

;(() => {

let dialogIframe: HTMLIFrameElement | null = null
let dialogContainer: HTMLElement | null = null

function injectSyncButton() {
  const articleContent = document.querySelector('#js_content')
  if (!articleContent) return
  if (document.querySelector('#wechatsync-fab')) return

  const fab = createSyncFab({
    onClick: () => openSyncDialog(),
  })

  document.body.appendChild(fab)
}

/**
 * Open sync dialog iframe overlay.
 * Shows loading indicator immediately, then swaps to dialog when ready.
 */
async function openSyncDialog() {
  if (dialogContainer) return

  // 1. Show loading overlay immediately
  dialogContainer = document.createElement('div')
  dialogContainer.id = 'wechatsync-dialog-overlay'
  dialogContainer.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483647;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `
  dialogContainer.addEventListener('click', (e) => {
    if (e.target === dialogContainer) closeSyncDialog()
  })

  const loadingEl = document.createElement('div')
  loadingEl.style.cssText = `
    background: white; padding: 20px 32px; border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    display: flex; align-items: center; gap: 12px;
  `
  loadingEl.innerHTML = `
    <div style="width:20px;height:20px;border:3px solid #e5e5e5;border-top-color:#07c160;border-radius:50%;animation:wcs-spin 0.8s linear infinite;"></div>
    <span style="font-size:14px;color:#333;">正在提取文章...</span>
    <style>@keyframes wcs-spin { to { transform: rotate(360deg); } }</style>
  `
  dialogContainer.appendChild(loadingEl)
  document.body.appendChild(dialogContainer)

  // 2. Extract article + load platforms + hidden config in parallel
  const [article, platformResp, hiddenResult] = await Promise.all([
    Promise.resolve(extractWeixinArticle()),
    chrome.runtime.sendMessage({ type: 'CHECK_ALL_AUTH' }).catch(() => ({ platforms: [] })),
    chrome.storage.local.get('hiddenPlatforms').catch(() => ({ hiddenPlatforms: [] })),
  ])

  if (!article) {
    chrome.runtime.sendMessage({
      type: 'TRACK_ARTICLE_EXTRACT',
      payload: { source: 'weixin', success: false },
    }).catch(() => {})
    closeSyncDialog()
    return
  }

  chrome.runtime.sendMessage({
    type: 'TRACK_ARTICLE_EXTRACT',
    payload: {
      source: 'weixin', success: true,
      hasTitle: !!article.title, hasContent: !!article.content,
      hasCover: !!article.cover, contentLength: article.content?.length || 0,
    },
  }).catch(() => {})

  const hiddenSet = new Set<string>(hiddenResult.hiddenPlatforms || [])
  const platforms = (platformResp.platforms || []).filter((p: any) => !hiddenSet.has(p.id))

  // 3. Swap loading for iframe
  if (!dialogContainer) return // closed during loading
  loadingEl.remove()

  dialogIframe = document.createElement('iframe')
  dialogIframe.src = chrome.runtime.getURL('src/sync-dialog/index.html')
  dialogIframe.style.cssText = `
    width: 400px; height: 520px; border: none;
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  `
  dialogContainer.appendChild(dialogIframe)

  // 4. Send data when iframe is ready
  const handleReady = (event: MessageEvent) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      if (data.type === 'SYNC_DIALOG_READY') {
        window.removeEventListener('message', handleReady)
        dialogIframe?.contentWindow?.postMessage(JSON.stringify({
          type: 'INIT_DATA',
          article,
          platforms,
        }), '*')
      }
    } catch { /* ignore */ }
  }
  window.addEventListener('message', handleReady)
}

function closeSyncDialog() {
  if (dialogContainer) {
    dialogContainer.remove()
    dialogContainer = null
    dialogIframe = null
  }
}

// Listen to messages from iframe
window.addEventListener('message', (event) => {
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

    if (data.type === 'CLOSE_SYNC_DIALOG') {
      closeSyncDialog()
    } else if (data.type === 'START_SYNC') {
      // Forward sync request to background
      const syncId = data.syncId
      chrome.runtime.sendMessage({
        type: 'SYNC_ARTICLE',
        payload: {
          article: data.article,
          platforms: data.platforms,
          source: 'weixin',
          syncId,
        },
      }).then(response => {
        // Forward completion to iframe
        dialogIframe?.contentWindow?.postMessage(JSON.stringify({
          type: 'SYNC_COMPLETE',
          results: response.results,
          rateLimitWarning: response.rateLimitWarning,
          syncId,
        }), '*')
      }).catch(error => {
        dialogIframe?.contentWindow?.postMessage(JSON.stringify({
          type: 'SYNC_ERROR',
          error: (error as Error).message,
          syncId,
        }), '*')
      })
    }
  } catch { /* ignore */ }
})

// Forward progress messages from background to iframe
chrome.runtime.onMessage.addListener((message) => {
  if (!dialogIframe) return

  if (message.type === 'SYNC_PROGRESS') {
    dialogIframe.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_PROGRESS',
      result: message.payload?.result,
      syncId: message.syncId,
    }), '*')
  }
  if (message.type === 'SYNC_DETAIL_PROGRESS') {
    dialogIframe.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_DETAIL_PROGRESS',
      progress: message.payload,
      syncId: message.syncId,
    }), '*')
  }
})

// Respond to popup's article extraction request and preprocessing
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_ARTICLE') {
    const article = extractWeixinArticle()
    sendResponse({ article })
    return true
  }

  if (message.type === 'PREPROCESS_FOR_PLATFORMS') {
    const { rawHtml, platforms, configs } = message.payload as {
      rawHtml: string
      platforms: string[]
      configs: Record<string, PreprocessConfig>
    }
    const platformContents: Record<string, { html: string; markdown: string }> = {}
    for (const platformId of platforms) {
      const config = configs[platformId]
      if (config) {
        platformContents[platformId] = preprocessForPlatform(rawHtml, config)
      }
    }
    sendResponse({ platformContents })
    return true
  }
})

/**
 * Extract WeChat article from page DOM
 */
function extractWeixinArticle() {
  const title = document.querySelector('#activity-name')?.textContent?.trim()
  const contentEl = document.querySelector('#js_content')
  const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
  const summary = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

  if (!title || !contentEl) return null

  // 保存原始 HTML（微信到微信同步时直接使用，避免代码块格式丢失）
  const rawHtml = contentEl.innerHTML

  const codeBlockBackups = backupAndSimplifyCodeBlocks(contentEl)

  try {
    const clonedContent = contentEl.cloneNode(true) as HTMLElement
    restoreCodeBlocks(codeBlockBackups)
    preprocessContentDOM(clonedContent)

    const htmlContent = clonedContent.innerHTML
    const markdown = htmlToMarkdownNative(htmlContent)

    return {
      title,
      html: htmlContent,
      content: htmlContent,
      rawHtml,
      markdown,
      summary: summary || undefined,
      cover: cover || undefined,
      source: { url: window.location.href, platform: 'weixin' },
    }
  } catch (e) {
    restoreCodeBlocks(codeBlockBackups)
    throw e
  }
}

// Inject on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectSyncButton)
} else {
  injectSyncButton()
}
})()
