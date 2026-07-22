const BOUNDARY_URL_FIELDS = ['postUrl', 'url'] as const

type BoundaryUrlField = (typeof BOUNDARY_URL_FIELDS)[number]

/**
 * The smallest structural shape needed to sanitize a sync result. Extra fields
 * are preserved so callers do not lose postId, status, timestamps, or errors.
 */
export interface SyncResultBoundaryInput {
  platform?: unknown
  postId?: unknown
  postUrl?: unknown
  url?: unknown
}

export type SanitizedSyncResult<T extends SyncResultBoundaryInput> = Omit<
  T,
  BoundaryUrlField
> &
  Partial<Record<BoundaryUrlField, string>>

const SENSITIVE_QUERY_COMPONENTS = new Set([
  'auth',
  'authorization',
  'credential',
  'credentials',
  'password',
  'passwd',
  'secret',
  'session',
  'sig',
  'sign',
  'signature',
  'ticket',
  'token',
])

const SENSITIVE_COMPACT_QUERY_KEYS = new Set([
  'accesstoken',
  'apikey',
  'authtoken',
  'clientsecret',
  'idtoken',
  'refreshtoken',
  'sessionid',
  'sessionkey',
])

function splitQueryKey(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function isSensitiveQueryKey(key: string): boolean {
  const components = splitQueryKey(key)
  if (
    components.some((component) => SENSITIVE_QUERY_COMPONENTS.has(component))
  ) {
    return true
  }

  return SENSITIVE_COMPACT_QUERY_KEYS.has(components.join(''))
}

function isWeixinPlatform(platform: unknown): boolean {
  return (
    typeof platform === 'string' && platform.trim().toLowerCase() === 'weixin'
  )
}

/**
 * Sanitize a URL before it crosses the extension boundary or is persisted.
 *
 * WeChat draft URLs are never safe at this boundary because they currently
 * carry a live login token. Other platforms retain only absolute HTTP(S) URLs
 * without userinfo, sensitive query parameters, or fragments.
 */
export function sanitizeBoundaryUrl(
  platform: unknown,
  value: unknown,
): string | undefined {
  if (isWeixinPlatform(platform) || typeof value !== 'string') {
    return undefined
  }

  try {
    const parsed = new URL(value)
    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
      parsed.username !== '' ||
      parsed.password !== ''
    ) {
      return undefined
    }

    for (const key of [...parsed.searchParams.keys()]) {
      if (isSensitiveQueryKey(key)) {
        parsed.searchParams.delete(key)
      }
    }
    parsed.hash = ''

    return parsed.href
  } catch {
    return undefined
  }
}

/**
 * Return a non-mutating, boundary-safe copy of a sync result.
 *
 * postId and all non-URL fields are deliberately preserved. Unsafe URL fields
 * are removed rather than replaced with a misleading or unusable value.
 */
export function sanitizeSyncResultForBoundary<
  T extends SyncResultBoundaryInput,
>(result: T): SanitizedSyncResult<T> {
  const sanitized = { ...result } as Record<string, unknown>

  for (const field of BOUNDARY_URL_FIELDS) {
    const safeUrl = sanitizeBoundaryUrl(result.platform, result[field])
    if (safeUrl) {
      sanitized[field] = safeUrl
    } else {
      delete sanitized[field]
    }
  }

  return sanitized as SanitizedSyncResult<T>
}
