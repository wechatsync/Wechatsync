import { describe, expect, it } from 'vitest'

import {
  buildSyncerAccountsV2,
  createUnsupportedPublicationObservation,
  runPublicationInspection,
  validateBridgeMessageSender,
  validateGetAccountsV2Payload,
  validateInspectPublicationPayload,
} from '../src/background/bridge-v2'

function sender(
  overrides: Partial<chrome.runtime.MessageSender> = {},
): chrome.runtime.MessageSender {
  return {
    origin: 'http://localhost',
    url: 'http://localhost/workspaces/ws-001/articles/article-001',
    frameId: 0,
    tab: {
      id: 42,
      url: 'http://localhost/workspaces/ws-001/articles/article-001',
    } as chrome.tabs.Tab,
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
    title: 'Phase 0 publication verification',
    publishedAfter: '2026-07-21T10:00:00+08:00',
  },
  limit: 20,
}

describe('Bridge v2 background sender boundary', () => {
  it('accepts only a tab-backed top-frame sender from http://localhost', () => {
    expect(validateBridgeMessageSender(sender())).toEqual({
      success: true,
      data: {
        origin: 'http://localhost',
        tabId: 42,
        url: 'http://localhost/workspaces/ws-001/articles/article-001',
      },
    })
  })

  it.each([
    sender({ origin: 'http://localhost:3000', url: 'http://localhost:3000' }),
    sender({
      origin: 'http://127.0.0.1',
      url: 'http://127.0.0.1',
      tab: { id: 42, url: 'http://127.0.0.1' } as chrome.tabs.Tab,
    }),
    sender({ frameId: 1 }),
    sender({ tab: undefined }),
    sender({ url: 'https://localhost/workspaces/ws-001' }),
    sender({
      tab: { id: 42, url: 'http://localhost:3000' } as chrome.tabs.Tab,
    }),
  ])('rejects a non-canonical, sub-frame, or tabless sender', (candidate) => {
    expect(validateBridgeMessageSender(candidate)).toEqual({
      success: false,
      code: 'SENDER_NOT_ALLOWED',
    })
  })
})

describe('Bridge v2 background payload validation', () => {
  it('independently validates and normalizes getAccountsV2 payloads', () => {
    expect(
      validateGetAccountsV2Payload({
        platforms: ['toutiao', 'weixin'],
        forceRefresh: true,
      }),
    ).toEqual({
      success: true,
      data: {
        platforms: ['toutiao', 'weixin'],
        forceRefresh: true,
      },
    })
  })

  it.each([
    undefined,
    { platforms: ['toutiao', 'toutiao'] },
    { platforms: ['baijiahao'] },
    { forceRefresh: 'yes' },
    { forceRefresh: false, extra: true },
  ])('rejects an invalid getAccountsV2 payload', (payload) => {
    expect(validateGetAccountsV2Payload(payload)).toEqual({
      success: false,
      code: 'INVALID_PAYLOAD',
    })
  })

  it('independently validates inspectPublication and binds its request ID', () => {
    expect(
      validateInspectPublicationPayload(inspectPayload, 'inspect-001'),
    ).toEqual({ success: true, data: inspectPayload })

    expect(
      validateInspectPublicationPayload(inspectPayload, 'another-request'),
    ).toEqual({ success: false, code: 'INVALID_PAYLOAD' })
  })

  it('binds inspection payloads after normalizing both request IDs', () => {
    expect(
      validateInspectPublicationPayload(
        { ...inspectPayload, requestId: ' inspect-001 ' },
        ' inspect-001 ',
      ),
    ).toEqual({ success: true, data: inspectPayload })
  })

  it.each([
    { ...inspectPayload, limit: 21 },
    { ...inspectPayload, platform: 'baijiahao' },
    { ...inspectPayload, unexpected: true },
    {
      ...inspectPayload,
      draft: { ...inspectPayload.draft, unexpected: true },
    },
    {
      ...inspectPayload,
      articleHint: { ...inspectPayload.articleHint, unexpected: true },
    },
  ])('rejects an invalid inspectPublication payload', (payload) => {
    expect(validateInspectPublicationPayload(payload, 'inspect-001')).toEqual({
      success: false,
      code: 'INVALID_PAYLOAD',
    })
  })
})

