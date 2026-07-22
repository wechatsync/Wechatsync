import { sanitizeSyncResultForBoundary } from '@wechatsync/core/publication-inspection'

export interface LegacyEditResponse {
  draftLink?: string
  postId?: string
}

function boundedPostId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized.length > 0 &&
    normalized.length <= 500 &&
    !/[\u0000-\u001f\u007f]/.test(normalized)
    ? normalized
    : undefined
}

/**
 * Project a platform sync result onto the narrow legacy account status shape.
 * The projection is a second defense after the adapter boundary: token-bearing
 * WeChat URLs can never be posted into the page, while stable postId survives.
 */
export function toLegacyEditResponse(
  value: unknown,
): LegacyEditResponse | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  const result = value as Record<string, unknown>
  if (result.success !== true) return null

  const sanitized = sanitizeSyncResultForBoundary(result)
  const draftLink =
    typeof sanitized.postUrl === 'string'
      ? sanitized.postUrl
      : typeof sanitized.url === 'string'
        ? sanitized.url
        : undefined
  const postId = boundedPostId(sanitized.postId)

  return {
    ...(draftLink ? { draftLink } : {}),
    ...(postId ? { postId } : {}),
  }
}
