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

function plainTextLength(content: string): number {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[`*_~>#-]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .length
}

function collectImageUrls(markdown: string): string[] {
  const urls: string[] = []
  const pattern = /!\[[^\]]*]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(markdown)) !== null) {
    if (!urls.includes(match[1])) urls.push(match[1])
  }
  return urls
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

export class XiaohongshuLongformAdapter extends BaseAdapter {
  readonly meta: PlatformMeta = {
    id: 'xiaohongshu-longform',
    name: '小红书长文',
    icon: 'https://www.xiaohongshu.com/favicon.ico',
    homepage: EDITOR_URL,
    capabilities: ['article', 'draft', 'image_upload'],
  }

  readonly preprocessConfig = {
    outputFormat: 'markdown' as const,
    removeLinks: false,
    removeIframes: true,
    removeComments: true,
    removeSpecialTags: true,
    processLazyImages: true,
  }

  // IndexedDB 中的 uid 必须与小红书接口返回值保持同一类型。
  // 数字 uid 被转换成字符串后虽然可以写入，但草稿箱不会将其识别为当前账号草稿。
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
    if (!this.runtime.tabs) throw new Error('小红书长文需要浏览器 tabs API 支持')
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
        data?: { userId?: string | number; userName?: string; userAvatar?: string }
      }
      if (!result.success || result.data?.userId === undefined || result.data.userId === null) {
        return { isAuthenticated: false, error: '未登录小红书创作服务平台' }
      }
      this.userId = result.data.userId
      return {
        isAuthenticated: true,
        userId: String(this.userId),
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
    const response = await this.runtime.fetch(url)
    if (!response.ok) throw new Error(`图片下载失败: HTTP ${response.status}`)
    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) throw new Error('下载的资源不是有效图片')

    let width = 0
    let height = 0
    try {
      const bitmap = await createImageBitmap(blob)
      width = bitmap.width
      height = bitmap.height
      bitmap.close()
    } catch {
      // 尺寸读取失败不阻止上传，小红书编辑器会自行计算
    }

    const base64 = bytesToBase64(new Uint8Array(await blob.arrayBuffer()))
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
          if (!fileId) return { success: false, error: '上传凭证缺少 fileId' }

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
              error: `图片上传失败: ${uploadResponse.status} ${uploadResponse.statusText}`,
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
      [base64, blob.type || 'image/jpeg']
    )

    if (!uploaded.success || !uploaded.fileId) {
      throw new Error(uploaded.error || '小红书图片上传失败')
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
      const markdown = article.markdown?.trim()
      if (!article.title.trim()) throw new Error('文章标题不能为空')
      if (!markdown) throw new Error('小红书长文同步需要 Markdown 正文')

      const length = plainTextLength(markdown)
      if (length > MAX_CONTENT_LENGTH) {
        throw new Error(`文章字数超过小红书限制：当前 ${length} 字，最多 ${MAX_CONTENT_LENGTH} 字`)
      }
      if (!this.runtime.tabs) throw new Error('小红书长文需要浏览器 tabs API 支持')

      const tabId = await this.ensureCreatorTab()
      const imageUrls = collectImageUrls(markdown)
      const images = new Map<string, UploadedImage>()
      for (let index = 0; index < imageUrls.length; index++) {
        const url = imageUrls[index]
        images.set(url, await this.uploadImageByUrl(url))
        options?.onImageProgress?.(index + 1, imageUrls.length)
      }
      const richJson = markdownToXiaohongshuProseMirror(markdown, images)

      if (!this.userId && !(await this.checkAuth()).isAuthenticated) {
        throw new Error('请先登录小红书创作服务平台')
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
            const openDatabase = (deadline: number) => {
              const request = indexedDB.open('draft-database-v1')
              request.onerror = () => resolve({
                success: false,
                error: `IndexedDB open error: ${request.error?.message || 'unknown'}`,
              })
              request.onsuccess = () => {
                const database = request.result
                if (database.objectStoreNames.contains('article-draft')) {
                  writeDraft(database)
                  return
                }
                const stores = Array.from(database.objectStoreNames)
                database.close()
                if (Date.now() < deadline) {
                  setTimeout(() => openDatabase(deadline), 250)
                  return
                }
                resolve({
                  success: false,
                  error: `article-draft store not found; stores: ${stores.join(', ')}`,
                })
              }
            }

            const writeDraft = (database: IDBDatabase) => {
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
                resolve({ success: true })
              }
              putRequest.onerror = () => {
                database.close()
                resolve({ success: false, error: `put error: ${putRequest.error?.message}` })
              }
              transaction.onerror = () => {
                database.close()
                resolve({ success: false, error: `transaction error: ${transaction.error?.message}` })
              }
            }

            openDatabase(Date.now() + 8_000)
          })
          return Promise.race([save, timeout])
        },
        [draftId, article.title.slice(0, 64), richJson, this.userId!]
      )

      if (!result.success) throw new Error(result.error || '保存小红书长文草稿失败')
      return this.createResult(true, {
        postId: draftId,
        postUrl: EDITOR_URL,
        draftOnly: true,
        message: '请到「草稿箱 → 长文笔记」检查排版后再发布',
      })
    } catch (error) {
      return this.createResult(false, { error: (error as Error).message })
    } finally {
      await this.clearHeaderRules()
    }
  }
}
