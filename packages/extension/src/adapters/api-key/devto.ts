/**
 * dev.to API Key 适配器
 * 使用 Forem API 创建 dev.to 草稿
 */
interface DevtoCredentials {
  apiKey: string
}

interface DevtoArticle {
  title: string
  content?: string
  markdown?: string
  cover?: string
  tags?: string[]
}

const API_BASE_URL = 'https://dev.to'
const API_ACCEPT = 'application/vnd.forem.api-v1+json'

/**
 * 解析 Forem API 错误响应
 */
async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json() as { error?: string; message?: string }
    return data.error || data.message || `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

/**
 * 校验 API Key 是否可用
 */
export async function testConnection(credentials: DevtoCredentials): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        Accept: API_ACCEPT,
        'api-key': credentials.apiKey,
      },
    })

    if (!response.ok) {
      return { success: false, error: await parseError(response) }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 创建文章草稿
 */
export async function publish(
  credentials: DevtoCredentials,
  article: DevtoArticle,
  options?: { draftOnly?: boolean }
): Promise<{ success: boolean; postId?: string; postUrl?: string; message?: string; error?: string }> {
  try {
    const body = {
      article: {
        title: article.title,
        body_markdown: article.markdown || article.content || '',
        // 默认保存为草稿，避免误发布
        published: !(options?.draftOnly ?? true),
        tags: article.tags || [],
        main_image: article.cover || undefined,
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      method: 'POST',
      headers: {
        Accept: API_ACCEPT,
        'Content-Type': 'application/json',
        'api-key': credentials.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return { success: false, error: await parseError(response) }
    }

    const data = await response.json() as { id?: number; url?: string }
    // Forem 返回的草稿公开链接不可访问，草稿场景跳转到编辑页
    const postUrl = options?.draftOnly && data.url ? `${data.url}/edit` : data.url

    return {
      success: true,
      postId: data.id ? String(data.id) : undefined,
      postUrl,
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
