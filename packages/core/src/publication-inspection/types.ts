import { z } from 'zod'

export const PublicationPlatformSchema = z.enum([
  'toutiao',
  'zhihu',
  'sohu',
  'weixin',
])

export type PublicationPlatform = z.infer<typeof PublicationPlatformSchema>

export const PublicationInspectionCapabilitySchema = z.enum([
  'account_identity',
  'full_sync_result',
  'publication_inspect',
  'published_list',
  'public_url',
])

export type PublicationInspectionCapability = z.infer<
  typeof PublicationInspectionCapabilitySchema
>

export const SyncerBridgeInfoSchema = z.object({
  apiVersion: z.literal('2.0'),
  extensionVersion: z.string().min(1),
  capabilities: z.array(PublicationInspectionCapabilitySchema),
})

export type SyncerBridgeInfo = z.infer<typeof SyncerBridgeInfoSchema>

export const SyncerAccountV2Schema = z.object({
  platform: PublicationPlatformSchema,
  externalAccountId: z.string().trim().min(1).max(500),
  displayName: z.string().trim().min(1).max(500),
  avatarUrl: z.string().url().max(2_000).optional(),
  homepage: z.string().url().max(2_000).optional(),
  capabilities: z.array(PublicationInspectionCapabilitySchema).max(10),
})

export type SyncerAccountV2 = z.infer<typeof SyncerAccountV2Schema>

export const SYNCER_BRIDGE_REQUEST_ID_MAX_LENGTH = 128

export const PublicationInspectRequestSchema = z.object({
  requestId: z.string().trim().min(1).max(SYNCER_BRIDGE_REQUEST_ID_MAX_LENGTH),
  platform: PublicationPlatformSchema,
  externalAccountId: z.string().trim().min(1).max(500),
  draft: z.object({
    platformPostId: z.string().trim().min(1).max(500).optional(),
    draftUrl: z.string().url().max(4_096).optional(),
    draftedAt: z.string().datetime({ offset: true }),
  }),
  articleHint: z.object({
    title: z.string().min(1).max(500),
    publishedAfter: z.string().datetime({ offset: true }).optional(),
    publishedBefore: z.string().datetime({ offset: true }).optional(),
  }),
  limit: z.number().int().min(1).max(20),
})

export type PublicationInspectRequest = z.infer<
  typeof PublicationInspectRequestSchema
>

export const PublicationObservationOutcomeSchema = z.enum([
  'DRAFT_PRESENT',
  'PENDING_REVIEW',
  'REJECTED',
  'SCHEDULED',
  'PUBLISHED',
  'NOT_FOUND',
  'DELETED',
  'REVIEW_REQUIRED',
  'ACCOUNT_MISMATCH',
  'LOGIN_REQUIRED',
  'UNSUPPORTED',
  'FETCH_ERROR',
  'PARSE_ERROR',
])

export type PublicationObservationOutcome = z.infer<
  typeof PublicationObservationOutcomeSchema
>

export const ZHIHU_ARTICLE_SUCCESS_OUTCOMES: readonly PublicationObservationOutcome[] =
  [
    'DRAFT_PRESENT',
    'PENDING_REVIEW',
    'REJECTED',
    'SCHEDULED',
    'PUBLISHED',
    'NOT_FOUND',
    'DELETED',
  ]

export const PublicationObservationSourceSchema = z.enum([
  'DRAFT_DETAIL',
  'DRAFT_LIST',
  'PLATFORM_DETAIL',
  'PUBLISHED_LIST',
  'PUBLIC_PAGE',
])

export type PublicationObservationSource = z.infer<
  typeof PublicationObservationSourceSchema
>

export const PublicationObservationSchema = z
  .object({
    observationKey: z.string().min(1).max(500),
    platform: PublicationPlatformSchema,
    externalAccountId: z.string().trim().min(1).max(500),
    outcome: PublicationObservationOutcomeSchema,
    source: PublicationObservationSourceSchema,
    platformPostId: z.string().trim().min(1).max(500).optional(),
    canonicalUrl: z.string().url().max(4_096).optional(),
    title: z.string().max(500).optional(),
    publishedAt: z.string().datetime({ offset: true }).optional(),
    bodyText: z.string().max(50_000).optional(),
    bodyTruncated: z.boolean().optional(),
    observedAt: z.string().datetime({ offset: true }),
    errorCode: z.string().max(100).optional(),
    errorMessage: z.string().max(2_000).optional(),
  })
  .superRefine((value, ctx) => {
    const isError = [
      'LOGIN_REQUIRED',
      'ACCOUNT_MISMATCH',
      'REVIEW_REQUIRED',
      'UNSUPPORTED',
      'FETCH_ERROR',
      'PARSE_ERROR',
    ].includes(value.outcome)

    if (isError && !value.errorCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'error outcomes require errorCode',
        path: ['errorCode'],
      })
    }

    if (
      value.outcome === 'PUBLISHED' &&
      !value.platformPostId &&
      !value.canonicalUrl
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'published observations require platformPostId or canonicalUrl',
        path: ['platformPostId'],
      })
    }

    if (
      value.platform === 'zhihu' &&
      ZHIHU_ARTICLE_SUCCESS_OUTCOMES.includes(value.outcome) &&
      !value.platformPostId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'successful Zhihu observations require platformPostId',
        path: ['platformPostId'],
      })
    }

    if (
      value.platform === 'zhihu' &&
      value.outcome === 'PUBLISHED' &&
      !value.canonicalUrl
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'published Zhihu observations require canonicalUrl',
        path: ['canonicalUrl'],
      })
    }

    if (
      value.platform === 'zhihu' &&
      value.outcome === 'PUBLISHED' &&
      !value.publishedAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'published Zhihu observations require publishedAt',
        path: ['publishedAt'],
      })
    }
  })

export type PublicationObservation = z.infer<
  typeof PublicationObservationSchema
>
