import { describe, expect, it } from 'vitest'
import {
  PublicationInspectRequestSchema,
  PublicationObservationSchema,
  SYNCER_BRIDGE_REQUEST_ID_MAX_LENGTH,
  SyncerAccountV2Schema,
} from '../types'

describe('publication inspection contracts', () => {
  it('accepts one stable account identity for a supported platform', () => {
    expect(
      SyncerAccountV2Schema.parse({
        platform: 'sohu',
        externalAccountId: 'account-1',
        displayName: '示例账号',
        capabilities: ['account_identity', 'publication_inspect'],
      }),
    ).toMatchObject({ externalAccountId: 'account-1' })
  })

  it('limits one inspection to at most 20 candidates', () => {
    const result = PublicationInspectRequestSchema.safeParse({
      requestId: 'request-1',
      platform: 'zhihu',
      externalAccountId: 'account-1',
      draft: {
        platformPostId: 'post-1',
        draftedAt: '2026-07-21T12:00:00+08:00',
      },
      articleHint: { title: '示例文章' },
      limit: 21,
    })

    expect(result.success).toBe(false)
  })

  it('normalizes request IDs before enforcing the 128-character limit', () => {
    const requestId = 'r'.repeat(SYNCER_BRIDGE_REQUEST_ID_MAX_LENGTH)
    const baseRequest = {
      platform: 'zhihu',
      externalAccountId: 'account-1',
      draft: {
        platformPostId: 'post-1',
        draftedAt: '2026-07-21T12:00:00+08:00',
      },
      articleHint: { title: '示例文章' },
      limit: 20,
    }

    expect(
      PublicationInspectRequestSchema.parse({
        ...baseRequest,
        requestId: ` ${requestId} `,
      }).requestId,
    ).toBe(requestId)
    expect(
      PublicationInspectRequestSchema.safeParse({
        ...baseRequest,
        requestId: `${requestId}x`,
      }).success,
    ).toBe(false)
  })

  it('requires an explicit errorCode for adapter failures', () => {
    const result = PublicationObservationSchema.safeParse({
      observationKey: 'observation-1',
      platform: 'toutiao',
      externalAccountId: 'account-1',
      outcome: 'PARSE_ERROR',
      source: 'PUBLISHED_LIST',
      observedAt: '2026-07-21T12:00:00+08:00',
    })

    expect(result.success).toBe(false)
  })

  it.each(['ACCOUNT_MISMATCH', 'REVIEW_REQUIRED'])(
    'requires an explicit errorCode for %s',
    (outcome) => {
      const result = PublicationObservationSchema.safeParse({
        observationKey: 'observation-1',
        platform: 'sohu',
        externalAccountId: 'account-1',
        outcome,
        source: 'PLATFORM_DETAIL',
        observedAt: '2026-07-21T12:00:00+08:00',
      })

      expect(result.success).toBe(false)
    },
  )

  it.each(['PENDING_REVIEW', 'REJECTED', 'SCHEDULED'])(
    'accepts the explicit platform lifecycle state %s',
    (outcome) => {
      const result = PublicationObservationSchema.safeParse({
        observationKey: 'observation-1',
        platform: 'sohu',
        externalAccountId: 'account-1',
        outcome,
        source: 'PLATFORM_DETAIL',
        platformPostId: 'post-1',
        observedAt: '2026-07-21T12:00:00+08:00',
      })

      expect(result.success).toBe(true)
    },
  )

  it('does not accept a published observation without a stable anchor', () => {
    const result = PublicationObservationSchema.safeParse({
      observationKey: 'observation-1',
      platform: 'weixin',
      externalAccountId: 'account-1',
      outcome: 'PUBLISHED',
      source: 'PUBLISHED_LIST',
      title: '只有标题不够',
      observedAt: '2026-07-21T12:00:00+08:00',
    })

    expect(result.success).toBe(false)
  })

  it('requires a post ID for successful Zhihu article observations', () => {
    const result = PublicationObservationSchema.safeParse({
      observationKey: 'observation-zhihu-draft',
      platform: 'zhihu',
      externalAccountId: 'account-1',
      outcome: 'DRAFT_PRESENT',
      source: 'DRAFT_DETAIL',
      observedAt: '2026-07-21T12:00:00+08:00',
    })

    expect(result.success).toBe(false)
  })

  it('requires post ID, canonical URL, and publication time for published Zhihu observations', () => {
    const base = {
      observationKey: 'observation-zhihu-published',
      platform: 'zhihu' as const,
      externalAccountId: 'account-1',
      outcome: 'PUBLISHED' as const,
      source: 'PUBLIC_PAGE' as const,
      platformPostId: '42',
      observedAt: '2026-07-21T12:00:00+08:00',
    }

    expect(PublicationObservationSchema.safeParse(base).success).toBe(false)
    expect(
      PublicationObservationSchema.safeParse({
        ...base,
        canonicalUrl: 'https://zhuanlan.zhihu.com/p/42',
      }).success,
    ).toBe(false)
    expect(
      PublicationObservationSchema.safeParse({
        ...base,
        canonicalUrl: 'https://zhuanlan.zhihu.com/p/42',
        publishedAt: '2026-07-21T11:55:00+08:00',
      }).success,
    ).toBe(true)
  })
})
