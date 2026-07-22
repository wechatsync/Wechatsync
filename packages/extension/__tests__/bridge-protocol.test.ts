import { describe, expect, it } from 'vitest'

import {
  BRIDGE_API_VERSION,
  BRIDGE_DIRECTIONS,
  BRIDGE_NAMESPACE,
  createBridgeErrorResponse,
  createBridgeSuccessResponse,
  isAllowedBridgeOrigin,
  parseBridgeRequestEvent,
  parseBridgeResponseEvent,
  type BridgeMessageEventLike,
} from '../src/bridge'

const topWindow = { kind: 'top-window' }

function requestEvent(
  overrides: Partial<BridgeMessageEventLike> = {},
): BridgeMessageEventLike {
  return {
    origin: 'http://localhost',
    source: topWindow,
    data: {
      namespace: BRIDGE_NAMESPACE,
      apiVersion: BRIDGE_API_VERSION,
      direction: BRIDGE_DIRECTIONS.request,
      requestId: 'req-001',
      method: 'getBridgeInfo',
      payload: {},
    },
    ...overrides,
  }
}

const inspectPayload = {
  requestId: 'inspect-001',
  platform: 'toutiao',
  externalAccountId: 'account-001',
  draft: {
    platformPostId: 'draft-001',
    draftedAt: '2026-07-21T10:00:00+08:00',
  },
  articleHint: {
    title: 'Phase 0 核验文章',
    publishedAfter: '2026-07-21T10:00:00+08:00',
  },
  limit: 20,
}

describe('Bridge v2 origin policy', () => {
  it('only allows exact http://localhost by default', () => {
    expect(isAllowedBridgeOrigin('http://localhost')).toBe(true)
    expect(isAllowedBridgeOrigin('http://localhost:80')).toBe(false)
    expect(isAllowedBridgeOrigin('http://localhost:3000')).toBe(false)
    expect(isAllowedBridgeOrigin('http://127.0.0.1')).toBe(false)
    expect(isAllowedBridgeOrigin('https://localhost')).toBe(false)
    expect(isAllowedBridgeOrigin('http://localhost.evil.example')).toBe(false)
    expect(isAllowedBridgeOrigin('null')).toBe(false)
  })

  it('never interprets wildcard entries as an allow rule', () => {
    expect(isAllowedBridgeOrigin('https://evil.example', ['*'])).toBe(false)
    expect(
      isAllowedBridgeOrigin('https://evil.example', ['https://*.example']),
    ).toBe(false)
  })

  it('supports future exact non-loopback build origins without prefix matching', () => {
    const allowlist = ['https://staging.vibemarket.example']
    expect(
      isAllowedBridgeOrigin('https://staging.vibemarket.example', allowlist),
    ).toBe(true)
    expect(
      isAllowedBridgeOrigin(
        'https://staging.vibemarket.example.evil',
        allowlist,
      ),
    ).toBe(false)
  })
})

