/**
 * MetaWeblog API 适配器
 * 支持 Typecho 等兼容 MetaWeblog 的博客系统
 */
import { createLogger } from '../../lib/logger'
import {
  escapeXml,
  arrayBufferToBase64,
  parseXmlRpcUploadUrl,
  uploadImageByUrl as sharedUploadImageByUrl,
  processArticleImages as sharedProcessArticleImages,
  type XmlRpcCredentials,
  type ImageUploadResult,
} from './xmlrpc-utils'

const logger = createLogger('MetaWeblog')

interface MetaWeblogCredentials extends XmlRpcCredentials {
  // Typecho 等系统的 XML-RPC 端点可能不同
  endpoint?: string
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
      valueXml = `<base64>${arrayBufferToBase64(value)}</base64>`
    } else {
      valueXml = `<string>${escapeXml(String(value))}</string>`
    }
    return `<member><name>${key}</name><value>${valueXml}</value></member>`
  }).join('')
}

/**
 * 解析 XML-RPC 响应
 */
function parseXmlRpcResponse(xml: string): { success: boolean; value?: unknown; error?: string } {
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
  return credentials.url.replace(/\/$/, '') + '/xmlrpc.php'
}

/**
 * 测试 MetaWeblog 连接
 */
export async function testConnection(credentials: MetaWeblogCredentials): Promise<{ success: boolean; error?: string }> {
  const endpoint = getEndpoint(credentials)

  try {
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
    return parseXmlRpcUploadUrl(xml)
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 从 URL 下载图片并上传（带重试机制）
 */
export async function uploadImageByUrl(
  credentials: MetaWeblogCredentials,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  return sharedUploadImageByUrl(logger, uploadImage, credentials, imageUrl, signal)
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
  return sharedProcessArticleImages(logger, uploadImage, credentials, content, onProgress, signal)
}

/**
 * 发布文章
 */
export async function publish(
  credentials: MetaWeblogCredentials,
  article: { title: string; content: string },
  options?: { draftOnly?: boolean; processImages?: boolean; onImageProgress?: (current: number, total: number) => void }
): Promise<{ success: boolean; postId?: string; postUrl?: string; message?: string; error?: string }> {
  const endpoint = getEndpoint(credentials)

  try {
    let content = article.content
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
    return parseXmlRpcUploadUrl(xml)
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Typecho 专用测试连接
 */
export async function testTypechoConnection(credentials: MetaWeblogCredentials): Promise<{ success: boolean; error?: string }> {
  const endpoint = credentials.url.replace(/\/$/, '') + '/action/xmlrpc'

  try {
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
  article: { title: string; content: string },
  options?: { draftOnly?: boolean; processImages?: boolean; onImageProgress?: (current: number, total: number) => void; signal?: AbortSignal }
): Promise<{ success: boolean; postId?: string; postUrl?: string; message?: string; error?: string }> {
  const endpoint = credentials.url.replace(/\/$/, '') + '/action/xmlrpc'

  const typechoCredentials = { ...credentials, endpoint }

  try {
    let content = article.content
    let failedImages = 0
    if (options?.processImages !== false) {
      logger.debug(' Processing images before publish...')
      const imageResult = await processArticleImages(typechoCredentials, content, options?.onImageProgress, options?.signal)
      content = imageResult.content
      failedImages = imageResult.failedImages
    }

    const post = {
      title: article.title,
      description: content.trim(),
    }

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
      postUrl = `${baseUrl}/admin/write-post.php?cid=${postId}`
    } else {
      postUrl = `${baseUrl}/admin/manage-posts.php`
    }

    const message = failedImages > 0 ? `${failedImages} 张图片上传失败` : undefined
    return { success: true, postId, postUrl, message }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
