import type { PublicationPlatform } from './types'

export type PublicationSurface = 'DRAFT' | 'PUBLISHED' | 'UNKNOWN'

export interface ParsedPublicationUrl {
  platform: PublicationPlatform
  surface: PublicationSurface
  postId?: string
  accountId?: string
  canonicalUrl?: string
}

const ZHIHU_ALLOWED_HOSTS = new Set(['www.zhihu.com', 'zhuanlan.zhihu.com'])

function safeUrl(href: string): URL | null {
  try {
    const url = new URL(href)
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.username !== '' ||
      url.password !== ''
    ) {
      return null
    }
    return url
  } catch {
    return null
  }
}

function cleanPath(pathname: string): string {
  if (pathname === '/') return '/'
  return pathname.replace(/\/+$/, '')
}

function parseZhihu(url: URL): ParsedPublicationUrl {
  const articleMatch = cleanPath(url.pathname).match(/^\/p\/(\d+)(\/edit)?$/)
  if (url.hostname === 'zhuanlan.zhihu.com' && articleMatch) {
    const postId = articleMatch[1]
    const isDraft = Boolean(articleMatch[2])
    return {
      platform: 'zhihu',
      surface: isDraft ? 'DRAFT' : 'PUBLISHED',
      postId,
      canonicalUrl: isDraft
        ? undefined
        : `https://zhuanlan.zhihu.com/p/${postId}`,
    }
  }

  return { platform: 'zhihu', surface: 'UNKNOWN' }
}

/**
 * Parse only URL shapes verified for an active publication inspector.
 * Paused platform vocabulary remains in the protocol, but its URLs are not
 * inferred until that platform has passed the same rollout gate as Zhihu.
 */
export function parsePublicationUrl(
  platform: PublicationPlatform,
  href: string,
): ParsedPublicationUrl | null {
  if (platform !== 'zhihu') return null

  const url = safeUrl(href)
  if (!url) return null

  url.hostname = url.hostname.toLowerCase()
  if (!ZHIHU_ALLOWED_HOSTS.has(url.hostname)) return null

  return parseZhihu(url)
}
