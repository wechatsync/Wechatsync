/**
 * WordPress XML-RPC 适配器
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

const logger = createLogger('WordPress')

interface WordPressCredentials extends XmlRpcCredentials {}

interface WordPressPost {
  post_title: string
  post_content: string
  post_status: 'draft' | 'publish'
  post_type?: string
}

/**
 * 构建 XML-RPC 请求体
 */
function buildXmlRpcRequest(method: string, params: unknown[]): string {
  const paramXml = params.map(param => {
    if (typeof param === 'string') {
      return `<param><value><string>${escapeXml(param)}</string></value></param>`
    }
    if (typeof param === 'number') {
      return `<param><value><int>${param}</int></value></param>`
    }
    if (typeof param === 'object' && param !== null) {
      return `<param><value><struct>${objectToXmlRpcStruct(param as Record<string, unknown>)}</struct></value></param>`
    }
    return `<param><value><string>${String(param)}</string></value></param>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>${paramXml}</params>
</methodCall>`
}

function objectToXmlRpcStruct(obj: Record<string, unknown>): string {
  return Object.entries(obj).map(([key, value]) => {
    let valueXml: string
    if (typeof value === 'string') {
      valueXml = `<string>${escapeXml(value)}</string>`
    } else if (typeof value === 'number') {
      valueXml = `<int>${value}</int>`
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

  const valueMatch = xml.match(/<value>[\s\S]*?<(string|int|boolean)>([^<]*)<\/\1>/)
  if (valueMatch) {
    return { success: true, value: valueMatch[2] }
  }

  if (xml.includes('<struct>')) {
    return { success: true, value: {} }
  }

  return { success: true }
}

/**
 * 测试 WordPress 连接
 */
export async function testConnection(credentials: WordPressCredentials): Promise<{ success: boolean; error?: string }> {
  const xmlrpcUrl = credentials.url.replace(/\/$/, '') + '/xmlrpc.php'

  try {
    const body = buildXmlRpcRequest('wp.getUsersBlogs', [
      credentials.username,
      credentials.password,
    ])

    const response = await fetch(xmlrpcUrl, {
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
 * 上传图片到 WordPress
 */
export async function uploadImage(
  credentials: WordPressCredentials,
  imageData: Uint8Array,
  filename: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const xmlrpcUrl = credentials.url.replace(/\/$/, '') + '/xmlrpc.php'

  try {
    const fileData = {
      name: filename,
      type: mimeType,
      bits: imageData,
      overwrite: true,
    }

    const body = buildXmlRpcRequest('wp.uploadFile', [
      0, // blog_id
      credentials.username,
      credentials.password,
      fileData,
    ])

    const response = await fetch(xmlrpcUrl, {
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
 * 从 URL 下载图片并上传到 WordPress（带重试机制）
 */
export async function uploadImageByUrl(
  credentials: WordPressCredentials,
  imageUrl: string,
  signal?: AbortSignal
): Promise<ImageUploadResult | null> {
  return sharedUploadImageByUrl(logger, uploadImage, credentials, imageUrl, signal)
}

/**
 * 处理文章中的图片，上传到 WordPress 并替换 URL
 */
export async function processArticleImages(
  credentials: WordPressCredentials,
  content: string,
  onProgress?: (current: number, total: number) => void,
  signal?: AbortSignal
): Promise<{ content: string; failedImages: number }> {
  return sharedProcessArticleImages(logger, uploadImage, credentials, content, onProgress, signal)
}

/**
 * 发布文章到 WordPress
 */
export async function publish(
  credentials: WordPressCredentials,
  article: { title: string; content: string },
  options?: { draftOnly?: boolean; processImages?: boolean; onImageProgress?: (current: number, total: number) => void; signal?: AbortSignal }
): Promise<{ success: boolean; postId?: string; postUrl?: string; message?: string; error?: string }> {
  const xmlrpcUrl = credentials.url.replace(/\/$/, '') + '/xmlrpc.php'

  try {
    if (options?.signal?.aborted) {
      return { success: false, error: '操作已取消' }
    }

    let content = article.content
    let failedImages = 0
    if (options?.processImages !== false) {
      logger.debug(' Processing images before publish...')
      const imageResult = await processArticleImages(credentials, content, options?.onImageProgress, options?.signal)
      content = imageResult.content
      failedImages = imageResult.failedImages
    }

    if (options?.signal?.aborted) {
      return { success: false, error: '操作已取消' }
    }

    const post: WordPressPost = {
      post_title: article.title,
      post_content: content,
      post_status: options?.draftOnly ? 'draft' : 'publish',
      post_type: 'post',
    }

    const body = buildXmlRpcRequest('wp.newPost', [
      0, // blog_id
      credentials.username,
      credentials.password,
      post,
    ])

    const response = await fetch(xmlrpcUrl, {
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
    const postUrl = options?.draftOnly
      ? `${credentials.url.replace(/\/$/, '')}/wp-admin/post.php?post=${postId}&action=edit`
      : `${credentials.url.replace(/\/$/, '')}/?p=${postId}`

    const message = failedImages > 0 ? `${failedImages} 张图片上传失败` : undefined
    return { success: true, postId, postUrl, message }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
