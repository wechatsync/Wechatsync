/**
 * 微信公众号后台编辑器页面 Content Script
 * FAB 按钮 → 打开 SyncDialog iframe overlay
 */
import { createLogger } from '../lib/logger'
import { htmlToMarkdownNative } from '@wechatsync/core'
import { preprocessContentString, backupAndSimplifyCodeBlocks, restoreCodeBlocks } from '../lib/content-processor'

const logger = createLogger('WeixinEditor')

;(() => {

let dialogIframe: HTMLIFrameElement | null = null
let dialogContainer: HTMLElement | null = null

function isEditorPage(): boolean {
  const url = window.location.href
  return url.includes('mp.weixin.qq.com/cgi-bin/appmsg') &&
         (url.includes('action=edit') || url.includes('appmsg_edit'))
}

function injectSyncPanel() {
  if (document.querySelector('#wechatsync-editor-fab')) return

  const fab = document.createElement('button')
  fab.id = 'wechatsync-editor-fab'
  fab.title = '同步助手'
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
    </svg>
  `
  fab.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 80px;
    z-index: 2147483647;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.05)'
    fab.style.boxShadow = '0 6px 16px rgba(7, 193, 96, 0.5)'
  })
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)'
    fab.style.boxShadow = '0 4px 12px rgba(7, 193, 96, 0.4)'
  })

  fab.addEventListener('click', () => openSyncDialog())

  document.body.appendChild(fab)
}

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
    extractArticle(),
    chrome.runtime.sendMessage({ type: 'CHECK_ALL_AUTH' }).catch(() => ({ platforms: [] })),
    chrome.storage.local.get('hiddenPlatforms').catch(() => ({ hiddenPlatforms: [] })),
  ])

  if (!article) {
    chrome.runtime.sendMessage({
      type: 'TRACK_ARTICLE_EXTRACT',
      payload: { source: 'weixin-editor', success: false },
    }).catch(() => {})
    closeSyncDialog()
    return
  }

  chrome.runtime.sendMessage({
    type: 'TRACK_ARTICLE_EXTRACT',
    payload: {
      source: 'weixin-editor', success: true,
      hasTitle: !!article.title, hasContent: !!article.content,
      hasCover: !!article.cover, contentLength: article.content?.length || 0,
    },
  }).catch(() => {})

  const hiddenSet = new Set<string>(hiddenResult.hiddenPlatforms || [])
  const platforms = (platformResp.platforms || []).filter((p: any) => !hiddenSet.has(p.id))

  // 3. Swap loading for iframe
  if (!dialogContainer) return
  loadingEl.remove()

  dialogIframe = document.createElement('iframe')
  dialogIframe.src = chrome.runtime.getURL('src/sync-dialog/index.html')
  dialogIframe.style.cssText = `
    width: 400px; height: 520px; border: none;
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  `
  dialogContainer.appendChild(dialogIframe)
  document.body.appendChild(dialogContainer)

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
      const syncId = data.syncId
      chrome.runtime.sendMessage({
        type: 'SYNC_ARTICLE',
        payload: {
          article: data.article,
          platforms: data.platforms,
          source: 'weixin-editor',
          syncId,
        },
      }).then(response => {
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

// Respond to popup's article extraction and panel expansion
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_ARTICLE' && isEditorPage()) {
    extractArticle().then(article => {
      sendResponse({ article })
    }).catch(() => {
      sendResponse({ article: null })
    })
    return true
  }
  if (message.type === 'EXPAND_SYNC_PANEL') {
    openSyncDialog()
    sendResponse({ success: true })
    return true
  }
})

// ── Article extraction (unchanged) ──

async function extractArticle(): Promise<any | null> {
  try {
    logger.debug('Extracting article...')

    const titleSelectors = [
      '#js_title_place', '#title', 'input[name="title"]',
      '.weui-desktop-form__input', '.title_input input', '.js_title',
      '[data-id="title"]', '.appmsg_title input', '.appmsg-edit-title input',
    ]
    let title = ''
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel) as HTMLInputElement
      const value = el?.value?.trim() || el?.textContent?.trim()
      if (value) { title = value; break }
    }

    let content = ''

    // Try iframe editor (UEditor)
    const frameSelectors = [
      '#ueditor_0', 'iframe[id^="ueditor"]',
      '.edui-editor iframe', 'iframe.edui-body-container',
    ]
    for (const sel of frameSelectors) {
      try {
        const frame = document.querySelector(sel) as HTMLIFrameElement
        if (frame?.contentDocument?.body) {
          const body = frame.contentDocument.body
          const testHtml = body.innerHTML
          if (testHtml && testHtml.trim() && testHtml.trim() !== '<p><br></p>' && testHtml.length > 10) {
            const codeBlockBackups = backupAndSimplifyCodeBlocks(body)
            content = body.innerHTML
            restoreCodeBlocks(codeBlockBackups)
            break
          }
        }
      } catch { /* cross-origin */ }
    }

    // Try page containers
    if (!content) {
      const containerSelectors = ['.edui-body-container', '.rich_media_content', '#js_content', '.appmsg-edit-content']
      for (const sel of containerSelectors) {
        const el = document.querySelector(sel)
        if (el?.innerHTML && el.innerHTML.trim().length > 10) {
          const codeBlockBackups = backupAndSimplifyCodeBlocks(el)
          content = el.innerHTML
          restoreCodeBlocks(codeBlockBackups)
          break
        }
      }
    }

    // Try API fetch
    const appmsgid = new URLSearchParams(window.location.search).get('appmsgid')
    if (appmsgid && (!content || !title)) {
      const article = await fetchArticleByApi(appmsgid)
      if (article) return article
    }

    if (!title || !content) return null

    // Cover
    const coverSelectors = ['.appmsg_thumb img', '.js_cover img', '.cover-img img', '.appmsg_thumb_wrap img']
    let cover = ''
    for (const sel of coverSelectors) {
      const img = document.querySelector(sel) as HTMLImageElement
      if (img?.src && !img.src.includes('data:')) { cover = img.src; break }
    }

    // Summary
    const digestSelectors = ['[name="digest"]', '#digest', 'textarea.digest', '.appmsg_desc textarea']
    let summary = ''
    for (const sel of digestSelectors) {
      const el = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement
      if (el?.value) { summary = el.value; break }
    }

    const processedContent = preprocessContentString(content)
    const markdown = htmlToMarkdownNative(processedContent)
    return { title, html: processedContent, content: processedContent, markdown, summary, cover, source: { url: window.location.href, platform: 'weixin-editor' } }
  } catch (error) {
    logger.error('Extract failed:', error)
    return null
  }
}

async function fetchArticleByApi(appmsgid: string): Promise<any | null> {
  try {
    const tokenMatch = window.location.search.match(/token=(\d+)/)
    if (!tokenMatch) return null

    const token = tokenMatch[1]
    const tempRes = await fetch(
      `https://mp.weixin.qq.com/cgi-bin/appmsg?action=get_temp_url&appmsgid=${appmsgid}&itemidx=1&token=${token}&lang=zh_CN&f=json&ajax=1`,
      { credentials: 'include' }
    )
    const tempData = await tempRes.json()
    if (!tempData.temp_url) return null

    const htmlRes = await fetch(tempData.temp_url)
    const html = await htmlRes.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const title = doc.querySelector('#activity-name')?.textContent?.trim()
    const contentEl = doc.querySelector('#js_content')
    const cover = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const summary = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')

    if (!title || !contentEl) return null

    const processedContent = preprocessContentString(contentEl.innerHTML)
    const markdown = htmlToMarkdownNative(processedContent)
    return { title, html: processedContent, content: processedContent, markdown, summary, cover, source: { url: tempData.temp_url, platform: 'weixin' } }
  } catch (error) {
    logger.error('API fetch failed:', error)
    return null
  }
}

// Initialize
function init() {
  if (!isEditorPage()) return
  const inject = () => setTimeout(injectSyncPanel, 1500)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject)
  } else {
    inject()
  }
}

init()
})()
