import {
  parsePublicationUrl,
  PublicationInspectRequestSchema,
  PublicationObservationSchema,
  PublicationPlatformSchema,
  SyncerAccountV2Schema,
  ZHIHU_ARTICLE_SUCCESS_OUTCOMES,
  type PublicationInspectRequest,
  type PublicationObservation,
  type PublicationPlatform,
  type SyncerAccountV2,
} from '@wechatsync/core/publication-inspection'
import type { PlatformAdapter } from '@wechatsync/core'

import {
  DEFAULT_BRIDGE_ALLOWED_ORIGINS,
  normalizeBridgeRequestId,
  type GetAccountsV2Payload,
} from '../bridge/protocol'

const BRIDGE_ORIGIN = DEFAULT_BRIDGE_ALLOWED_ORIGINS[0]
const ACCOUNT_CAPABILITIES = {
  toutiao: ['account_identity'],
  zhihu: ['account_identity', 'publication_inspect', 'public_url'],
  sohu: ['account_identity'],
  weixin: ['account_identity'],
} as const satisfies Record<
  PublicationPlatform,
  readonly SyncerAccountV2['capabilities'][number][]
>
const INSPECTION_TIMEOUT_MS = 12_000
const ACTIVE_INSPECTION_PLATFORMS = new Set<PublicationPlatform>(['zhihu'])
const GET_ACCOUNTS_KEYS = new Set(['platforms', 'forceRefresh'])
const INSPECT_KEYS = new Set([
  'requestId',
  'platform',
  'externalAccountId',
  'draft',
  'articleHint',
  'limit',
])
const INSPECT_DRAFT_KEYS = new Set(['platformPostId', 'draftUrl', 'draftedAt'])
const INSPECT_ARTICLE_HINT_KEYS = new Set([
  'title',
  'publishedAfter',
  'publishedBefore',
])

export type BackgroundBridgeFailureCode =
  | 'SENDER_NOT_ALLOWED'
  | 'INVALID_PAYLOAD'

export type BackgroundBridgeValidationResult<T> =
  | { success: true; data: T }
  | { success: false; code: BackgroundBridgeFailureCode }

export interface VerifiedBridgeMessageSender {
  origin: typeof BRIDGE_ORIGIN
  tabId: number
  url: string
}

/**
 * Minimal shape returned by checkAllPlatformsAuth. Keeping this boundary typed
 * as unknown prevents legacy adapter fields from crossing Bridge v2 by accident.
 */
export interface AuthenticatedPlatformCandidate {
  id?: unknown
  name?: unknown
  homepage?: unknown
  isAuthenticated?: unknown
  username?: unknown
  userId?: unknown
  avatar?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
): boolean {
  return (
    Object.getOwnPropertySymbols(value).length === 0 &&
    Object.keys(value).every((key) => allowedKeys.has(key))
  )
}

function isExactBridgePageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    const parsed = new URL(value)
    return (
      parsed.origin === BRIDGE_ORIGIN &&
      parsed.protocol === 'http:' &&
      parsed.hostname === 'localhost' &&
      parsed.port === '' &&
      parsed.username === '' &&
      parsed.password === ''
    )
  } catch {
    return false
  }
}

/**
 * Accept Bridge v2 messages only from the top frame of the canonical local app.
 * Chrome's MessageSender is treated as the authority; page-provided message
 * fields are deliberately not consulted here.
 */
export function validateBridgeMessageSender(
  sender: chrome.runtime.MessageSender,
): BackgroundBridgeValidationResult<VerifiedBridgeMessageSender> {
  const tabId = sender.tab?.id
  if (
    !Number.isInteger(tabId) ||
    (tabId as number) < 0 ||
    sender.frameId !== 0 ||
    sender.origin !== BRIDGE_ORIGIN ||
    !isExactBridgePageUrl(sender.url) ||
    !isExactBridgePageUrl(sender.tab?.url)
  ) {
    return { success: false, code: 'SENDER_NOT_ALLOWED' }
  }

  return {
    success: true,
    data: {
      origin: BRIDGE_ORIGIN,
      tabId: tabId as number,
      url: sender.url,
    },
  }
}

function parsePlatformList(value: unknown): PublicationPlatform[] | null {
  if (!Array.isArray(value) || value.length > 4) return null

  const platforms: PublicationPlatform[] = []
  for (const candidate of value) {
    const parsed = PublicationPlatformSchema.safeParse(candidate)
    if (!parsed.success || platforms.includes(parsed.data)) return null
    platforms.push(parsed.data)
  }

  return platforms
}

