import {
  PublicationInspectRequestSchema,
  PublicationObservationSchema,
  PublicationPlatformSchema,
  SYNCER_BRIDGE_REQUEST_ID_MAX_LENGTH,
  SyncerAccountV2Schema,
  SyncerBridgeInfoSchema,
  type PublicationInspectRequest,
  type PublicationObservation,
  type PublicationPlatform,
  type SyncerAccountV2,
  type SyncerBridgeInfo,
} from '@wechatsync/core/publication-inspection'

export const BRIDGE_NAMESPACE = 'vibemarket.syncer.bridge' as const
export const BRIDGE_API_VERSION = '2.0' as const

export const BRIDGE_DIRECTIONS = {
  request: 'PAGE_TO_EXTENSION',
  response: 'EXTENSION_TO_PAGE',
} as const

export const BRIDGE_METHODS = [
  'getBridgeInfo',
  'getAccountsV2',
  'inspectPublication',
] as const

export type BridgeMethod = (typeof BRIDGE_METHODS)[number]

/**
 * Phase 0 deliberately allows only the canonical port-80 localhost origin.
 * Other environment origins must be added explicitly in a later build.
 */
export const DEFAULT_BRIDGE_ALLOWED_ORIGINS = ['http://localhost'] as const

export interface GetAccountsV2Payload {
  platforms?: PublicationPlatform[]
  forceRefresh?: boolean
}

export interface BridgeRequestPayloadMap {
  getBridgeInfo: Record<string, never>
  getAccountsV2: GetAccountsV2Payload
  inspectPublication: PublicationInspectRequest
}

export interface BridgeResponseResultMap {
  getBridgeInfo: SyncerBridgeInfo
  getAccountsV2: SyncerAccountV2[]
  inspectPublication: PublicationObservation[]
}

export type BridgeRequestFor<M extends BridgeMethod> = {
  namespace: typeof BRIDGE_NAMESPACE
  apiVersion: typeof BRIDGE_API_VERSION
  direction: typeof BRIDGE_DIRECTIONS.request
  requestId: string
  method: M
  payload: BridgeRequestPayloadMap[M]
}

export type BridgeRequest = {
  [M in BridgeMethod]: BridgeRequestFor<M>
}[BridgeMethod]

export type BridgeSuccessResponseFor<M extends BridgeMethod> = {
  namespace: typeof BRIDGE_NAMESPACE
  apiVersion: typeof BRIDGE_API_VERSION
  direction: typeof BRIDGE_DIRECTIONS.response
  requestId: string
  method: M
  ok: true
  result: BridgeResponseResultMap[M]
}

export interface BridgeError {
  code: string
  message: string
}

export type BridgeErrorResponseFor<M extends BridgeMethod> = {
  namespace: typeof BRIDGE_NAMESPACE
  apiVersion: typeof BRIDGE_API_VERSION
  direction: typeof BRIDGE_DIRECTIONS.response
  requestId: string
  method: M
  ok: false
  error: BridgeError
}

export type BridgeSuccessResponse = {
  [M in BridgeMethod]: BridgeSuccessResponseFor<M>
}[BridgeMethod]

export type BridgeErrorResponse = {
  [M in BridgeMethod]: BridgeErrorResponseFor<M>
}[BridgeMethod]

export type BridgeResponse = BridgeSuccessResponse | BridgeErrorResponse

export type BridgeProtocolFailureCode =
  | 'SOURCE_MISMATCH'
  | 'ORIGIN_NOT_ALLOWED'
  | 'INVALID_ENVELOPE'
  | 'METHOD_NOT_ALLOWED'
  | 'INVALID_PAYLOAD'

export type BridgeParseResult<T> =
  | { success: true; data: T }
  | { success: false; code: BridgeProtocolFailureCode }

export interface BridgeMessageEventLike {
  origin: unknown
  source: unknown
  data: unknown
}

