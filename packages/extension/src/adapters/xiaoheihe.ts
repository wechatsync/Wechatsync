import {
  BaseAdapter,
  type Article,
  type AuthResult,
  type PlatformMeta,
  type SyncResult,
} from '@wechatsync/core'
import type { PublishOptions } from '@wechatsync/core/adapters/types'

const EDITOR_ORIGIN = 'https://www.xiaoheihe.cn'
const EDITOR_URL_PATTERN = `${EDITOR_ORIGIN}/creator/editor/*`
const READY_SELECTOR = '.hb-page-creator__editor-article'
const TITLE_SELECTOR = '.editor-title__container .ProseMirror'
const BODY_SELECTOR = '.article__edit-content--inner .ProseMirror'
const SAVE_SELECTOR = '.editor-publish__save-draft'
const TAB_TIMEOUT_MS = 30_000
const EDITOR_TIMEOUT_MS = 25_000
const IMAGE_TIMEOUT_MS = 45_000
const SAVE_TIMEOUT_MS = 45_000

interface EditorState {
  ok: boolean
  error?: string
}

interface UploadedImage {
  url: string
}

interface ContentPart {
  type: 'html' | 'image'
  value: string
}

function createDraftUrl(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 10)
  const sessionRandom = Math.random().toString(36).slice(2, 10)
  return `${EDITOR_ORIGIN}/creator/editor/draft/article/local_${timestamp}_${random}?draft_session_id=draft_session_${timestamp}_${sessionRandom}`
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error || new Error('读取图片失败'))
    reader.readAsDataURL(blob)
  })
}