describe('Bridge v2 account projection', () => {
  it('keeps only authenticated Phase 0 accounts with a stable user ID', () => {
    const accounts = buildSyncerAccountsV2([
      {
        id: 'toutiao',
        name: 'Toutiao',
        isAuthenticated: true,
        username: ' Creator A ',
        userId: ' account-toutiao ',
        avatar: 'https://cdn.example/avatar.png',
        homepage: 'https://mp.toutiao.com/profile_v4/index',
      },
      {
        id: 'zhihu',
        name: 'Zhihu',
        isAuthenticated: true,
        username: 'Zhihu Creator',
        userId: 'account-zhihu',
      },
      {
        id: 'sohu',
        name: 'Sohu',
        isAuthenticated: true,
        username: 'No stable ID',
      },
      {
        id: 'weixin',
        name: 'WeChat',
        isAuthenticated: true,
        userId: 'account-weixin',
        avatar: 'data:image/png;base64,secret',
        homepage: 'javascript:alert(1)',
      },
      {
        id: 'baijiahao',
        name: 'Out of scope',
        isAuthenticated: true,
        userId: 'account-baijiahao',
      },
    ])

    expect(accounts).toEqual([
      {
        platform: 'toutiao',
        externalAccountId: 'account-toutiao',
        displayName: 'Creator A',
        avatarUrl: 'https://cdn.example/avatar.png',
        homepage: 'https://mp.toutiao.com/profile_v4/index',
        capabilities: ['account_identity'],
      },
      {
        platform: 'zhihu',
        externalAccountId: 'account-zhihu',
        displayName: 'Zhihu Creator',
        capabilities: ['account_identity', 'publication_inspect', 'public_url'],
      },
      {
        platform: 'weixin',
        externalAccountId: 'account-weixin',
        displayName: 'WeChat',
        capabilities: ['account_identity'],
      },
    ])
  })

  it('applies the requested platform filter and emits one account per platform', () => {
    const accounts = buildSyncerAccountsV2(
      [
        {
          id: 'toutiao',
          isAuthenticated: true,
          userId: 'first',
          username: 'First',
        },
        {
          id: 'toutiao',
          isAuthenticated: true,
          userId: 'second',
          username: 'Second',
        },
        {
          id: 'zhihu',
          isAuthenticated: true,
          userId: 'zhihu-account',
          username: 'Zhihu',
        },
      ],
      ['toutiao'],
    )

    expect(accounts).toHaveLength(1)
    expect(accounts[0]).toMatchObject({
      platform: 'toutiao',
      externalAccountId: 'first',
      capabilities: ['account_identity'],
    })
  })
})

describe('Bridge v2 unsupported inspection prototype', () => {
  it('returns an explicit UNSUPPORTED observation instead of NOT_FOUND', () => {
    const request = validateInspectPublicationPayload(
      inspectPayload,
      'inspect-001',
    )
    expect(request.success).toBe(true)
    if (!request.success) return

    expect(
      createUnsupportedPublicationObservation(
        request.data,
        '2026-07-21T12:00:00.000Z',
      ),
    ).toEqual({
      observationKey: 'bridge-v2:inspect-001:toutiao:unsupported',
      platform: 'toutiao',
      externalAccountId: 'account-001',
      outcome: 'UNSUPPORTED',
      source: 'PLATFORM_DETAIL',
      observedAt: '2026-07-21T12:00:00.000Z',
      errorCode: 'PUBLICATION_INSPECTION_NOT_IMPLEMENTED',
      errorMessage:
        'Publication inspection is not implemented for toutiao in Phase 0.',
    })
  })

  it('does not execute an inspector for a paused platform', async () => {
    const request = validateInspectPublicationPayload(
      {
        ...inspectPayload,
        platform: 'sohu',
        externalAccountId: 'account-sohu',
      },
      'inspect-001',
    )
    expect(request.success).toBe(true)
    if (!request.success) return

    const inspectPublication = vi.fn().mockResolvedValue([])
    const observations = await runPublicationInspection(request.data, {
      inspectPublication,
    })

    expect(inspectPublication).not.toHaveBeenCalled()
    expect(observations).toHaveLength(1)
    expect(observations[0]).toMatchObject({
      platform: 'sohu',
      outcome: 'UNSUPPORTED',
    })
  })
})

