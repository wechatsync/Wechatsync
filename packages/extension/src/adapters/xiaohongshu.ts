import {
  BaseAdapter,
  type Article,
  type AuthResult,
  type PlatformMeta,
  type SyncResult,
} from '@wechatsync/core'
import type { PublishOptions } from '@wechatsync/core/adapters/types'
import {
  markdownToXiaohongshuProseMirror,
  type XiaohongshuProseMirrorNode,
} from './xiaohongshu-prosemirror'

const EDITOR_URL = 'https://creator.xiaohongshu.com/publish/publish?from=menu&target=article'
const CREATOR_ORIGIN = 'https://creator.xiaohongshu.com'
const MAX_CONTENT_LENGTH = 10_000
const TAB_TIMEOUT_MS = 30_000

interface UploadedImage {
  url: string
  fileId: string
  width: number
  height: number
}

interface DraftWriteResult {
  success: boolean
  error?: string
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const random = Math.random() * 16 | 0
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}

function getPlainTextLength(content: string): number {
  let text = content
  if (/<[^>]+>/.test(content)) {
    text = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number.parseInt(code, 10)))
  } else {
    text = content
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/^[\-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/^[-*_]{3,}\s*$/gm, '')
  }
  return text.replace(/\s+/g, ' ').trim().length
}

export class XiaohongshuAdapter extends BaseAdapter {
  readonly meta: PlatformMeta = {
    id: 'xiaohongshu',
    name: '小红书',
    icon: 'https://www.xiaohongshu.com/favicon.ico',
    homepage: EDITOR_URL,
    capabilities: ['article', 'draft', 'image_upload'],
  }

  private userId: string | number | null = null
  private headerRuleIds: string[] = []

  private async setupHeaderRules(): Promise<void> {
    if (!this.runtime.headerRules || this.headerRuleIds.length) return
    for (const rule of [
      {
        urlFilter: '*://creator.xiaohongshu.com/*',
        headers: { Origin: CREATOR_ORIGIN, Referer: EDITOR_URL },
        resourceTypes: ['xmlhttprequest'],
      },
      {
        urlFilter: '*://ros-upload.xiaohongshu.com/*',
        headers: { Origin: CREATOR_ORIGIN, Referer: `${CREATOR_ORIGIN}/` },
        resourceTypes: ['xmlhttprequest'],
      },
    ]) {
      this.headerRuleIds.push(await this.runtime.headerRules.add(rule))
    }
  }

  private async clearHeaderRules(): Promise<void> {
    if (!this.runtime.headerRules) return
    const ids = this.headerRuleIds.splice(0)
    await Promise.all(ids.map(id => this.runtime.headerRules!.remove(id).catch(() => undefined)))
  }

  private async ensureCreatorTab(): Promise<number> {
    if (!this.runtime.tabs) throw new Error('小红书发布需要浏览器 tabs API 支持')
    const existing = await this.runtime.tabs.query(`${CREATOR_ORIGIN}/*`)
    if (existing[0]?.id) return existing[0].id
    const tab = await this.runtime.tabs.create(EDITOR_URL, false)
    await this.runtime.tabs.waitForLoad(tab.id, TAB_TIMEOUT_MS)
    return tab.id
  }

  async checkAuth(): Promise<AuthResult> {
    await this.setupHeaderRules()
    try {
      const response = await this.runtime.fetch(`${CREATOR_ORIGIN}/api/galaxy/user/info`, {
        credentials: 'include',
        headers: { Accept: 'application/json, text/plain, */*' },
      })
      const result = await response.json() as {
        success?: boolean
        data?: { userId: string | number; userName?: string; userAvatar?: string }
      }
      if (!result.success || !result.data) {
        return { isAuthenticated: false, error: '未登录小红书创作者平台' }
      }
      this.userId = result.data.userId
      return {
        isAuthenticated: true,
        userId: this.userId as string,
        username: result.data.userName,
        avatar: result.data.userAvatar,
      }
    } catch (error) {
      return { isAuthenticated: false, error: (error as Error).message }
    } finally {
      await this.clearHeaderRules()
    }
  }

