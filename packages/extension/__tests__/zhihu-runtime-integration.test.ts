import { afterEach, describe, expect, it, vi } from 'vitest'

import { ZhihuAdapter } from '../../core/src/adapters/platforms/zhihu'
import type { PublicationInspectRequest } from '@wechatsync/core/publication-inspection'
import { ExtensionRuntime } from '../src/runtime/extension'

const POST_ID = '2000000000000000001'
const ACCOUNT_ID = 'account-zhihu'
const PUBLIC_URL = `https://zhuanlan.zhihu.com/p/${POST_ID}`
const DRAFT_API_URL = `https://zhuanlan.zhihu.com/api/articles/${POST_ID}/draft`

const request: PublicationInspectRequest = {
  requestId: 'runtime-integration-1',
  platform: 'zhihu',
  externalAccountId: ACCOUNT_ID,
  draft: {
    platformPostId: POST_ID,
    draftUrl: `${PUBLIC_URL}/edit`,
    draftedAt: '2026-07-21T10:00:00+08:00',
  },
  articleHint: { title: 'A trusted publication sample' },
  limit: 20,
}

const publishedHtml = `
  <html>
    <head>
      <link href="${PUBLIC_URL}" rel="canonical">
      <meta content="${PUBLIC_URL}" property="og:url">
      <script type="text/json" id="js-initialData">${JSON.stringify({
        initialState: {
          entities: {
            articles: {
              [POST_ID]: {
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
                title: 'A trusted publication sample',
                content: '<p>Published body</p>',
              },
            },
          },
        },
      })}</script>
    </head>
    <body><article><p>Published body</p></article></body>
  </html>
`

function jsonResponse(url: string, payload: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    url,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  } as Response
}

function htmlResponse(url: string, body: string, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    url,
    headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    text: async () => body,
  } as Response
}

async function inspectWith(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fetchMock)
  const adapter = new ZhihuAdapter()
  await adapter.init(new ExtensionRuntime())
  return adapter.inspectPublication(request)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ZhihuAdapter with ExtensionRuntime', () => {
  it('uses authentication for identity but anonymous credentials for public evidence', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === 'https://www.zhihu.com/api/v4/me') {
        return jsonResponse(url, { id: ACCOUNT_ID, name: 'Zhihu Creator' })
      }
      if (url === PUBLIC_URL) return htmlResponse(url, publishedHtml)
      throw new Error(`Unexpected request: ${url}`)
    })

    const observations = await inspectWith(fetchMock)

    expect(observations).toHaveLength(1)
    expect(observations[0]).toMatchObject({
      outcome: 'PUBLISHED',
      platformPostId: POST_ID,
      canonicalUrl: PUBLIC_URL,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.zhihu.com/api/v4/me',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      PUBLIC_URL,
      expect.objectContaining({ credentials: 'omit' }),
    )
  })

  it('does not classify an owner-only page as publicly published', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === 'https://www.zhihu.com/api/v4/me') {
        return jsonResponse(url, { id: ACCOUNT_ID, name: 'Zhihu Creator' })
      }
      if (url === PUBLIC_URL) {
        return options?.credentials === 'include'
          ? htmlResponse(url, publishedHtml)
          : htmlResponse(url, '', 404)
      }
      if (url === DRAFT_API_URL) return jsonResponse(url, {}, 404)
      throw new Error(`Unexpected request: ${url}`)
    })

    const observations = await inspectWith(fetchMock)

    expect(observations).toHaveLength(1)
    expect(observations[0].outcome).not.toBe('PUBLISHED')
    expect(fetchMock).toHaveBeenCalledWith(
      PUBLIC_URL,
      expect.objectContaining({ credentials: 'omit' }),
    )
  })
})