const REQUEST_ENVELOPE_KEYS = new Set([
  'namespace',
  'apiVersion',
  'direction',
  'requestId',
  'method',
  'payload',
])

const RESPONSE_SUCCESS_KEYS = new Set([
  'namespace',
  'apiVersion',
  'direction',
  'requestId',
  'method',
  'ok',
  'result',
])

const RESPONSE_ERROR_KEYS = new Set([
  'namespace',
  'apiVersion',
  'direction',
  'requestId',
  'method',
  'ok',
  'error',
])

const INSPECT_PAYLOAD_KEYS = new Set([
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

const GET_ACCOUNTS_KEYS = new Set(['platforms', 'forceRefresh'])
const ERROR_KEYS = new Set(['code', 'message'])

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

export function normalizeBridgeRequestId(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  return normalized.length > 0 &&
    normalized.length <= SYNCER_BRIDGE_REQUEST_ID_MAX_LENGTH
    ? normalized
    : null
}

function isBridgeMethod(value: unknown): value is BridgeMethod {
  return (
    typeof value === 'string' &&
    (BRIDGE_METHODS as readonly string[]).includes(value)
  )
}

function isSafeAllowlistOrigin(origin: string): boolean {
  if (origin.includes('*')) return false

  try {
    const parsed = new URL(origin)
    if (parsed.origin !== origin) return false
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
      return false

    if (parsed.hostname === 'localhost') {
      return origin === 'http://localhost'
    }

    if (
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '[::1]' ||
      parsed.hostname === '::1'
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function isAllowedBridgeOrigin(
  origin: unknown,
  allowedOrigins: readonly string[] = DEFAULT_BRIDGE_ALLOWED_ORIGINS,
): origin is string {
  if (typeof origin !== 'string') return false

  return allowedOrigins.some(
    (allowedOrigin) =>
      isSafeAllowlistOrigin(allowedOrigin) && origin === allowedOrigin,
  )
}

function parseGetBridgeInfoPayload(
  value: unknown,
): Record<string, never> | null {
  if (typeof value === 'undefined') return {}
  if (!isRecord(value) || Object.keys(value).length !== 0) return null
  return {}
}

function parseGetAccountsV2Payload(
  value: unknown,
): GetAccountsV2Payload | null {
  if (!isRecord(value) || !hasOnlyKeys(value, GET_ACCOUNTS_KEYS)) return null

  const { platforms, forceRefresh } = value
  if (
    typeof forceRefresh !== 'undefined' &&
    typeof forceRefresh !== 'boolean'
  ) {
    return null
  }

  let parsedPlatforms: PublicationPlatform[] | undefined
  if (typeof platforms !== 'undefined') {
    if (!Array.isArray(platforms) || platforms.length > 4) return null

    parsedPlatforms = []
    for (const platform of platforms) {
      const parsed = PublicationPlatformSchema.safeParse(platform)
      if (!parsed.success || parsedPlatforms.includes(parsed.data)) return null
      parsedPlatforms.push(parsed.data)
    }
  }

  return {
    ...(parsedPlatforms ? { platforms: parsedPlatforms } : {}),
    ...(typeof forceRefresh === 'boolean' ? { forceRefresh } : {}),
  }
}

function hasStrictInspectPayloadShape(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, INSPECT_PAYLOAD_KEYS)) {
    return false
  }

  return (
    isRecord(value.draft) &&
    hasOnlyKeys(value.draft, INSPECT_DRAFT_KEYS) &&
    isRecord(value.articleHint) &&
    hasOnlyKeys(value.articleHint, INSPECT_ARTICLE_HINT_KEYS)
  )
}

function parseInspectPublicationPayload(
  value: unknown,
  envelopeRequestId: string,
): PublicationInspectRequest | null {
  if (!hasStrictInspectPayloadShape(value)) return null

  const parsed = PublicationInspectRequestSchema.safeParse(value)
  if (!parsed.success || parsed.data.requestId !== envelopeRequestId)
    return null
  return parsed.data
}

function parseRequestPayload<M extends BridgeMethod>(
  method: M,
  value: unknown,
  requestId: string,
): BridgeRequestPayloadMap[M] | null {
  switch (method) {
    case 'getBridgeInfo':
      return parseGetBridgeInfoPayload(value) as
        | BridgeRequestPayloadMap[M]
        | null
    case 'getAccountsV2':
      return parseGetAccountsV2Payload(value) as
        | BridgeRequestPayloadMap[M]
        | null
    case 'inspectPublication':
      return parseInspectPublicationPayload(value, requestId) as
        | BridgeRequestPayloadMap[M]
        | null
  }
}

function validateEventBoundary(
  event: BridgeMessageEventLike,
  expectedSource: unknown,
  allowedOrigins: readonly string[],
): BridgeParseResult<never> | null {
  if (event.source !== expectedSource) {
    return { success: false, code: 'SOURCE_MISMATCH' }
  }

  if (!isAllowedBridgeOrigin(event.origin, allowedOrigins)) {
    return { success: false, code: 'ORIGIN_NOT_ALLOWED' }
  }

  return null
}

export function parseBridgeRequestEvent(
  event: BridgeMessageEventLike,
  expectedSource: unknown,
  allowedOrigins: readonly string[] = DEFAULT_BRIDGE_ALLOWED_ORIGINS,
): BridgeParseResult<BridgeRequest> {
  const boundaryFailure = validateEventBoundary(
    event,
    expectedSource,
    allowedOrigins,
  )
  if (boundaryFailure) return boundaryFailure

  if (
    !isRecord(event.data) ||
    !hasOnlyKeys(event.data, REQUEST_ENVELOPE_KEYS)
  ) {
    return { success: false, code: 'INVALID_ENVELOPE' }
  }

  const { data } = event
  const requestId = normalizeBridgeRequestId(data.requestId)
  if (
    data.namespace !== BRIDGE_NAMESPACE ||
    data.apiVersion !== BRIDGE_API_VERSION ||
    data.direction !== BRIDGE_DIRECTIONS.request ||
    requestId === null
  ) {
    return { success: false, code: 'INVALID_ENVELOPE' }
  }

  if (!isBridgeMethod(data.method)) {
    return { success: false, code: 'METHOD_NOT_ALLOWED' }
  }

  const payload = parseRequestPayload(data.method, data.payload, requestId)
  if (payload === null) {
    return { success: false, code: 'INVALID_PAYLOAD' }
  }

  return {
    success: true,
    data: {
      namespace: BRIDGE_NAMESPACE,
      apiVersion: BRIDGE_API_VERSION,
      direction: BRIDGE_DIRECTIONS.request,
      requestId,
      method: data.method,
      payload,
    } as BridgeRequest,
  }
}

function parseResponseResult<M extends BridgeMethod>(
  method: M,
  value: unknown,
): BridgeResponseResultMap[M] | null {
  if (method === 'getBridgeInfo') {
    const parsed = SyncerBridgeInfoSchema.safeParse(value)
    return parsed.success ? (parsed.data as BridgeResponseResultMap[M]) : null
  }

  if (!Array.isArray(value)) return null

  if (method === 'getAccountsV2') {
    const parsed = value.map((account) =>
      SyncerAccountV2Schema.safeParse(account),
    )
    return parsed.every((result) => result.success)
      ? (parsed.map((result) => result.data) as BridgeResponseResultMap[M])
      : null
  }

  const parsed = value.map((observation) =>
    PublicationObservationSchema.safeParse(observation),
  )
  return parsed.every((result) => result.success)
    ? (parsed.map((result) => result.data) as BridgeResponseResultMap[M])
    : null
}

function parseBridgeError(value: unknown): BridgeError | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ERROR_KEYS)) return null

  if (
    typeof value.code !== 'string' ||
    value.code.length === 0 ||
    value.code.length > 100 ||
    typeof value.message !== 'string' ||
    value.message.length === 0 ||
    value.message.length > 2_000
  ) {
    return null
  }

  return { code: value.code, message: value.message }
}