describe('Bridge v2 inspection execution boundary', () => {
  const request = {
    ...inspectPayload,
    platform: 'zhihu' as const,
    externalAccountId: 'zhihu-account',
    draft: {
      platformPostId: '42',
      draftedAt: inspectPayload.draft.draftedAt,
    },
  }

  it('accepts a valid adapter result and canonicalizes its public URL', async () => {
    await expect(
      runPublicationInspection(request, {
        inspectPublication: async () => [
          {
            observationKey: 'zhihu:42:published',
            platform: 'zhihu',
            externalAccountId: 'zhihu-account',
            outcome: 'PUBLISHED',
            source: 'PUBLIC_PAGE',
            platformPostId: '42',
            canonicalUrl: 'https://zhuanlan.zhihu.com/p/42?utm_source=test',
            publishedAt: '2026-07-21T11:55:00.000Z',
            observedAt: '2026-07-21T12:00:00.000Z',
          },
        ],
      }),
    ).resolves.toMatchObject([
      {
        outcome: 'PUBLISHED',
        canonicalUrl: 'https://zhuanlan.zhihu.com/p/42',
      },
    ])
  })

  it.each([
    [
      'an observed post ID different from the request',
      {
        platformPostId: '43',
        canonicalUrl: 'https://zhuanlan.zhihu.com/p/43',
      },
    ],
    [
      'a canonical URL for another post ID',
      {
        platformPostId: '42',
        canonicalUrl: 'https://zhuanlan.zhihu.com/p/43',
      },
    ],
    [
      'a missing canonical URL',
      {
        platformPostId: '42',
        canonicalUrl: undefined,
      },
    ],
    [
      'a missing publication time',
      {
        platformPostId: '42',
        canonicalUrl: 'https://zhuanlan.zhihu.com/p/42',
        publishedAt: undefined,
      },
    ],
  ])('rejects published Zhihu output with %s', async (_name, overrides) => {
    const observations = await runPublicationInspection(request, {
      inspectPublication: async () =>
        [
          {
            observationKey: 'zhihu:42:published-invalid',
            platform: 'zhihu',
            externalAccountId: 'zhihu-account',
            outcome: 'PUBLISHED',
            source: 'PUBLIC_PAGE',
            publishedAt: '2026-07-21T11:55:00.000Z',
            observedAt: '2026-07-21T12:00:00.000Z',
            ...overrides,
          },
        ] as never,
    })

    expect(observations[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'INVALID_INSPECTION_RESULT',
    })
  })

  it('rejects a successful Zhihu draft observation for another post ID', async () => {
    const observations = await runPublicationInspection(request, {
      inspectPublication: async () => [
        {
          observationKey: 'zhihu:43:draft',
          platform: 'zhihu',
          externalAccountId: 'zhihu-account',
          outcome: 'DRAFT_PRESENT',
          source: 'DRAFT_DETAIL',
          platformPostId: '43',
          observedAt: '2026-07-21T12:00:00.000Z',
        },
      ],
    })

    expect(observations[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'INVALID_INSPECTION_RESULT',
    })
  })

  it.each([
    [],
    [
      {
        observationKey: 'wrong-account',
        platform: 'zhihu',
        externalAccountId: 'another-account',
        outcome: 'NOT_FOUND',
        source: 'PUBLIC_PAGE',
        observedAt: '2026-07-21T12:00:00.000Z',
      },
    ],
  ])('turns invalid adapter output into PARSE_ERROR', async (value) => {
    const observations = await runPublicationInspection(request, {
      inspectPublication: async () => value as never,
    })
    expect(observations[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'INVALID_INSPECTION_RESULT',
    })
  })

  it('turns adapter exceptions and timeouts into FETCH_ERROR', async () => {
    const failed = await runPublicationInspection(request, {
      inspectPublication: async () => {
        throw new Error('secret platform response')
      },
    })
    expect(failed[0]).toMatchObject({
      outcome: 'FETCH_ERROR',
      errorCode: 'PUBLICATION_INSPECTION_FAILED',
      errorMessage: 'The platform inspection failed.',
    })
    expect(JSON.stringify(failed)).not.toContain('secret platform response')

    const timedOut = await runPublicationInspection(
      request,
      { inspectPublication: () => new Promise(() => {}) },
      1,
    )
    expect(timedOut[0]).toMatchObject({
      outcome: 'FETCH_ERROR',
      errorCode: 'PUBLICATION_INSPECTION_TIMEOUT',
    })
  })
})