function splitHtml(html: string): ContentPart[] {
  const parts: ContentPart[] = []
  const imagePattern = /<img\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = imagePattern.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', value: html.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'image', value: match[2] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < html.length) parts.push({ type: 'html', value: html.slice(lastIndex) })
  return parts
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
    removeIframes: true,
    removeComments: true,
    removeSpecialTags: true,
    processLazyImages: true,
  }

  private async ensureEditorTab(forceNew = false): Promise<number> {
    if (!this.runtime.tabs) throw new Error('小黑盒同步需要浏览器 tabs API 支持')
    if (!forceNew) {
      const existing = await this.runtime.tabs.query(EDITOR_URL_PATTERN)
      const articleTab = existing.find(tab => tab.url?.includes('/editor/draft/article/'))
      if (articleTab?.id) return articleTab.id
    }
    const tab = await this.runtime.tabs.create(createDraftUrl(), false)
    await this.runtime.tabs.waitForLoad(tab.id, TAB_TIMEOUT_MS)
    return tab.id
  }

  private async waitForEditor(tabId: number): Promise<EditorState> {
    if (!this.runtime.tabs) throw new Error('小黑盒同步需要浏览器 tabs API 支持')
    return this.runtime.tabs.executeScript(
      tabId,
      async (
        readySelector: string,
        titleSelector: string,
        bodySelector: string,
        timeoutMs: number
      ): Promise<EditorState> => {
        const startedAt = Date.now()
        while (Date.now() - startedAt < timeoutMs) {
          if (
            document.querySelector(readySelector) &&
            document.querySelector(titleSelector) &&
            document.querySelector(bodySelector)
          ) {
            return { ok: true }
          }
          await new Promise(resolve => setTimeout(resolve, 250))
        }
        const loginVisible = Boolean(
          document.querySelector('a[href*="/login"], button[class*="login"]')
        )
        return {
          ok: false,
          error: loginVisible
            ? '请先登录小黑盒'
            : '未找到小黑盒文章编辑器，页面结构可能已经变化',
        }
      },
      [READY_SELECTOR, TITLE_SELECTOR, BODY_SELECTOR, EDITOR_TIMEOUT_MS]
    )
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      const tabId = await this.ensureEditorTab()
      const state = await this.waitForEditor(tabId)
      return state.ok
        ? { isAuthenticated: true }
        : { isAuthenticated: false, error: state.error }
    } catch (error) {
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  private async initializeDraft(tabId: number, title: string): Promise<void> {
    if (!this.runtime.tabs) throw new Error('小黑盒同步需要浏览器 tabs API 支持')
    const state = await this.waitForEditor(tabId)
    if (!state.ok) throw new Error(state.error)

    const result = await this.runtime.tabs.executeScript(
      tabId,
      (
        draftTitle: string,
        titleSelector: string,
        bodySelector: string
      ): EditorState => {
        const titleEditor = document.querySelector<HTMLElement>(titleSelector)
        const bodyEditor = document.querySelector<HTMLElement>(bodySelector)
        if (!titleEditor || !bodyEditor) {
          return { ok: false, error: '小黑盒编辑器结构已变化，无法初始化草稿' }
        }

        const replaceContent = (editor: HTMLElement, value: string) => {
          editor.focus()
          const range = document.createRange()
          range.selectNodeContents(editor)
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
          document.execCommand('insertText', false, value)
          editor.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: value,
          }))
        }

        replaceContent(titleEditor, draftTitle.slice(0, 30))
        bodyEditor.focus()
        document.execCommand('selectAll', false)
        document.execCommand('delete', false)
        bodyEditor.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          inputType: 'deleteContent',
        }))
        return { ok: true }
      },
      [title, TITLE_SELECTOR, BODY_SELECTOR]
    )
    if (!result.ok) throw new Error(result.error || '初始化小黑盒草稿失败')
  }

  private async insertHtml(tabId: number, html: string): Promise<void> {
    if (!html || !this.runtime.tabs) return
    const result = await this.runtime.tabs.executeScript(
      tabId,
      (value: string, bodySelector: string): EditorState => {
        const editor = document.querySelector<HTMLElement>(bodySelector)
        if (!editor) return { ok: false, error: '未找到小黑盒正文编辑器' }
        editor.focus()
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
        const inserted = document.execCommand('insertHTML', false, value)
        editor.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          inputType: 'insertFromPaste',
        }))
        return inserted
          ? { ok: true }
          : { ok: false, error: '写入小黑盒正文失败' }
      },
      [html, BODY_SELECTOR]
    )
    if (!result.ok) throw new Error(result.error || '写入小黑盒正文失败')
  }

  private async uploadImageToEditor(
    tabId: number,
    image: Blob,
    filename: string
  ): Promise<UploadedImage> {
    if (!this.runtime.tabs) throw new Error('小黑盒同步需要浏览器 tabs API 支持')
    const dataUrl = await blobToDataUrl(image)
    const result = await this.runtime.tabs.executeScript(
      tabId,
      async (
        source: string,
        mimeType: string,
        imageFilename: string,
        bodySelector: string,
        timeoutMs: number
      ): Promise<EditorState & { url?: string }> => {
        const editor = document.querySelector<HTMLElement>(bodySelector)
        if (!editor) return { ok: false, error: '未找到小黑盒正文编辑器' }

        editor.focus()
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)

        const response = await fetch(source)
        const blob = await response.blob()
        const transfer = new DataTransfer()
        transfer.items.add(new File([blob], imageFilename, { type: mimeType }))
        const beforeCount = editor.querySelectorAll('img').length
        editor.dispatchEvent(new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: transfer,
        }))

        const startedAt = Date.now()
        while (Date.now() - startedAt < timeoutMs) {
          const images = Array.from(editor.querySelectorAll<HTMLImageElement>('img'))
          const uploaded = images.slice(beforeCount).find(item =>
            Boolean(item.src) &&
            !item.src.startsWith('data:') &&
            !item.src.startsWith('blob:')
          )
          if (uploaded) return { ok: true, url: uploaded.src }
          await new Promise(resolve => setTimeout(resolve, 250))
        }
        return { ok: false, error: '等待小黑盒图片上传超时' }
      },
      [dataUrl, image.type || 'image/png', filename, BODY_SELECTOR, IMAGE_TIMEOUT_MS]
    )
    if (!result.ok || !result.url) throw new Error(result.error || '小黑盒图片上传失败')
    return { url: result.url }
  }

  async uploadImage(file: Blob, filename = 'image.png'): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('只能上传图片文件')
    const tabId = await this.ensureEditorTab()
    const state = await this.waitForEditor(tabId)
    if (!state.ok) throw new Error(state.error)
    return (await this.uploadImageToEditor(tabId, file, filename)).url
  }

  private async saveDraft(tabId: number): Promise<{ id?: string; url: string }> {
    if (!this.runtime.tabs) throw new Error('小黑盒同步需要浏览器 tabs API 支持')
    const clicked = await this.runtime.tabs.executeScript(
      tabId,
      (saveSelector: string): EditorState => {
        const button = document.querySelector<HTMLButtonElement>(saveSelector)
        if (!button) return { ok: false, error: '未找到小黑盒“保存草稿”按钮' }
        if (button.disabled) return { ok: false, error: '小黑盒草稿尚未满足保存条件' }
        button.click()
        return { ok: true }
      },
      [SAVE_SELECTOR]
    )
    if (!clicked.ok) throw new Error(clicked.error || '保存小黑盒草稿失败')

    const startedAt = Date.now()
    while (Date.now() - startedAt < SAVE_TIMEOUT_MS) {
      const tabs = await this.runtime.tabs.query(EDITOR_URL_PATTERN)
      const current = tabs.find(tab => tab.id === tabId)
      const url = current?.url || ''
      const match = url.match(/\/creator\/editor\/edit\/article\/(\d+)/)
      if (match) return { id: match[1], url }
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    throw new Error('等待小黑盒保存草稿超时')
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    try {
      const title = article.title.trim()
      const html = article.html?.trim()
      if (!title) throw new Error('文章标题不能为空')
      if (!html) throw new Error('小黑盒同步需要 HTML 正文')

      // 每次同步新建独立草稿，避免覆盖用户正在编辑的页面。
      const tabId = await this.ensureEditorTab(true)
      await this.initializeDraft(tabId, title)
      const parts = splitHtml(html)
      const totalImages = parts.filter(part => part.type === 'image').length
      let uploadedImages = 0

      for (const part of parts) {
        if (part.type === 'html') {
          await this.insertHtml(tabId, part.value)
          continue
        }

        const response = await this.runtime.fetch(part.value)
        if (!response.ok) {
          throw new Error(`下载第 ${uploadedImages + 1} 张图片失败: HTTP ${response.status}`)
        }
        const blob = await response.blob()
        if (!blob.type.startsWith('image/')) {
          throw new Error(`第 ${uploadedImages + 1} 个资源不是有效图片`)
        }
        const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png'
        await this.uploadImageToEditor(
          tabId,
          blob,
          `xiaoheihe-image-${uploadedImages + 1}.${extension}`
        )
        uploadedImages++
        options?.onImageProgress?.(uploadedImages, totalImages)
      }

      const draft = await this.saveDraft(tabId)
      return this.createResult(true, {
        postId: draft.id,
        postUrl: draft.url,
        draftOnly: true,
        message: '已保存为小黑盒文章草稿，请检查排版后再发布',
      })
    } catch (error) {
      return this.createResult(false, { error: (error as Error).message })
    }
  }
}
