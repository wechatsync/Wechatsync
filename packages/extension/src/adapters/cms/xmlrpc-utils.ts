import { createLogger } from '../../lib/logger'
import { parseMarkdownImages } from '@wechatsync/core'

export interface XmlRpcCredentials {
  url: string
  username: string
  password: string
}

export interface ImageUploadResult {
  url: string
}

export type ImageUploader = (
  credentials: XmlRpcCredentials,
  imageData: Uint8Array,
  filename: string,
  mimeType: string
) => Promise<{ success: boolean; url?: string; error?: string }>

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  const len = buffer.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}

export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
  'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
}

export function generateImageFilename(mimeType: string): string {
  const ext = MIME_TO_EXT[mimeType] || 'png'
  return `image_${Date.now()}.${ext}`
}

export const MAX_RETRY_ATTEMPTS = 10
export const RETRY_DELAY_MS = 1000

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function parseXmlRpcUploadUrl(xml: string): { success: boolean; url?: string; error?: string } {
  const urlMatch = xml.match(/<name>url<\/name>\s*<value>(?:<string>)?([^<]+)(?:<\/string>)?<\/value>/)
  if (urlMatch) {
    return { success: true, url: urlMatch[1] }
  }

  if (xml.includes('<fault>')) {
    const faultMatch = xml.match(/<string>([^<]+)<\/string>/)
    return { success: false, error: faultMatch?.[1] || 'Upload failed' }
  }

  return { success: false, error: '无法解析上传结果' }
}

export function uploadImageByUrl(
  logger: ReturnType<typeof createLogger>,
  uploadImage: ImageUploader,
  credentials: XmlRpcCredentials,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  return retryUpload(logger, async () => {
    return doUploadImageByUrl(logger, uploadImage, credentials, imageUrl, signal)
  }, imageUrl, signal)
}

async function retryUpload(
  logger: ReturnType<typeof createLogger>,
  fn: () => Promise<ImageUploadResult | null>,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      logger.debug(` Upload aborted for: ${imageUrl}`)
      return null
    }

    try {
      const result = await fn()
      if (result) {
        if (attempt > 1) {
          logger.debug(` Upload succeeded on attempt ${attempt}: ${imageUrl}`)
        }
        return result
      }
      logger.warn(` Upload attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed for: ${imageUrl}`)
    } catch (error) {
      lastError = error as Error
      logger.warn(` Upload attempt ${attempt}/${MAX_RETRY_ATTEMPTS} error:`, error)
    }

    if (attempt < MAX_RETRY_ATTEMPTS) {
      const delayMs = RETRY_DELAY_MS * attempt
      logger.debug(` Retrying in ${delayMs}ms...`)
      await delay(delayMs)
    }
  }

  logger.error(` All ${MAX_RETRY_ATTEMPTS} upload attempts failed for: ${imageUrl}`, lastError)
  return null
}

async function doUploadImageByUrl(
  logger: ReturnType<typeof createLogger>,
  uploadImage: ImageUploader,
  credentials: XmlRpcCredentials,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(imageUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      logger.error(` Failed to download image (HTTP ${response.status}): ${imageUrl}`)
      return null
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const imageData = new Uint8Array(arrayBuffer)

    const mimeType = blob.type || 'image/jpeg'

    const filename = generateImageFilename(mimeType)

    logger.debug(` Uploading image: ${filename}, type: ${mimeType}`)

    const result = await uploadImage(credentials, imageData, filename, mimeType)
    if (result.success && result.url) {
      return { url: result.url }
    }

    logger.error(` Failed to upload image: ${result.error}`)
    return null
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function processArticleImages(
  logger: ReturnType<typeof createLogger>,
  uploadImage: ImageUploader,
  credentials: XmlRpcCredentials,
  content: string,
  onProgress?: (current: number, total: number) => void,
  signal?: AbortSignal
): Promise<{ content: string; failedImages: number }> {
  const imgRegex = /<img[^>]+src=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/gi
  const matches: { full: string; src: string }[] = []

  let match
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push({ full: match[0], src: match[1] || match[2] || match[3] })
  }

  for (const mdMatch of parseMarkdownImages(content)) {
    matches.push({ full: mdMatch.full, src: mdMatch.src })
  }

  if (matches.length === 0) {
    return { content, failedImages: 0 }
  }

  logger.debug(` Found ${matches.length} images to process`)

  let result = content
  const uploadedMap = new Map<string, string>()
  let processed = 0
  let failedImages = 0

  for (const { full, src } of matches) {
    if (signal?.aborted) {
      throw new Error('操作已取消')
    }

    if (!src || src.startsWith('data:')) continue

    const siteDomain = new URL(credentials.url).hostname
    try {
      const imgDomain = new URL(src).hostname
      if (imgDomain === siteDomain) {
        logger.debug(` Skipping same-domain image: ${src}`)
        continue
      }
    } catch {
      // URL 解析失败，继续处理
    }

    processed++
    onProgress?.(processed, matches.length)

    let newUrl = uploadedMap.get(src)

    if (!newUrl) {
      logger.debug(` Uploading image ${processed}/${matches.length}: ${src}`)
      const uploadResult = await uploadImageByUrl(logger, uploadImage, credentials, src, signal)
      if (uploadResult?.url) {
        newUrl = uploadResult.url
        uploadedMap.set(src, newUrl)
      } else {
        failedImages++
        logger.warn(`图片上传失败，跳过: ${src.substring(0, 100)}...`)
        continue
      }
    }

    if (newUrl) {
      const newTag = full.replace(src, newUrl)
      result = result.replace(full, newTag)
      logger.debug(` Image uploaded: ${newUrl}`)
    }

    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return { content: result, failedImages }
}
