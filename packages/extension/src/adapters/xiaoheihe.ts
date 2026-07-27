import {
  BaseAdapter,
  type Article,
  type AuthResult,
  type PlatformMeta,
  type SyncResult,
} from '@wechatsync/core'
import type { PublishOptions } from '@wechatsync/core/adapters/types'

const EDITOR_ORIGIN = 'https://www.xiaoheihe.cn'
const EDITOR_PATH_PREFIX = '/creator/editor'
const EDITOR_READY_SELECTOR = '.hb-page-creator__editor-article'
const TITLE_SELECTOR = '.editor-title__container .ProseMirror'
const BODY_SELECTOR = '.article__edit-content--inner .ProseMirror'
const SAVE_BUTTON_SELECTOR = '.editor-publish__save-draft'
const TAB_TIMEOUT_MS = 30_000
const SAVE_TIMEOUT_MS = 45_000

interface EditorResult {
  ok: boolean
  error?: string
}

interface ContentPart {
  type: 'html' | 'image'
  value: string
  mimeType?: string
  filename?: string
}

const XIAOHEIHE_IMAGE_HOSTS = [
  'xiaoheihe.cn',
  'xmcimg.com',
  'imgheybox.max-c.com',
  'static.max-c.com',
]

function createDraftUrl(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 10)
  const sessionRandom = Math.random().toString(36).slice(2, 10)
  return `${EDITOR_ORIGIN}${EDITOR_PATH_PREFIX}/draft/article/local_${timestamp}_${random}?draft_session_id=draft_session_${timestamp}_${sessionRandom}`
}

async function waitForTabComplete(tabId: number, timeoutMs = TAB_TIMEOUT_MS): Promise<chrome.tabs.Tab> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const tab = await chrome.tabs.get(tabId)
    if (tab.status === 'complete') return tab
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('小黑盒编辑器加载超时')
}

async function waitForDraftUrl(tabId: number): Promise<{ id: string; url: string }> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < SAVE_TIMEOUT_MS) {
    const tab = await chrome.tabs.get(tabId)
    const url = tab.url || ''
    const match = url.match(/\/creator\/editor\/edit\/article\/(\d+)/)
    if (match) return { id: match[1], url }
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  throw new Error('等待小黑盒保存草稿超时')
}

function isXiaoheiheImage(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return XIAOHEIHE_IMAGE_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error || new Error('读取图片失败'))
    reader.readAsDataURL(blob)
  })
}

function imageFilename(url: string, mimeType: string, index: number): string {
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg').replace(/\+xml$/, '') || 'png'
  try {
    const pathname = new URL(url).pathname
    const name = decodeURIComponent(pathname.split('/').pop() || '').replace(/[^\w.-]+/g, '_')
    if (name && /\.[a-z0-9]+$/i.test(name)) return name
  } catch {
    // data URL 或相对路径使用默认文件名
  }
  return `xiaoheihe-image-${index + 1}.${extension}`
}

export class XiaoheiheAdapter extends BaseAdapter {
  readonly meta: PlatformMeta = {
    id: 'xiaoheihe',
    name: '小黑盒',
    icon: 'https://www.xiaoheihe.cn/favicon.ico',
    homepage: `${EDITOR_ORIGIN}/creator`,
    capabilities: ['article', 'draft', 'image_upload'],
  }

  readonly preprocessConfig = {
    outputFormat: 'html' as const,
    removeLinks: false,
  }

