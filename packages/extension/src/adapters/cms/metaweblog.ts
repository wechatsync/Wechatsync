/**
 * MetaWeblog API 适配器
 * 支持 Typecho 等兼容 MetaWeblog 的博客系统
 */
import { createLogger } from '../../lib/logger'
import { parseMarkdownImages } from '@wechatsync/core'

const logger = createLogger('MetaWeblog')

interface MetaWeblogCredentials {
  url: string
  username: string
  password: string
  // Typecho 等系统的 XML-RPC 端点可能不同
  endpoint?: string
}

interface ImageUploadResult {
  url: string
}

/**
 * 构建 XML-RPC 请求体
 * 注意：必须是紧凑格式，不能有多余空白，否则某些 XML-RPC 实现会解析失败
 */
function buildXmlRpcRequest(method: string, params: unknown[]): string {
  const paramXml = params.map(param => {
    if (typeof param === 'string') {
      return `<param><value><string>${escapeXml(param)}</string></value></param>`
    }
    if (typeof param === 'number') {
      // 使用 i4 而不是 int，兼容性更好
      return `<param><value><i4>${param}</i4></value></param>`
    }
    if (typeof param === 'boolean') {
      return `<param><value><boolean>${param ? 1 : 0}</boolean></value></param>`
    }
    if (typeof param === 'object' && param !== null) {
      return `<param><value><struct>${objectToXmlRpcStruct(param as Record<string, unknown>)}</struct></value></param>`
    }
    return `<param><value><string>${String(param)}</string></value></param>`
  }).join('')

  // 紧凑格式，与 jQuery xmlrpc 插件一致
  return `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params>${paramXml}</params></methodCall>`
}

function objectToXmlRpcStruct(obj: Record<string, unknown>): string {
  return Object.entries(obj).map(([key, value]) => {
    let valueXml: string
    if (typeof value === 'string') {
      valueXml = `<string>${escapeXml(value)}</string>`
    } else if (typeof value === 'number') {
      // 使用 i4 而不是 int，兼容性更好
      valueXml = `<i4>${value}</i4>`
    } else if (typeof value === 'boolean') {
      valueXml = `<boolean>${value ? 1 : 0}</boolean>`
    } else if (value instanceof Uint8Array) {
      // Base64 编码的二进制数据
      valueXml = `<base64>${arrayBufferToBase64(value)}</base64>`
    } else {
      valueXml = `<string>${escapeXml(String(value))}</string>`
    }
    return `<member><name>${key}</name><value>${valueXml}</value></member>`
  }).join('')
}

/**
 * 将 Uint8Array 转换为 base64 字符串
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  const len = buffer.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 解析 XML-RPC 响应
 */
function parseXmlRpcResponse(xml: string): { success: boolean; value?: unknown; error?: string } {
  // 检查是否有 fault
  if (xml.includes('<fault>')) {
    const faultMatch = xml.match(/<string>([^<]+)<\/string>/)
    return { success: false, error: faultMatch?.[1] || 'XML-RPC 错误' }
  }

  // 提取返回值 - 字符串或数字
  const stringMatch = xml.match(/<string>([^<]*)<\/string>/)
  if (stringMatch) {
    return { success: true, value: stringMatch[1] }
  }

  const intMatch = xml.match(/<int>([^<]*)<\/int>/)
  if (intMatch) {
    return { success: true, value: intMatch[1] }
  }

  // i4 类型（与 int 等价）
  const i4Match = xml.match(/<i4>([^<]*)<\/i4>/)
  if (i4Match) {
    return { success: true, value: i4Match[1] }
  }

  // 检查数组返回 (getUsersBlogs)
  if (xml.includes('<array>') || xml.includes('<struct>')) {
    return { success: true, value: {} }
  }

  return { success: true }
}

/**
 * 从 XML 响应中提取最新文章的 postid
 */