/** Revalidates the page payload at the background trust boundary. */
export function validateGetAccountsV2Payload(
  payload: unknown,
): BackgroundBridgeValidationResult<GetAccountsV2Payload> {
  if (!isRecord(payload) || !hasOnlyKeys(payload, GET_ACCOUNTS_KEYS)) {
    return { success: false, code: 'INVALID_PAYLOAD' }
  }

  if (
    typeof payload.forceRefresh !== 'undefined' &&
    typeof payload.forceRefresh !== 'boolean'
  ) {
    return { success: false, code: 'INVALID_PAYLOAD' }
  }

  let platforms: PublicationPlatform[] | undefined
  if (typeof payload.platforms !== 'undefined') {
    const parsedPlatforms = parsePlatformList(payload.platforms)
    if (parsedPlatforms === null) {
      return { success: false, code: 'INVALID_PAYLOAD' }
    }
    platforms = parsedPlatforms
  }

  return {
    success: true,
    data: {
      ...(platforms ? { platforms } : {}),
      ...(typeof payload.forceRefresh === 'boolean'
        ? { forceRefresh: payload.forceRefresh }
        : {}),
    },
  }
}

function hasStrictInspectShape(
  value: unknown,
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, INSPECT_KEYS) &&
    isRecord(value.draft) &&
    hasOnlyKeys(value.draft, INSPECT_DRAFT_KEYS) &&
    isRecord(value.articleHint) &&
    hasOnlyKeys(value.articleHint, INSPECT_ARTICLE_HINT_KEYS)
  )
}

/** Revalidates inspectPublication after the content-script protocol parser. */
export function validateInspectPublicationPayload(
  payload: unknown,
  envelopeRequestId: string,
): BackgroundBridgeValidationResult<PublicationInspectRequest> {
  if (!hasStrictInspectShape(payload)) {
    return { success: false, code: 'INVALID_PAYLOAD' }
  }

  const parsed = PublicationInspectRequestSchema.safeParse(payload)
  const normalizedEnvelopeRequestId =
    normalizeBridgeRequestId(envelopeRequestId)
  if (
    !parsed.success ||
    normalizedEnvelopeRequestId === null ||
    parsed.data.requestId !== normalizedEnvelopeRequestId
  ) {
    return { success: false, code: 'INVALID_PAYLOAD' }
  }

  return { success: true, data: parsed.data }
}

function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  try {
    const parsed = new URL(value)
    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
      parsed.username !== '' ||
      parsed.password !== ''
    ) {
      return undefined
    }
    return parsed.href
  } catch {
    return undefined
  }
}

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

/**
 * Converts legacy auth results into the intentionally narrow Bridge v2 account
 * representation. At most one account is emitted per Phase 0 platform.
 */
export function buildSyncerAccountsV2(
  candidates: readonly AuthenticatedPlatformCandidate[],
  requestedPlatforms?: readonly PublicationPlatform[],
): SyncerAccountV2[] {
  const requested = requestedPlatforms
    ? new Set<PublicationPlatform>(requestedPlatforms)
    : null
  const emitted = new Set<PublicationPlatform>()
  const accounts: SyncerAccountV2[] = []

  for (const candidate of candidates) {
    const platform = PublicationPlatformSchema.safeParse(candidate.id)
    if (
      !platform.success ||
      candidate.isAuthenticated !== true ||
      (requested && !requested.has(platform.data)) ||
      emitted.has(platform.data)
    ) {
      continue
    }

    const externalAccountId = nonEmptyString(candidate.userId)
    if (!externalAccountId) continue

    const account = SyncerAccountV2Schema.safeParse({
      platform: platform.data,
      externalAccountId,
      displayName:
        nonEmptyString(candidate.username) ??
        nonEmptyString(candidate.name) ??
        externalAccountId,
      ...(safeHttpUrl(candidate.avatar)
        ? { avatarUrl: safeHttpUrl(candidate.avatar) }
        : {}),
      ...(safeHttpUrl(candidate.homepage)
        ? { homepage: safeHttpUrl(candidate.homepage) }
        : {}),
      capabilities: [...ACCOUNT_CAPABILITIES[platform.data]],
    })

    if (!account.success) continue
    accounts.push(account.data)
    emitted.add(platform.data)
  }

  return accounts
}

/**
 * Paused platforms remain callable at the protocol level but explicitly return
 * UNSUPPORTED. This avoids misclassifying absence as NOT_FOUND.
 */
export function createUnsupportedPublicationObservation(
  request: PublicationInspectRequest,
  observedAt = new Date().toISOString(),
): PublicationObservation {
  return PublicationObservationSchema.parse({
    observationKey: `bridge-v2:${request.requestId}:${request.platform}:unsupported`,
    platform: request.platform,
    externalAccountId: request.externalAccountId,
    outcome: 'UNSUPPORTED',
    source: 'PLATFORM_DETAIL',
    observedAt,
    errorCode: 'PUBLICATION_INSPECTION_NOT_IMPLEMENTED',
    errorMessage: `Publication inspection is not implemented for ${request.platform} in Phase 0.`,
  })
}

