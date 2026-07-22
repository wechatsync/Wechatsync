export interface LegacyAccountSummary {
  type: string
  title: string
  displayName: string
  icon?: string
  avatar?: string
  uid?: string
  home?: string
  supportTypes: ['html']
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

/**
 * Preserve the legacy account shape without exposing stable account identity.
 * Stable userId and the authenticated profile avatar are reserved for the
 * exact-origin Bridge v2 account projection.
 */
export function projectLegacyAccounts(value: unknown): LegacyAccountSummary[] {
  if (!Array.isArray(value)) return []

  const accounts: LegacyAccountSummary[] = []
  for (const candidate of value) {
    if (
      typeof candidate !== 'object' ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      continue
    }

    const platform = candidate as Record<string, unknown>
    const type = asNonEmptyString(platform.id)
    if (platform.isAuthenticated !== true || !type) continue

    const name = asNonEmptyString(platform.name) ?? type
    const username = asNonEmptyString(platform.username)
    const icon = asNonEmptyString(platform.icon)
    const home = asNonEmptyString(platform.homepage)

    accounts.push({
      type,
      title: username ?? name,
      displayName: name,
      ...(icon ? { icon, avatar: icon } : {}),
      ...(username ? { uid: username } : {}),
      ...(home ? { home } : {}),
      supportTypes: ['html'],
    })
  }

  return accounts
}
