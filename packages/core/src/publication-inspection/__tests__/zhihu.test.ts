import { describe, expect, it, vi } from 'vitest'
import type { PublicationInspectRequest } from '../types'
import {
  decideZhihuPublishedEvidence,
  inspectZhihuPublication,
  parseZhihuPublishedArticleEvidence,
  type ZhihuInspectionDependencies,
} from '../zhihu'

const POST_ID = '2000000000000000001'
const ACCOUNT_ID = 'account-zhihu'
const NOW = '2026-07-22T09:00:00+08:00'
const PUBLISHED_AT = '2026-07-22T07:49:00.000Z'
const PUBLIC_URL = `https://zhuanlan.zhihu.com/p/${POST_ID}`
const DRAFT_URL = `${PUBLIC_URL}/edit`
const DRAFT_API_URL = `https://zhuanlan.zhihu.com/api/articles/${POST_ID}/draft`

function createRequest(
  overrides: Partial<PublicationInspectRequest> = {},
): PublicationInspectRequest {
  return {
    requestId: 'request-zhihu-1',
    platform: 'zhihu',
    externalAccountId: ACCOUNT_ID,
    draft: {
      platformPostId: POST_ID,
      draftUrl: DRAFT_URL,
      draftedAt: '2026-07-21T10:00:00+08:00',
    },
    articleHint: { title: '脱敏示例标题' },
    limit: 20,
    ...overrides,
  }
}

function htmlResponse(
  status: number,
  url: string,
  body = '',
  contentType = 'text/html; charset=utf-8',
): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    url,
    headers: new Headers({ 'content-type': contentType }),
    text: async () => body,
  } as Response
}

function jsonResponse(
  status: number,
  url: string,
  payload: unknown,
  contentType = 'application/json; charset=utf-8',
): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    url,
    headers: new Headers({ 'content-type': contentType }),
    json: async () => payload,
  } as Response
}

function createDependencies(
  fetchImpl: ZhihuInspectionDependencies['fetch'],
  auth: Awaited<ReturnType<ZhihuInspectionDependencies['checkAuth']>> = {
    isAuthenticated: true,
    userId: ACCOUNT_ID,
  },
): ZhihuInspectionDependencies {
  return {
    checkAuth: vi.fn().mockResolvedValue(auth),
    fetch: fetchImpl,
    now: () => NOW,
  }
}

function publishedHtmlFor(
  articleOverrides: Record<string, unknown> = {},
  initialDataOverride?: string,
): string {
  const article = {
    id: POST_ID,
    type: 'article',
    articleType: 'normal',
    author: { id: ACCOUNT_ID },
    state: 'published',
    status: 0,
    isVisible: true,
    isNormal: true,
    url: PUBLIC_URL,
    created: 1_784_706_540,
    title: '脱敏后的标题 &amp; 版本',
    content: '<p>第一段</p><p>第二段</p>',
    ...articleOverrides,
  }
  const initialData =
    initialDataOverride ??
    JSON.stringify({
      initialState: {
        entities: {
          articles: { [POST_ID]: article },
        },
      },
    })

  return `
    <html>
      <head>
        <link href="${PUBLIC_URL}" rel="canonical">
        <meta content="${PUBLIC_URL}" property="og:url">
        <meta property="og:title" content="脱敏后的标题 &amp; 版本">
        <script type="text/json" id="js-initialData">${initialData}</script>
      </head>
      <body><article><p>第一段</p><p>第二段</p></article></body>
    </html>
  `
}

const publishedHtml = publishedHtmlFor()

const softNotFoundHtml = `
  <html>
    <head><title>你似乎来到了没有知识存在的荒原 - 知乎</title></head>
    <body><main class="ErrorPage">你似乎来到了没有知识存在的荒原</main></body>
  </html>
`

const draftPayload = {
  id: POST_ID,
  title: '脱敏草稿标题',
  content: '<p>草稿正文</p>',
}