export function parseBridgeResponseEvent(
  event: BridgeMessageEventLike,
  expectedSource: unknown,
  allowedOrigins: readonly string[] = DEFAULT_BRIDGE_ALLOWED_ORIGINS,
): BridgeParseResult<BridgeResponse> {
  const boundaryFailure = validateEventBoundary(
    event,
    expectedSource,
    allowedOrigins,
  )
  if (boundaryFailure) return boundaryFailure

  if (!isRecord(event.data)) {
    return { success: false, code: 'INVALID_ENVELOPE' }
  }

  const { data } = event
  const requestId = normalizeBridgeRequestId(data.requestId)
  const expectedKeys =
    data.ok === true ? RESPONSE_SUCCESS_KEYS : RESPONSE_ERROR_KEYS
  if (
    !hasOnlyKeys(data, expectedKeys) ||
    data.namespace !== BRIDGE_NAMESPACE ||
    data.apiVersion !== BRIDGE_API_VERSION ||
    data.direction !== BRIDGE_DIRECTIONS.response ||
    requestId === null
  ) {
    return { success: false, code: 'INVALID_ENVELOPE' }
  }

  if (!isBridgeMethod(data.method)) {
    return { success: false, code: 'METHOD_NOT_ALLOWED' }
  }

  if (data.ok === true) {
    const result = parseResponseResult(data.method, data.result)
    if (result === null) {
      return { success: false, code: 'INVALID_PAYLOAD' }
    }

    return {
      success: true,
      data: {
        namespace: BRIDGE_NAMESPACE,
        apiVersion: BRIDGE_API_VERSION,
        direction: BRIDGE_DIRECTIONS.response,
        requestId,
        method: data.method,
        ok: true,
        result,
      } as BridgeSuccessResponse,
    }
  }

  if (data.ok !== false) {
    return { success: false, code: 'INVALID_ENVELOPE' }
  }

  const error = parseBridgeError(data.error)
  if (error === null) {
    return { success: false, code: 'INVALID_PAYLOAD' }
  }

  return {
    success: true,
    data: {
      namespace: BRIDGE_NAMESPACE,
      apiVersion: BRIDGE_API_VERSION,
      direction: BRIDGE_DIRECTIONS.response,
      requestId,
      method: data.method,
      ok: false,
      error,
    } as BridgeErrorResponse,
  }
}

export function createBridgeSuccessResponse<M extends BridgeMethod>(
  request: BridgeRequestFor<M>,
  result: BridgeResponseResultMap[M],
): BridgeSuccessResponseFor<M> {
  const parsedResult = parseResponseResult(request.method, result)
  if (parsedResult === null) {
    throw new TypeError(`Invalid result for bridge method ${request.method}`)
  }

  return {
    namespace: BRIDGE_NAMESPACE,
    apiVersion: BRIDGE_API_VERSION,
    direction: BRIDGE_DIRECTIONS.response,
    requestId: request.requestId,
    method: request.method,
    ok: true,
    result: parsedResult,
  }
}

export function createBridgeErrorResponse<M extends BridgeMethod>(
  request: BridgeRequestFor<M>,
  error: BridgeError,
): BridgeErrorResponseFor<M> {
  const parsedError = parseBridgeError(error)
  if (parsedError === null) {
    throw new TypeError('Invalid bridge error')
  }

  return {
    namespace: BRIDGE_NAMESPACE,
    apiVersion: BRIDGE_API_VERSION,
    direction: BRIDGE_DIRECTIONS.response,
    requestId: request.requestId,
    method: request.method,
    ok: false,
    error: parsedError,
  }
}