describe('Bridge v2 request parsing', () => {
  it('accepts the three allowlisted methods with validated payloads', () => {
    const bridgeInfo = parseBridgeRequestEvent(requestEvent(), topWindow)
    expect(bridgeInfo.success).toBe(true)

    const accounts = parseBridgeRequestEvent(
      requestEvent({
        data: {
          namespace: BRIDGE_NAMESPACE,
          apiVersion: BRIDGE_API_VERSION,
          direction: BRIDGE_DIRECTIONS.request,
          requestId: 'accounts-001',
          method: 'getAccountsV2',
          payload: {
            platforms: ['toutiao', 'zhihu', 'sohu', 'weixin'],
            forceRefresh: true,
          },
        },
      }),
      topWindow,
    )
    expect(accounts).toMatchObject({
      success: true,
      data: { method: 'getAccountsV2' },
    })

    const inspect = parseBridgeRequestEvent(
      requestEvent({
        data: {
          namespace: BRIDGE_NAMESPACE,
          apiVersion: BRIDGE_API_VERSION,
          direction: BRIDGE_DIRECTIONS.request,
          requestId: 'inspect-001',
          method: 'inspectPublication',
          payload: inspectPayload,
        },
      }),
      topWindow,
    )
    expect(inspect).toMatchObject({
      success: true,
      data: { method: 'inspectPublication', payload: inspectPayload },
    })
  })

  it.each([
    'https://evil.example',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://localhost.evil.example',
  ])('rejects malicious or unlisted origin %s', (origin) => {
    expect(
      parseBridgeRequestEvent(requestEvent({ origin }), topWindow),
    ).toEqual({ success: false, code: 'ORIGIN_NOT_ALLOWED' })
  })

  it('rejects a message from a child or foreign frame', () => {
    expect(
      parseBridgeRequestEvent(
        requestEvent({ source: { kind: 'child-frame' } }),
        topWindow,
      ),
    ).toEqual({ success: false, code: 'SOURCE_MISMATCH' })
  })

  it('rejects unknown methods before touching their payload', () => {
    const event = requestEvent()
    ;(event.data as Record<string, unknown>).method = 'magicCall'
    ;(event.data as Record<string, unknown>).payload = { arbitrary: true }

    expect(parseBridgeRequestEvent(event, topWindow)).toEqual({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
    })
  })

  it.each([
    null,
    [],
    { namespace: BRIDGE_NAMESPACE },
    {
      namespace: BRIDGE_NAMESPACE,
      apiVersion: BRIDGE_API_VERSION,
      direction: BRIDGE_DIRECTIONS.request,
      requestId: '',
      method: 'getBridgeInfo',
      payload: {},
    },
    {
      namespace: BRIDGE_NAMESPACE,
      apiVersion: BRIDGE_API_VERSION,
      direction: BRIDGE_DIRECTIONS.response,
      requestId: 'req-001',
      method: 'getBridgeInfo',
      payload: {},
    },
  ])('rejects malformed envelopes', (data) => {
    expect(parseBridgeRequestEvent(requestEvent({ data }), topWindow)).toEqual({
      success: false,
      code: 'INVALID_ENVELOPE',
    })
  })

  it('normalizes request IDs before enforcing the 128-character limit', () => {
    const requestId = 'r'.repeat(128)
    const accepted = requestEvent()
    accepted.data = {
      ...(accepted.data as Record<string, unknown>),
      requestId: ` ${requestId} `,
    }

    expect(parseBridgeRequestEvent(accepted, topWindow)).toMatchObject({
      success: true,
      data: { requestId },
    })

    const rejected = requestEvent()
    rejected.data = {
      ...(rejected.data as Record<string, unknown>),
      requestId: `${requestId}x`,
    }
    expect(parseBridgeRequestEvent(rejected, topWindow)).toEqual({
      success: false,
      code: 'INVALID_ENVELOPE',
    })
  })

  it('binds inspection payloads to the normalized envelope request ID', () => {
    const paddedRequestId = ' inspect-001 '
    const event = requestEvent()
    event.data = {
      ...(event.data as Record<string, unknown>),
      requestId: paddedRequestId,
      method: 'inspectPublication',
      payload: { ...inspectPayload, requestId: paddedRequestId },
    }

    expect(parseBridgeRequestEvent(event, topWindow)).toMatchObject({
      success: true,
      data: {
        requestId: 'inspect-001',
        payload: { requestId: 'inspect-001' },
      },
    })
  })

  it('rejects malformed and over-broad account payloads', () => {
    const duplicatePlatforms = requestEvent()
    duplicatePlatforms.data = {
      ...(duplicatePlatforms.data as Record<string, unknown>),
      requestId: 'accounts-001',
      method: 'getAccountsV2',
      payload: { platforms: ['toutiao', 'toutiao'] },
    }

    expect(parseBridgeRequestEvent(duplicatePlatforms, topWindow)).toEqual({
      success: false,
      code: 'INVALID_PAYLOAD',
    })

    const unknownKey = requestEvent()
    unknownKey.data = {
      ...(unknownKey.data as Record<string, unknown>),
      requestId: 'accounts-002',
      method: 'getAccountsV2',
      payload: { forceRefresh: false, unsafe: true },
    }

    expect(parseBridgeRequestEvent(unknownKey, topWindow)).toEqual({
      success: false,
      code: 'INVALID_PAYLOAD',
    })
  })

  it('rejects malformed inspection payloads and mismatched request IDs', () => {
    const mismatch = requestEvent()
    mismatch.data = {
      ...(mismatch.data as Record<string, unknown>),
      requestId: 'envelope-id',
      method: 'inspectPublication',
      payload: inspectPayload,
    }
    expect(parseBridgeRequestEvent(mismatch, topWindow)).toEqual({
      success: false,
      code: 'INVALID_PAYLOAD',
    })

    const excessiveLimit = requestEvent()
    excessiveLimit.data = {
      ...(excessiveLimit.data as Record<string, unknown>),
      requestId: 'inspect-001',
      method: 'inspectPublication',
      payload: { ...inspectPayload, limit: 21 },
    }
    expect(parseBridgeRequestEvent(excessiveLimit, topWindow)).toEqual({
      success: false,
      code: 'INVALID_PAYLOAD',
    })
  })
})

describe('Bridge v2 responses', () => {
  it('creates and parses a schema-validated success response', () => {
    const parsedRequest = parseBridgeRequestEvent(requestEvent(), topWindow)
    if (
      !parsedRequest.success ||
      parsedRequest.data.method !== 'getBridgeInfo'
    ) {
      throw new Error('expected a getBridgeInfo request')
    }

    const response = createBridgeSuccessResponse(parsedRequest.data, {
      apiVersion: '2.0',
      extensionVersion: '2.0.10',
      capabilities: ['account_identity', 'publication_inspect', 'public_url'],
    })

    expect(
      parseBridgeResponseEvent(
        { origin: 'http://localhost', source: topWindow, data: response },
        topWindow,
      ),
    ).toEqual({ success: true, data: response })
  })

  it('creates and parses a bounded error response', () => {
    const parsedRequest = parseBridgeRequestEvent(requestEvent(), topWindow)
    if (
      !parsedRequest.success ||
      parsedRequest.data.method !== 'getBridgeInfo'
    ) {
      throw new Error('expected a getBridgeInfo request')
    }

    const response = createBridgeErrorResponse(parsedRequest.data, {
      code: 'LOGIN_REQUIRED',
      message: 'Please log in first',
    })

    expect(
      parseBridgeResponseEvent(
        { origin: 'http://localhost', source: topWindow, data: response },
        topWindow,
      ),
    ).toEqual({ success: true, data: response })
  })

  it('rejects malformed response results', () => {
    const malformed = {
      namespace: BRIDGE_NAMESPACE,
      apiVersion: BRIDGE_API_VERSION,
      direction: BRIDGE_DIRECTIONS.response,
      requestId: 'req-001',
      method: 'getBridgeInfo',
      ok: true,
      result: { apiVersion: '1.0' },
    }

    expect(
      parseBridgeResponseEvent(
        { origin: 'http://localhost', source: topWindow, data: malformed },
        topWindow,
      ),
    ).toEqual({ success: false, code: 'INVALID_PAYLOAD' })
  })
})