describe('Zhihu structured publication evidence', () => {
  it('parses the current official js-initialData article shape', () => {
    const parsed = parseZhihuPublishedArticleEvidence(publishedHtml, POST_ID)

    expect(parsed).toEqual({
      success: true,
      evidence: {
        postId: POST_ID,
        authorId: ACCOUNT_ID,
        title: '脱敏后的标题 & 版本',
        publishedAt: PUBLISHED_AT,
        bodyText: '第一段\n第二段',
        bodyTruncated: false,
      },
    })
    expect(decideZhihuPublishedEvidence(parsed, ACCOUNT_ID)).toMatchObject({
      outcome: 'PUBLISHED',
    })
  })

  it('requires the complete verified publication-state shape', () => {
    const parsed = parseZhihuPublishedArticleEvidence(
      publishedHtmlFor({ isVisible: undefined, isNormal: undefined }),
      POST_ID,
    )

    expect(decideZhihuPublishedEvidence(parsed, ACCOUNT_ID)).toMatchObject({
      outcome: 'REVIEW_REQUIRED',
      errorCode: 'ZHIHU_PUBLICATION_STATE_UNVERIFIED',
    })
  })

  it.each([
    [
      'a missing stable author ID',
      publishedHtmlFor({ author: {} }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_AUTHOR_ID_MISSING',
    ],
    [
      'an unverified publication state',
      publishedHtmlFor({ state: 'draft' }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLICATION_STATE_UNVERIFIED',
    ],
    [
      'an empty structured body',
      publishedHtmlFor({ content: '<p><br></p>' }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_ARTICLE_PAYLOAD_MISSING',
    ],
    [
      'an invalid publication timestamp',
      publishedHtmlFor({ created: 0 }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_PUBLISHED_AT_INVALID',
    ],
    [
      'invalid initial JSON',
      publishedHtmlFor({}, '{'),
      'PARSE_ERROR',
      'ZHIHU_PUBLIC_DETAIL_INVALID',
    ],
    [
      'a missing structured article entity',
      publishedHtmlFor(
        {},
        JSON.stringify({
          initialState: { entities: { articles: {} } },
        }),
      ),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_DETAIL_MISSING',
    ],
  ])('fails closed for %s', (_name, html, outcome, errorCode) => {
    const parsed = parseZhihuPublishedArticleEvidence(html, POST_ID)
    expect(decideZhihuPublishedEvidence(parsed, ACCOUNT_ID)).toMatchObject({
      outcome,
      errorCode,
    })
  })

  it('rejects a structurally valid article owned by another stable account', () => {
    const parsed = parseZhihuPublishedArticleEvidence(
      publishedHtmlFor({ author: { id: 'another-account' } }),
      POST_ID,
    )

    expect(decideZhihuPublishedEvidence(parsed, ACCOUNT_ID)).toMatchObject({
      outcome: 'ACCOUNT_MISMATCH',
      errorCode: 'ZHIHU_PUBLIC_AUTHOR_MISMATCH',
    })
  })
})

describe('Zhihu exact-ID publication inspector', () => {
  it('rejects a conflict between platformPostId and the draft URL before auth', async () => {
    const dependencies = createDependencies(vi.fn())
    const result = await inspectZhihuPublication(
      createRequest({
        draft: {
          platformPostId: POST_ID,
          draftUrl: 'https://zhuanlan.zhihu.com/p/2000000000000000002/edit',
          draftedAt: '2026-07-21T10:00:00+08:00',
        },
      }),
      dependencies,
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_POST_ID_CONFLICT',
    })
    expect(dependencies.checkAuth).not.toHaveBeenCalled()
  })

  it.each([
    [
      'non-numeric post ID',
      { platformPostId: 'post-1' },
      'ZHIHU_INVALID_POST_ID',
    ],
    ['non-editor URL', { draftUrl: PUBLIC_URL }, 'ZHIHU_INVALID_DRAFT_URL'],
    [
      'wrong host',
      { draftUrl: `https://example.com/p/${POST_ID}/edit` },
      'ZHIHU_INVALID_DRAFT_URL',
    ],
  ])('rejects %s', async (_name, draftOverride, errorCode) => {
    const dependencies = createDependencies(vi.fn())
    const result = await inspectZhihuPublication(
      createRequest({
        draft: {
          ...draftOverride,
          draftedAt: '2026-07-21T10:00:00+08:00',
        },
      }),
      dependencies,
    )

    expect(result[0]).toMatchObject({ outcome: 'PARSE_ERROR', errorCode })
    expect(dependencies.checkAuth).not.toHaveBeenCalled()
  })

  it('returns unsupported when neither exact ID anchor is available', async () => {
    const dependencies = createDependencies(vi.fn())
    const result = await inspectZhihuPublication(
      createRequest({
        draft: { draftedAt: '2026-07-21T10:00:00+08:00' },
      }),
      dependencies,
    )

    expect(result[0]).toMatchObject({
      outcome: 'UNSUPPORTED',
      errorCode: 'ZHIHU_POST_ID_REQUIRED',
    })
    expect(dependencies.checkAuth).not.toHaveBeenCalled()
  })

  it('recovers the exact ID from a verified draft URL', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(htmlResponse(200, PUBLIC_URL, publishedHtml))
    const result = await inspectZhihuPublication(
      createRequest({
        draft: {
          draftUrl: DRAFT_URL,
          draftedAt: '2026-07-21T10:00:00+08:00',
        },
      }),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PUBLISHED',
      platformPostId: POST_ID,
      canonicalUrl: PUBLIC_URL,
    })
  })

  it('requires the authenticated account to match exactly', async () => {
    const dependencies = createDependencies(vi.fn(), {
      isAuthenticated: true,
      userId: 'another-account',
    })
    const result = await inspectZhihuPublication(createRequest(), dependencies)

    expect(result[0]).toMatchObject({
      outcome: 'ACCOUNT_MISMATCH',
      errorCode: 'ACCOUNT_MISMATCH',
    })
    expect(dependencies.fetch).not.toHaveBeenCalled()
  })

  it.each([
    [{ isAuthenticated: false }, 'LOGIN_REQUIRED', 'ZHIHU_LOGIN_REQUIRED'],
    [
      { isAuthenticated: false, error: 'network failed' },
      'FETCH_ERROR',
      'ZHIHU_AUTH_CHECK_FAILED',
    ],
    [{ isAuthenticated: true }, 'PARSE_ERROR', 'ZHIHU_ACCOUNT_ID_MISSING'],
  ])('maps account result %# explicitly', async (auth, outcome, errorCode) => {
    const dependencies = createDependencies(vi.fn(), auth)
    const result = await inspectZhihuPublication(createRequest(), dependencies)

    expect(result[0]).toMatchObject({ outcome, errorCode })
    expect(dependencies.fetch).not.toHaveBeenCalled()
  })

  it('requires the exact current Zhihu soft-not-found title', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(
          200,
          PUBLIC_URL,
          softNotFoundHtml.replace(' - 知乎</title>', '</title>'),
        ),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_UNEXPECTED_PUBLIC_PAGE',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns PUBLISHED only when response URL and HTML identity agree', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(htmlResponse(200, PUBLIC_URL, publishedHtml))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result).toEqual([
      expect.objectContaining({
        outcome: 'PUBLISHED',
        source: 'PUBLIC_PAGE',
        platformPostId: POST_ID,
        canonicalUrl: PUBLIC_URL,
        title: '脱敏后的标题 & 版本',
        publishedAt: PUBLISHED_AT,
        bodyText: '第一段\n第二段',
        observedAt: NOW,
      }),
    ])
    expect(fetch).toHaveBeenCalledWith(
      PUBLIC_URL,
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'follow',
      }),
    )
  })

  it('accepts a matching og:url as the explicit public identity marker', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(
          200,
          PUBLIC_URL,
          publishedHtml.replace(
            `<link href="${PUBLIC_URL}" rel="canonical">`,
            '',
          ),
        ),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PUBLISHED',
      canonicalUrl: PUBLIC_URL,
    })
  })

  it('does not treat canonical metadata alone as a published article', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(
          200,
          PUBLIC_URL,
          `<meta property="og:url" content="${PUBLIC_URL}">`,
        ),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'REVIEW_REQUIRED',
      errorCode: 'ZHIHU_PUBLIC_DETAIL_MISSING',
    })
  })

  it.each([
    [
      'missing author ID',
      publishedHtmlFor({ author: {} }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_AUTHOR_ID_MISSING',
    ],
    [
      'foreign author ID',
      publishedHtmlFor({ author: { id: 'another-account' } }),
      'ACCOUNT_MISMATCH',
      'ZHIHU_PUBLIC_AUTHOR_MISMATCH',
    ],
    [
      'unverified publication state',
      publishedHtmlFor({ isVisible: false }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLICATION_STATE_UNVERIFIED',
    ],
    [
      'structured URL for another article',
      publishedHtmlFor({
        url: 'https://zhuanlan.zhihu.com/p/2000000000000000002',
      }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLICATION_STATE_UNVERIFIED',
    ],
    [
      'missing article content',
      publishedHtmlFor({ content: '' }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_ARTICLE_PAYLOAD_MISSING',
    ],
    [
      'invalid publication timestamp',
      publishedHtmlFor({ created: Number.POSITIVE_INFINITY }),
      'REVIEW_REQUIRED',
      'ZHIHU_PUBLIC_PUBLISHED_AT_INVALID',
    ],
  ])(
    'fails closed when structured public evidence has %s',
    async (_name, html, outcome, errorCode) => {
      const fetch = vi
        .fn()
        .mockResolvedValue(htmlResponse(200, PUBLIC_URL, html))
      const result = await inspectZhihuPublication(
        createRequest(),
        createDependencies(fetch),
      )

      expect(result[0]).toMatchObject({ outcome, errorCode })
      expect(result[0]).not.toHaveProperty('canonicalUrl')
    },
  )

  it('rejects a 2xx public page without canonical or og:url identity', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(200, PUBLIC_URL, '<html><h1>只有标题</h1></html>'),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_UNEXPECTED_PUBLIC_PAGE',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    [
      'an article element',
      softNotFoundHtml.replace(
        '</main>',
        '</main><article>contradictory content</article>',
      ),
    ],
    [
      'identity metadata',
      softNotFoundHtml.replace(
        '</head>',
        `<link rel="canonical" href="${PUBLIC_URL}"></head>`,
      ),
    ],
  ])('does not accept a soft-not-found title with %s', async (_name, body) => {
    const fetch = vi.fn().mockResolvedValue(htmlResponse(200, PUBLIC_URL, body))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_UNEXPECTED_PUBLIC_PAGE',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('rejects identity metadata for another article', async () => {
    const anotherUrl = 'https://zhuanlan.zhihu.com/p/2000000000000000002'
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(
          200,
          PUBLIC_URL,
          `<link rel="canonical" href="${anotherUrl}">`,
        ),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_UNEXPECTED_PUBLIC_PAGE',
    })
  })

  it('rejects a redirected 2xx page even when its HTML claims the expected ID', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(200, 'https://www.zhihu.com/', publishedHtml),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_UNEXPECTED_PUBLIC_PAGE',
    })
  })

  it.each([
    ['a hard 404', htmlResponse(404, PUBLIC_URL)],
    [
      'the strict Zhihu soft 404',
      htmlResponse(200, PUBLIC_URL, softNotFoundHtml),
    ],
  ])(
    'returns DRAFT_PRESENT after %s and an exact draft API response',
    async (_name, publicResponse) => {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(publicResponse)
        .mockResolvedValueOnce(jsonResponse(200, DRAFT_API_URL, draftPayload))
      const result = await inspectZhihuPublication(
        createRequest(),
        createDependencies(fetch),
      )

      expect(result[0]).toMatchObject({
        outcome: 'DRAFT_PRESENT',
        source: 'DRAFT_DETAIL',
        platformPostId: POST_ID,
        title: '脱敏草稿标题',
        bodyText: '草稿正文',
      })
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        DRAFT_API_URL,
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          redirect: 'error',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'x-requested-with': 'fetch',
          }),
        }),
      )
    },
  )

  it.each([
    [401, 'LOGIN_REQUIRED', 'ZHIHU_LOGIN_REQUIRED'],
    [403, 'FETCH_ERROR', 'ZHIHU_DRAFT_HTTP_403'],
    [429, 'FETCH_ERROR', 'ZHIHU_DRAFT_RATE_LIMITED'],
    [500, 'FETCH_ERROR', 'ZHIHU_DRAFT_HTTP_500'],
  ])('maps draft API HTTP %s to %s', async (status, outcome, errorCode) => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(htmlResponse(404, PUBLIC_URL))
      .mockResolvedValueOnce(jsonResponse(status, DRAFT_API_URL, {}))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({ outcome, errorCode })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('rejects draft JSON returned from an unexpected response URL', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(htmlResponse(404, PUBLIC_URL))
      .mockResolvedValueOnce(
        jsonResponse(
          200,
          `https://zhuanlan.zhihu.com/api/articles/${POST_ID}/redirected`,
          draftPayload,
        ),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_DRAFT_UNEXPECTED_RESPONSE_URL',
    })
  })

  it('returns a fetch error when the draft API request fails', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(htmlResponse(404, PUBLIC_URL))
      .mockRejectedValueOnce(new Error('offline'))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'FETCH_ERROR',
      errorCode: 'ZHIHU_DRAFT_FETCH_ERROR',
    })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('rejects a non-JSON draft API response before parsing it', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(htmlResponse(404, PUBLIC_URL))
      .mockResolvedValueOnce(
        jsonResponse(200, DRAFT_API_URL, draftPayload, 'text/html'),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_DRAFT_UNEXPECTED_CONTENT_TYPE',
    })
  })

  it('rejects invalid JSON from the draft API', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(htmlResponse(404, PUBLIC_URL))
      .mockResolvedValueOnce(
        htmlResponse(200, DRAFT_API_URL, '{', 'application/json'),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'PARSE_ERROR',
      errorCode: 'ZHIHU_DRAFT_JSON_INVALID',
    })
  })

  it.each([
    ['non-object payload', null, 'ZHIHU_DRAFT_RESPONSE_INVALID'],
    [
      'numeric ID',
      { ...draftPayload, id: Number(POST_ID) },
      'ZHIHU_DRAFT_ID_MISMATCH',
    ],
    [
      'different ID',
      { ...draftPayload, id: '2000000000000000002' },
      'ZHIHU_DRAFT_ID_MISMATCH',
    ],
    [
      'whitespace-padded ID',
      { ...draftPayload, id: ` ${POST_ID} ` },
      'ZHIHU_DRAFT_ID_MISMATCH',
    ],
    [
      'empty title',
      { ...draftPayload, title: '   ' },
      'ZHIHU_DRAFT_RESPONSE_INVALID',
    ],
    [
      'empty content',
      { ...draftPayload, content: '<p><br></p>' },
      'ZHIHU_DRAFT_RESPONSE_INVALID',
    ],
  ])('rejects draft API %s', async (_name, payload, errorCode) => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(htmlResponse(404, PUBLIC_URL))
      .mockResolvedValueOnce(jsonResponse(200, DRAFT_API_URL, payload))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({ outcome: 'PARSE_ERROR', errorCode })
  })

  it.each([
    ['a public hard 404', htmlResponse(404, PUBLIC_URL)],
    [
      'a public strict soft 404',
      htmlResponse(200, PUBLIC_URL, softNotFoundHtml),
    ],
  ])(
    'returns NOT_FOUND only after %s and a draft API 404',
    async (_name, publicResponse) => {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(publicResponse)
        .mockResolvedValueOnce(jsonResponse(404, DRAFT_API_URL, {}))
      const result = await inspectZhihuPublication(
        createRequest(),
        createDependencies(fetch),
      )

      expect(result[0]).toMatchObject({
        outcome: 'NOT_FOUND',
        source: 'DRAFT_DETAIL',
        platformPostId: POST_ID,
      })
      expect(fetch).toHaveBeenCalledTimes(2)
    },
  )

  it.each([
    [429, 'ZHIHU_RATE_LIMITED'],
    [403, 'ZHIHU_HTTP_403'],
    [500, 'ZHIHU_HTTP_500'],
  ])('maps HTTP %s to an explicit fetch error', async (status, errorCode) => {
    const fetch = vi.fn().mockResolvedValue(htmlResponse(status, PUBLIC_URL))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({ outcome: 'FETCH_ERROR', errorCode })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('maps a login redirect explicitly', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(200, 'https://www.zhihu.com/signin?next=%2Fp%2Fexample'),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'LOGIN_REQUIRED',
      errorCode: 'ZHIHU_LOGIN_REQUIRED',
    })
  })

  it('maps network failure explicitly without probing the editor', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('offline'))
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0]).toMatchObject({
      outcome: 'FETCH_ERROR',
      errorCode: 'ZHIHU_FETCH_ERROR',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('caps extracted body text at the observation contract limit', async () => {
    const longBody = '内'.repeat(50_010)
    const fetch = vi
      .fn()
      .mockResolvedValue(
        htmlResponse(200, PUBLIC_URL, publishedHtmlFor({ content: longBody })),
      )
    const result = await inspectZhihuPublication(
      createRequest(),
      createDependencies(fetch),
    )

    expect(result[0].bodyText).toHaveLength(50_000)
    expect(result[0].bodyTruncated).toBe(true)
  })
})