function extractLatestPostId(xml: string): string | null {
  // 匹配第一个 postid 字段
  const postIdMatch = xml.match(/<name>postid<\/name>\s*<value>(?:<string>)?([^<]+)(?:<\/string>)?<\/value>/)
  return postIdMatch ? postIdMatch[1] : null
}

/**
 * 获取最新文章 ID（用于 Typecho 返回 0 的情况）
 */
async function getLatestPostId(
  credentials: MetaWeblogCredentials,
  endpoint: string
): Promise<string | null> {
  try {
    const body = buildXmlRpcRequest('metaWeblog.getRecentPosts', [
      0, // blogId
      credentials.username,
      credentials.password,
      1, // 只获取最新 1 篇
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return null
    }

    const xml = await response.text()
    return extractLatestPostId(xml)
  } catch {
    return null
  }
}

/**
 * 获取 XML-RPC 端点
 */
function getEndpoint(credentials: MetaWeblogCredentials): string {
  if (credentials.endpoint) {
    return credentials.endpoint
  }
  // 默认端点
  return credentials.url.replace(/\/$/, '') + '/xmlrpc.php'
}

/**
 * 测试 MetaWeblog 连接
 */
export async function testConnection(credentials: MetaWeblogCredentials): Promise<{ success: boolean; error?: string }> {
  const endpoint = getEndpoint(credentials)

  try {
    // 使用 blogger.getUsersBlogs 测试连接
    const body = buildXmlRpcRequest('blogger.getUsersBlogs', [
      '', // appKey (not used)
      credentials.username,
      credentials.password,
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()
    const result = parseXmlRpcResponse(xml)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 上传图片到 MetaWeblog 兼容博客
 */
export async function uploadImage(
  credentials: MetaWeblogCredentials,
  imageData: Uint8Array,
  filename: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const endpoint = getEndpoint(credentials)

  try {
    const mediaObject: Record<string, unknown> = {
      name: filename,
      type: mimeType,
      // 同时发送 bits 和 bytes，提高兼容性
      // - 标准 MetaWeblog 使用 bits
      // - Typecho 使用 bytes
      bits: imageData,
      bytes: imageData,
    }

    // 统一使用 metaWeblog.newMediaObject（标准 MetaWeblog API）
    // WordPress 也支持此 API，兼容性更好
    const methodName = 'metaWeblog.newMediaObject'

    const body = buildXmlRpcRequest(methodName, [
      0, // blogId
      credentials.username,
      credentials.password,
      mediaObject,
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()

    // 解析上传结果，提取 URL
    const urlMatch = xml.match(/<name>url<\/name>\s*<value>(?:<string>)?([^<]+)(?:<\/string>)?<\/value>/)
    if (urlMatch) {
      return { success: true, url: urlMatch[1] }
    }

    // 检查错误
    if (xml.includes('<fault>')) {
      const faultMatch = xml.match(/<string>([^<]+)<\/string>/)
      return { success: false, error: faultMatch?.[1] || 'Upload failed' }
    }

    return { success: false, error: '无法解析上传结果' }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
  'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
}

/**
 * 根据响应 MIME 类型生成文件名，默认 png
 */
function generateImageFilename(mimeType: string): string {
  const ext = MIME_TO_EXT[mimeType] || 'png'
  return `image_${Date.now()}.${ext}`
}

const MAX_RETRY_ATTEMPTS = 10
const RETRY_DELAY_MS = 1000 // 基础延迟 1 秒

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 从 URL 下载图片并上传（带重试机制）
 */
export async function uploadImageByUrl(
  credentials: MetaWeblogCredentials,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    // 检查是否已取消
    if (signal?.aborted) {
      logger.debug(` Upload aborted for: ${imageUrl}`)
      return null
    }

    try {
      const result = await doUploadImageByUrl(credentials, imageUrl, signal)
      if (result) {
        if (attempt > 1) {
          logger.debug(` Upload succeeded on attempt ${attempt}: ${imageUrl}`)
        }
        return result
      }
      // result 为 null 表示失败，继续重试
      logger.warn(` Upload attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed for: ${imageUrl}`)
    } catch (error) {
      lastError = error as Error
      logger.warn(` Upload attempt ${attempt}/${MAX_RETRY_ATTEMPTS} error:`, error)
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < MAX_RETRY_ATTEMPTS) {
      const delayMs = RETRY_DELAY_MS * attempt // 递增延迟
      logger.debug(` Retrying in ${delayMs}ms...`)
      await delay(delayMs)
    }
  }

  logger.error(` All ${MAX_RETRY_ATTEMPTS} upload attempts failed for: ${imageUrl}`, lastError)
  return null
}

/**
 * 实际执行图片下载和上传
 */
async function doUploadImageByUrl(
  credentials: MetaWeblogCredentials,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  // 下载图片 (带超时)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

  // 如果有外部 signal，监听它
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

    // 获取 MIME 类型
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
    throw error // 向上抛出以触发重试
  }
}

/**
 * 处理文章中的图片
 */
export async function processArticleImages(
  credentials: MetaWeblogCredentials,
  content: string,
  onProgress?: (current: number, total: number) => void,
  signal?: AbortSignal
): Promise<{ content: string; failedImages: number }> {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
  const matches: { full: string; src: string }[] = []

  let match
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push({ full: match[0], src: match[1] })
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
    // 检查是否已取消
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

    // 检查是否已上传过
    let newUrl = uploadedMap.get(src)

    if (!newUrl) {
      logger.debug(` Uploading image ${processed}/${matches.length}: ${src}`)
      const uploadResult = await uploadImageByUrl(credentials, src, signal)
      if (uploadResult?.url) {
        newUrl = uploadResult.url
        uploadedMap.set(src, newUrl)
      } else {
        // 上传失败，跳过该图片，保留原始 URL，继续处理其他图片
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

/**
 * 发布文章
 */
export async function publish(
  credentials: MetaWeblogCredentials,
  article: { title: string; content?: string; html?: string; markdown?: string },
  options?: { draftOnly?: boolean; processImages?: boolean; onImageProgress?: (current: number, total: number) => void }
): Promise<{ success: boolean; postId?: string; postUrl?: string; message?: string; error?: string }> {
  const endpoint = getEndpoint(credentials)

  try {
    // 如果启用图片处理，先处理文章中的图片
    let content = article.content || article.html || article.markdown || ''
    let failedImages = 0
    if (options?.processImages !== false) {
      logger.debug(' Processing images before publish...')
      const imageResult = await processArticleImages(credentials, content, options?.onImageProgress)
      content = imageResult.content
      failedImages = imageResult.failedImages
    }

    const post = {
      title: article.title,
      description: content,
      categories: [],
    }

    const body = buildXmlRpcRequest('metaWeblog.newPost', [
      '0', // blogId
      credentials.username,
      credentials.password,
      post,
      !options?.draftOnly, // publish flag
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()
    const result = parseXmlRpcResponse(xml)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    const postId = String(result.value)
    const baseUrl = credentials.url.replace(/\/$/, '')
    const postUrl = options?.draftOnly
      ? `${baseUrl}/admin/manage-posts.php?cid=${postId}`
      : `${baseUrl}/archives/${postId}/`

    const message = failedImages > 0 ? `${failedImages} 张图片上传失败` : undefined
    return { success: true, postId, postUrl, message }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Typecho 专用上传图片
 */
export async function uploadTypechoImage(
  credentials: MetaWeblogCredentials,
  imageData: Uint8Array,
  filename: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const endpoint = credentials.url.replace(/\/$/, '') + '/action/xmlrpc'

  try {
    // 同时发送 bits 和 bytes，提高兼容性
    const mediaObject = {
      name: filename,
      type: mimeType,
      bits: imageData,
      bytes: imageData,
    }

    const body = buildXmlRpcRequest('metaWeblog.newMediaObject', [
      0, // blogId
      credentials.username,
      credentials.password,
      mediaObject,
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()

    // 解析上传结果，提取 URL
    const urlMatch = xml.match(/<name>url<\/name>\s*<value>(?:<string>)?([^<]+)(?:<\/string>)?<\/value>/)
    if (urlMatch) {
      return { success: true, url: urlMatch[1] }
    }

    // 检查错误
    if (xml.includes('<fault>')) {
      const faultMatch = xml.match(/<string>([^<]+)<\/string>/)
      return { success: false, error: faultMatch?.[1] || 'Upload failed' }
    }

    return { success: false, error: '无法解析上传结果' }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Typecho 专用测试连接
 */
export async function testTypechoConnection(credentials: MetaWeblogCredentials): Promise<{ success: boolean; error?: string }> {
  // Typecho 默认使用 /action/xmlrpc 端点
  const endpoint = credentials.url.replace(/\/$/, '') + '/action/xmlrpc'

  try {
    // 使用 metaWeblog.getUsersBlogs 测试连接（MetaWeblog 标准 API）
    const body = buildXmlRpcRequest('metaWeblog.getUsersBlogs', [
      '', // appKey (MetaWeblog 标准参数，通常为空)
      credentials.username,
      credentials.password,
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()
    const result = parseXmlRpcResponse(xml)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Typecho 专用发布
 */
export async function publishToTypecho(
  credentials: MetaWeblogCredentials,
  article: { title: string; content?: string; html?: string; markdown?: string },
  options?: { draftOnly?: boolean; processImages?: boolean; onImageProgress?: (current: number, total: number) => void; signal?: AbortSignal }
): Promise<{ success: boolean; postId?: string; postUrl?: string; message?: string; error?: string }> {
  const endpoint = credentials.url.replace(/\/$/, '') + '/action/xmlrpc'

  // Typecho 使用 /action/xmlrpc 端点，设置到 credentials 供图片上传使用
  const typechoCredentials = { ...credentials, endpoint }

  try {
    // 如果启用图片处理，先处理文章中的图片
    let content = article.content || article.html || article.markdown || ''
    let failedImages = 0
    if (options?.processImages !== false) {
      logger.debug(' Processing images before publish...')
      const imageResult = await processArticleImages(typechoCredentials, content, options?.onImageProgress, options?.signal)
      content = imageResult.content
      failedImages = imageResult.failedImages
    }

    // Typecho 使用 metaWeblog.newPost，参数格式和旧版保持一致
    const post = {
      title: article.title,
      description: content.trim(),
    }

    // 参数顺序：[blogId, username, password, post, publish]
    const body = buildXmlRpcRequest('metaWeblog.newPost', [
      0, // blogId (数字 0，和旧版一致)
      credentials.username,
      credentials.password,
      post,
      false, // publish flag，旧版固定为 false
    ])

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const xml = await response.text()
    const result = parseXmlRpcResponse(xml)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    let postId = String(result.value)
    const baseUrl = credentials.url.replace(/\/$/, '')

    // Typecho 的 metaWeblog.newPost 可能返回 0，尝试查询最新文章获取真实 ID
    if (!postId || postId === '0') {
      logger.debug('Typecho returned postId=0, fetching latest post...')
      const latestId = await getLatestPostId(credentials, endpoint)
      if (latestId) {
        postId = latestId
        logger.debug(`Got latest postId: ${postId}`)
      }
    }

    let postUrl: string
    if (postId && postId !== '0') {
      // Typecho 编辑页面 URL 格式
      postUrl = `${baseUrl}/admin/write-post.php?cid=${postId}`
    } else {
      // 回退到草稿管理页面
      postUrl = `${baseUrl}/admin/manage-posts.php`
    }

    const message = failedImages > 0 ? `${failedImages} 张图片上传失败` : undefined
    return { success: true, postId, postUrl, message }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