type PublicationInspectorAdapter = Pick<PlatformAdapter, 'inspectPublication'>

function resolveZhihuRequestPostId(
  request: PublicationInspectRequest,
): string | null {
  const explicitPostId = request.draft.platformPostId
  let draftUrlPostId: string | undefined

  if (request.draft.draftUrl) {
    const parsedDraftUrl = parsePublicationUrl('zhihu', request.draft.draftUrl)
    if (
      !parsedDraftUrl ||
      parsedDraftUrl.surface !== 'DRAFT' ||
      !parsedDraftUrl.postId
    ) {
      return null
    }
    draftUrlPostId = parsedDraftUrl.postId
  }

  if (explicitPostId && draftUrlPostId && explicitPostId !== draftUrlPostId) {
    return null
  }

  return explicitPostId ?? draftUrlPostId ?? null
}

function createInspectionFailure(
  request: PublicationInspectRequest,
  outcome: 'FETCH_ERROR' | 'PARSE_ERROR',
  errorCode: string,
  errorMessage: string,
  observedAt = new Date().toISOString(),
): PublicationObservation {
  return PublicationObservationSchema.parse({
    observationKey: `bridge-v2:${request.requestId}:${request.platform}:${errorCode.toLowerCase()}`,
    platform: request.platform,
    externalAccountId: request.externalAccountId,
    outcome,
    source: 'PLATFORM_DETAIL',
    observedAt,
    errorCode,
    errorMessage,
  })
}

function normalizeAdapterObservations(
  request: PublicationInspectRequest,
  value: unknown,
): PublicationObservation[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > request.limit
  ) {
    return null
  }

  const seenKeys = new Set<string>()
  const observations: PublicationObservation[] = []
  for (const candidate of value) {
    const parsed = PublicationObservationSchema.safeParse(candidate)
    if (
      !parsed.success ||
      parsed.data.platform !== request.platform ||
      parsed.data.externalAccountId !== request.externalAccountId ||
      seenKeys.has(parsed.data.observationKey)
    ) {
      return null
    }

    let normalized = parsed.data
    const expectedZhihuPostId =
      request.platform === 'zhihu' ? resolveZhihuRequestPostId(request) : null
    if (
      request.platform === 'zhihu' &&
      ZHIHU_ARTICLE_SUCCESS_OUTCOMES.includes(normalized.outcome) &&
      (!expectedZhihuPostId ||
        normalized.platformPostId !== expectedZhihuPostId)
    ) {
      return null
    }

    if (normalized.canonicalUrl) {
      const canonical = parsePublicationUrl(
        request.platform,
        normalized.canonicalUrl,
      )
      if (
        !canonical ||
        canonical.surface !== 'PUBLISHED' ||
        !canonical.canonicalUrl
      ) {
        return null
      }
      if (
        request.platform === 'zhihu' &&
        ZHIHU_ARTICLE_SUCCESS_OUTCOMES.includes(normalized.outcome) &&
        (!expectedZhihuPostId ||
          canonical.postId !== expectedZhihuPostId ||
          canonical.postId !== normalized.platformPostId)
      ) {
        return null
      }
      normalized = {
        ...normalized,
        canonicalUrl: canonical.canonicalUrl,
      }
    }

    seenKeys.add(normalized.observationKey)
    observations.push(normalized)
  }

  return observations
}

function withInspectionTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('PUBLICATION_INSPECTION_TIMEOUT')),
      timeoutMs,
    )
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Execute an adapter inspector behind a final schema, account, URL and timeout
 * boundary. Adapter failures never become NOT_FOUND.
 */
export async function runPublicationInspection(
  request: PublicationInspectRequest,
  adapter: PublicationInspectorAdapter | null,
  timeoutMs = INSPECTION_TIMEOUT_MS,
): Promise<PublicationObservation[]> {
  if (
    !ACTIVE_INSPECTION_PLATFORMS.has(request.platform) ||
    !adapter?.inspectPublication
  ) {
    return [createUnsupportedPublicationObservation(request)]
  }

  try {
    const value = await withInspectionTimeout(
      adapter.inspectPublication(request),
      timeoutMs,
    )
    const observations = normalizeAdapterObservations(request, value)
    if (!observations) {
      return [
        createInspectionFailure(
          request,
          'PARSE_ERROR',
          'INVALID_INSPECTION_RESULT',
          'The platform inspector returned an invalid result.',
        ),
      ]
    }
    return observations
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.message === 'PUBLICATION_INSPECTION_TIMEOUT'
    return [
      createInspectionFailure(
        request,
        'FETCH_ERROR',
        timedOut
          ? 'PUBLICATION_INSPECTION_TIMEOUT'
          : 'PUBLICATION_INSPECTION_FAILED',
        timedOut
          ? 'The platform inspection timed out.'
          : 'The platform inspection failed.',
      ),
    ]
  }
}