  async checkAuth(): Promise<AuthResult> {
    let tabId: number | undefined
    try {
      const tab = await chrome.tabs.create({ url: createDraftUrl(), active: false })
      tabId = tab.id
      if (tabId === undefined) throw new Error('无法打开小黑盒编辑器')

      await waitForTabComplete(tabId)
      const [result] = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (readySelector: string) => {
          const startedAt = Date.now()
          while (Date.now() - startedAt < 20_000) {
            if (document.querySelector(readySelector)) {
              return { ready: true, loginVisible: false }
            }
            if (document.querySelector('a[href*="/login"], button[class*="login"]')) {
              return { ready: false, loginVisible: true }
            }
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          return { ready: false, loginVisible: false }
        },
        args: [EDITOR_READY_SELECTOR],
      })
      const state = result?.result as { ready?: boolean; loginVisible?: boolean } | undefined
      if (state?.ready) return { isAuthenticated: true }
      return {
        isAuthenticated: false,
        error: state?.loginVisible ? '请先登录小黑盒' : '未能打开小黑盒文章编辑器',
      }
    } catch (error) {
      return { isAuthenticated: false, error: (error as Error).message }
    } finally {
      if (tabId !== undefined) await chrome.tabs.remove(tabId).catch(() => undefined)
    }
  }

  async uploadImage(file: Blob, filename = 'image.png'): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('只能上传图片文件')

    let tabId: number | undefined
    try {
      const tab = await chrome.tabs.create({ url: createDraftUrl(), active: false })
      tabId = tab.id
      if (tabId === undefined) throw new Error('无法打开小黑盒编辑器')

      await waitForTabComplete(tabId)
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func: async (
          dataUrl: string,
          imageFilename: string,
          mimeType: string,
          readySelector: string,
          bodySelector: string
        ): Promise<EditorResult & { url?: string }> => {
          const startedAt = Date.now()
          let bodyEditor: HTMLElement | null = null
          while (Date.now() - startedAt < 20_000) {
            if (document.querySelector(readySelector)) {
              bodyEditor = document.querySelector<HTMLElement>(bodySelector)
              if (bodyEditor) break
            }
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          if (!bodyEditor) return { ok: false, error: '未找到小黑盒文章编辑器' }

          const response = await fetch(dataUrl)
          const blob = await response.blob()
          const transfer = new DataTransfer()
          transfer.items.add(new File([blob], imageFilename, { type: mimeType }))
          bodyEditor.focus()
          bodyEditor.dispatchEvent(new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: transfer,
          }))

          const uploadStartedAt = Date.now()
          while (Date.now() - uploadStartedAt < 30_000) {
            const image = bodyEditor.querySelector<HTMLImageElement>('img')
            if (image?.src && !image.src.startsWith('data:') && !image.src.startsWith('blob:')) {
              return { ok: true, url: image.src }
            }
            await new Promise(resolve => setTimeout(resolve, 250))
          }
          return { ok: false, error: '等待小黑盒图片上传超时' }
        },
        args: [
          await blobToDataUrl(file),
          filename,
          file.type,
          EDITOR_READY_SELECTOR,
          BODY_SELECTOR,
        ],
      })

      const result = injection?.result as (EditorResult & { url?: string }) | undefined
      if (!result?.ok || !result.url) throw new Error(result?.error || '小黑盒图片上传失败')
      return result.url
    } finally {
      if (tabId !== undefined) await chrome.tabs.remove(tabId).catch(() => undefined)
    }
  }

  async publish(article: Article, _options?: PublishOptions): Promise<SyncResult> {
    let tabId: number | undefined
    try {
      if (!article.title.trim()) throw new Error('文章标题不能为空')
      const html = article.html?.trim()
      if (!html) throw new Error('小黑盒同步需要 HTML 正文')

      const imageSources: string[] = []
      const imagePattern = /<img\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi
      let match: RegExpExecArray | null
      while ((match = imagePattern.exec(html)) !== null) {
        if (!isXiaoheiheImage(match[2])) imageSources.push(match[2])
      }

      const imageData = new Map<string, { dataUrl: string; mimeType: string; filename: string }>()
      for (let index = 0; index < imageSources.length; index++) {
        const source = imageSources[index]
        if (imageData.has(source)) continue

        const response = await this.runtime.fetch(source, { method: 'GET' })
        if (!response.ok) {
          throw new Error(`下载第 ${index + 1} 张图片失败: HTTP ${response.status}`)
        }
        const blob = await response.blob()
        if (!blob.type.startsWith('image/')) {
          throw new Error(`第 ${index + 1} 个资源不是有效图片`)
        }
        imageData.set(source, {
          dataUrl: await blobToDataUrl(blob),
          mimeType: blob.type,
          filename: imageFilename(source, blob.type, index),
        })
        _options?.onImageProgress?.(index + 1, imageSources.length)
      }

      const contentParts: ContentPart[] = []
      let lastIndex = 0
      imagePattern.lastIndex = 0
      while ((match = imagePattern.exec(html)) !== null) {
        if (match.index > lastIndex) {
          contentParts.push({ type: 'html', value: html.slice(lastIndex, match.index) })
        }
        const uploaded = imageData.get(match[2])
        if (uploaded) {
          contentParts.push({
            type: 'image',
            value: uploaded.dataUrl,
            mimeType: uploaded.mimeType,
            filename: uploaded.filename,
          })
        } else {
          contentParts.push({ type: 'html', value: match[0] })
        }
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < html.length) {
        contentParts.push({ type: 'html', value: html.slice(lastIndex) })
      }

      const tab = await chrome.tabs.create({ url: createDraftUrl(), active: false })
      tabId = tab.id
      if (tabId === undefined) throw new Error('无法打开小黑盒编辑器')

      await waitForTabComplete(tabId)
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func: async (
          title: string,
          parts: ContentPart[],
          readySelector: string,
          titleSelector: string,
          bodySelector: string,
          saveSelector: string
        ): Promise<EditorResult> => {
          const waitFor = async <T extends Element>(
            selector: string,
            timeoutMs = 20_000
          ): Promise<T | null> => {
            const startedAt = Date.now()
            while (Date.now() - startedAt < timeoutMs) {
              const element = document.querySelector<T>(selector)
              if (element) return element
              await new Promise(resolve => setTimeout(resolve, 200))
            }
            return null
          }

          const ready = await waitFor(readySelector)
          if (!ready) return { ok: false, error: '未找到小黑盒文章编辑器，请确认账号已登录' }

          const titleEditor = await waitFor<HTMLElement>(titleSelector)
          const bodyEditor = await waitFor<HTMLElement>(bodySelector)
          const saveButton = await waitFor<HTMLButtonElement>(saveSelector)
          if (!titleEditor || !bodyEditor || !saveButton) {
            return { ok: false, error: '小黑盒编辑器结构已变化，无法写入草稿' }
          }

          const replaceEditorContent = (
            editor: HTMLElement,
            value: string,
            command: 'insertText' | 'insertHTML'
          ): boolean => {
            editor.focus()
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(editor)
            selection?.removeAllRanges()
            selection?.addRange(range)
            const inserted = document.execCommand(command, false, value)
            editor.dispatchEvent(new InputEvent('input', {
              bubbles: true,
              inputType: command === 'insertText' ? 'insertText' : 'insertFromPaste',
              data: command === 'insertText' ? value : null,
            }))
            return inserted
          }

          if (!replaceEditorContent(titleEditor, title.slice(0, 30), 'insertText')) {
            return { ok: false, error: '写入小黑盒标题失败' }
          }

          bodyEditor.focus()
          document.execCommand('selectAll', false)
          document.execCommand('delete', false)

          for (const part of parts) {
            if (part.type === 'html') {
              if (part.value && !document.execCommand('insertHTML', false, part.value)) {
                return { ok: false, error: '写入小黑盒正文失败' }
              }
              continue
            }

            const beforeImages = bodyEditor.querySelectorAll('img').length
            const response = await fetch(part.value)
            const blob = await response.blob()
            const file = new File([blob], part.filename || 'image.png', {
              type: part.mimeType || blob.type || 'image/png',
            })
            const transfer = new DataTransfer()
            transfer.items.add(file)
            bodyEditor.dispatchEvent(new ClipboardEvent('paste', {
              bubbles: true,
              cancelable: true,
              clipboardData: transfer,
            }))

            const uploadStartedAt = Date.now()
            let uploaded = false
            while (Date.now() - uploadStartedAt < 30_000) {
              const images = Array.from(bodyEditor.querySelectorAll<HTMLImageElement>('img'))
              if (
                images.length > beforeImages &&
                images.slice(beforeImages).some(image =>
                  Boolean(image.src) &&
                  !image.src.startsWith('data:') &&
                  !image.src.startsWith('blob:')
                )
              ) {
                uploaded = true
                break
              }
              await new Promise(resolve => setTimeout(resolve, 250))
            }
            if (!uploaded) return { ok: false, error: '等待小黑盒图片上传超时' }
          }

          bodyEditor.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertFromPaste',
          }))
          await new Promise(resolve => setTimeout(resolve, 300))
          if (saveButton.disabled) return { ok: false, error: '小黑盒草稿尚未满足保存条件' }
          saveButton.click()
          return { ok: true }
        },
        args: [
          article.title,
          contentParts,
          EDITOR_READY_SELECTOR,
          TITLE_SELECTOR,
          BODY_SELECTOR,
          SAVE_BUTTON_SELECTOR,
        ],
      })

      const editorResult = injection?.result as EditorResult | undefined
      if (!editorResult?.ok) throw new Error(editorResult?.error || '写入小黑盒草稿失败')

      const draft = await waitForDraftUrl(tabId)
      return this.createResult(true, {
        postId: draft.id,
        postUrl: draft.url,
        draftOnly: true,
      })
    } catch (error) {
      return this.createResult(false, { error: (error as Error).message })
    } finally {
      if (tabId !== undefined) await chrome.tabs.remove(tabId).catch(() => undefined)
    }
  }
}