  private async uploadImageByUrl(url: string): Promise<UploadedImage> {
    if (!this.runtime.tabs) throw new Error('小红书图片上传需要浏览器 tabs API 支持')
    const tabId = await this.ensureCreatorTab()
    let base64: string
    let mimeType: string
    let width = 0
    let height = 0

    if (url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) throw new Error('Invalid data URI')
      mimeType = match[1]
      base64 = match[2]
      try {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let index = 0; index < binary.length; index++) {
          bytes[index] = binary.charCodeAt(index)
        }
        const bitmap = await createImageBitmap(new Blob([bytes], { type: mimeType }))
        width = bitmap.width
        height = bitmap.height
        bitmap.close()
      } catch {
        // 与原版一致：尺寸读取失败不阻止上传。
      }
    } else {
      const blob = await (await fetch(url)).blob()
      mimeType = blob.type || 'image/jpeg'
      try {
        const bitmap = await createImageBitmap(blob)
        width = bitmap.width
        height = bitmap.height
        bitmap.close()
      } catch {
        // 与原版一致：尺寸读取失败不阻止上传。
      }
      const bytes = new Uint8Array(await blob.arrayBuffer())
      let binary = ''
      for (let index = 0; index < bytes.length; index++) {
        binary += String.fromCharCode(bytes[index])
      }
      base64 = btoa(binary)
    }

    const uploaded = await this.runtime.tabs.executeScript(
      tabId,
      async (imageBase64: string, mimeType: string) => {
        try {
          const permitPath =
            '/api/media/v1/upload/creator/permit?biz_name=spectrum&scene=image&file_count=1&version=1&source=web'
          const signedWindow = window as typeof window & {
            _webmsxyw?: (path: string) => Record<string, string>
          }
          const headers: Record<string, string> = {
            Accept: 'application/json, text/plain, */*',
          }
          const signature = signedWindow._webmsxyw?.(permitPath)
          if (signature) {
            headers['X-s'] = signature['X-s']
            headers['X-t'] = signature['X-t']
            headers['X-s-common'] = signature['X-s-common']
          }

          const permit = await (
            await fetch(`https://creator.xiaohongshu.com${permitPath}`, {
              credentials: 'include',
              headers,
            })
          ).json()
          const permits = permit?.data?.uploadTempPermits as Array<{
            uploadAddr: string
            token: string
            fileIds: string[]
          }> | undefined
          if (!permit?.success || !permits?.length) {
            return { success: false, error: `获取上传凭证失败: ${JSON.stringify(permit)}` }
          }

          const selected =
            permits.find(item => item.uploadAddr === 'ros-upload.xiaohongshu.com') || permits[0]
          const fileId = selected.fileIds?.[0]
          if (!fileId) return { success: false, error: '获取 fileId 失败' }

          const binary = atob(imageBase64)
          const bytes = new Uint8Array(binary.length)
          for (let index = 0; index < binary.length; index++) {
            bytes[index] = binary.charCodeAt(index)
          }
          const uploadResponse = await fetch(`https://${selected.uploadAddr}/${fileId}`, {
            method: 'PUT',
            headers: {
              Authorization: selected.token,
              'Content-Type': mimeType,
              'x-cos-security-token': selected.token,
            },
            body: new Blob([bytes], { type: mimeType }),
          })
          if (!uploadResponse.ok) {
            return {
              success: false,
              error: `上传失败: ${uploadResponse.status} ${uploadResponse.statusText}`,
            }
          }
          return {
            success: true,
            fileId,
            previewUrl: uploadResponse.headers.get('x-ros-preview-url'),
          }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },
      [base64, mimeType]
    )

    if (!uploaded.success || !uploaded.fileId) {
      throw new Error(uploaded.error || '图片上传失败')
    }
    return {
      fileId: uploaded.fileId,
      url: uploaded.previewUrl || `https://ros-preview.xhscdn.com/${uploaded.fileId}`,
      width,
      height,
    }
  }

  async uploadImage(file: Blob): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error || new Error('读取图片失败'))
      reader.readAsDataURL(file)
    })
    return (await this.uploadImageByUrl(dataUrl)).url
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    await this.setupHeaderRules()
    try {
      const markdown = article.markdown || ''
      const length = getPlainTextLength(markdown)
      if (length > MAX_CONTENT_LENGTH) {
        throw new Error(`文章字数超出小红书限制：当前 ${length} 字，最多 ${MAX_CONTENT_LENGTH} 字`)
      }
      if (!this.runtime.tabs) throw new Error('小红书发布需要浏览器 tabs API 支持')

      const tabId = await this.ensureCreatorTab()
      const richJson = await markdownToXiaohongshuProseMirror(
        markdown,
        async url => {
          const uploaded = await this.uploadImageByUrl(url)
          return {
            url: uploaded.url,
            width: uploaded.width,
            height: uploaded.height,
            fileId: uploaded.fileId,
          }
        },
        options?.onImageProgress
      )

      if (!this.userId && !(await this.checkAuth()).isAuthenticated) {
        throw new Error('请先登录小红书创作者平台')
      }
      const draftId = generateUuid()
      const result = await this.runtime.tabs.executeScript(
        tabId,
        async (
          id: string,
          title: string,
          documentJson: XiaohongshuProseMirrorNode,
          uid: string | number
        ): Promise<DraftWriteResult> => {
          const timeout = new Promise<DraftWriteResult>(resolve => {
            setTimeout(() => resolve({ success: false, error: 'IndexedDB timeout (10s)' }), 10_000)
          })
          const save = new Promise<DraftWriteResult>(resolve => {
            try {
              const request = indexedDB.open('draft-database-v1')
              request.onerror = () => resolve({
                success: false,
                error: `IndexedDB open error: ${request.error?.message || 'unknown'}`,
              })
              request.onsuccess = () => {
                try {
                  const database = request.result
                  if (!database.objectStoreNames.contains('article-draft')) {
                    const stores = Array.from(database.objectStoreNames)
                    const currentUrl = window.location.href
                    database.close()
                    resolve({
                      success: false,
                      error:
                        `article-draft store not found. URL: ${currentUrl}, stores: ${stores.join(', ')}`,
                    })
                    return
                  }
                  writeDraft(database)
                } catch (error) {
                  resolve({ success: false, error: `db error: ${(error as Error).message}` })
                }
              }
            } catch (error) {
              resolve({ success: false, error: `open error: ${(error as Error).message}` })
            }

            const writeDraft = (database: IDBDatabase) => {
              try {
                const transaction = database.transaction(['article-draft'], 'readwrite')
                const store = transaction.objectStore('article-draft')
                const draft = {
                  content: {
                    contextStore: {
                      liveContext: { time: 0, title: '' },
                      previewAuditContext: {
                        status: 0,
                        detail: {
                          hasLimit: true,
                          remainingCalls: 0,
                          taskId: '',
                          taskType: '1',
                          status: 0,
                          taskResultInfo: { detectionStatus: 1, optimizationPoints: [] },
                        },
                        isChange: false,
                      },
                      coverContext: {
                        coverUrl: '',
                        cover: {
                          width: 0,
                          height: 0,
                          fileid: '',
                          frame: { ts: 0, isUserSelect: false, isUpload: false },
                          stickers: { version: 2, neptune: [] },
                          fonts: [],
                          coverTemplateId: '',
                          extra_info_json: '',
                        },
                        templateBlob: null,
                        rate: 0,
                        recommendCoverIdx: -1,
                      },
                      goodsContext: { goodsInfo: {}, goodsPreviewDetail: [] },
                      bizRelationContext: { bizRelation: [] },
                      recommendCovers: [],
                    },
                    draftStore: {
                      descInnerHTML: '',
                      descLength: 0,
                      video: {
                        width: 0,
                        height: 0,
                        fileid: '',
                        fsize: 0,
                        duration: 0,
                        videoId: '',
                        videoMarks: [],
                        timelines: [],
                        frame: { ts: 0, userSelect: true },
                        transcodeVideoFileId: '',
                        coverInfo: {},
                      },
                      videoInfo: null,
                      audioInfo: null,
                      videoMeta: '',
                      audioMeta: '',
                      cover: {
                        width: 0,
                        height: 0,
                        fileid: '',
                        frame: { ts: 0, isUserSelect: false, isUpload: false },
                        stickers: { neptune: [], version: 2 },
                        fonts: [],
                      },
                      chapters: [],
                      markers: [],
                      needTranscode: false,
                      imgList: [],
                      colorGroup: null,
                      title,
                      desc: '',
                      ats: [],
                      hashTag: [],
                    },
                    settingStore: {
                      privacyInfo: { opType: 1, type: 0, userIds: [] },
                      collectionId: '',
                      orderId: '',
                      brandAccountId: '',
                      noteSketch: { id: '', name: '' },
                      original: false,
                      originalDateStamp: '',
                      coProduceBind: { enable: true },
                      noteCopyBind: { copyable: true },
                      coOrderId: '',
                      interactionPermissionBind: { commentPermission: 0 },
                      fileRelate: {
                        fileId: '',
                        docId: '',
                        docName: '',
                        docShowName: '',
                        docType: '',
                        docSize: 0,
                      },
                    },
                    articleStore: {
                      articleContent: '',
                      summeryContent: '',
                      orderPattern: '',
                      richJson: documentJson,
                      articleTitle: title,
                      articleEditorMode: 0,
                      authorAndSummaryTemp: {
                        author: '',
                        summary: '',
                        readingStats: '',
                      },
                      selectedThemeId: 6,
                      selectedColorIndexMap: {},
                      blob2Map: {},
                      coverSetting: {
                        styleType: 0,
                        showAuthor: true,
                        showReadingStats: true,
                        showSummery: true,
                      },
                      editPageSource: 'import',
                      schemaCopy: {},
                      url2FileIdMap: {},
                    },
                    shortDraftStore: {
                      isShort: true,
                      editStatus: 0,
                      textCardList: [{
                        createTime: Date.now(),
                        text: '',
                        originText: '',
                        length: 0,
                        image: '',
                        imageFileId: '',
                        isManualInsert: false,
                      }],
                      coverList: [],
                      currentCoverIdx: 0,
                      cacheData: {},
                    },
                    publishStore: {
                      publishType: 1,
                      imageNoteOrigin: 0,
                      systemId: 'web',
                      step: 0,
                      uploadState: 2,
                      status: 0,
                      codec: 'unknown',
                    },
                  },
                  draftId: id,
                  uid,
                  timeStamp: Date.now(),
                }
                const putRequest = store.put(draft)
                putRequest.onsuccess = () => {
                  database.close()
                  resolve({ success: true, error: `saved with uid: ${uid}` })
                }
                putRequest.onerror = () => {
                  database.close()
                  resolve({ success: false, error: `put error: ${putRequest.error?.message}` })
                }
                transaction.onerror = () => {
                  database.close()
                  resolve({
                    success: false,
                    error: `transaction error: ${transaction.error?.message}`,
                  })
                }
              } catch (error) {
                database.close()
                resolve({ success: false, error: `db error: ${(error as Error).message}` })
              }
            }
          })
          return Promise.race([save, timeout])
        },
        [draftId, article.title, richJson, this.userId!]
      )

      if (!result.success) throw new Error(result.error || '保存草稿失败')

      return this.createResult(true, {
        postId: draftId,
        postUrl: EDITOR_URL,
        draftOnly: true,
        message: '请到「草稿箱 → 长文笔记」查看',
      })
    } catch (error) {
      return this.createResult(false, { error: (error as Error).message })
    } finally {
      await this.clearHeaderRules()
    }
  }
}
