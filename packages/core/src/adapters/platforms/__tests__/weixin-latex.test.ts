import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RuntimeInterface } from '../../../runtime/interface'
import { WeixinAdapter } from '../weixin'

afterEach(() => vi.unstubAllGlobals())

describe('WeixinAdapter LaTeX', () => {
  it.each([
    {
      html: String.raw`<p>$$\text{MMR}=\&gt;\mathrm{*}\&gt;arg$$</p>`,
      latex: String.raw`\text{MMR}=\>\mathrm{*}\>arg`,
    },
    {
      html: String.raw`<p>$x_1&#x3c;x_2\ &alpha;\ \text{&amp;gt;}$</p>`,
      latex: String.raw`x_1<x_2\ α\ \text{&gt;}`,
    },
  ])('发送公式文本给图片渲染器（$html）', async ({ html, latex }) => {
    const downloadImage = vi.fn(async (_url: string) => new Response('image'))
    vi.stubGlobal('fetch', downloadImage)
    const adapter = new WeixinAdapter()
    await adapter.init({
      type: 'extension',
      async fetch(url, options) {
        const path = new URL(url).pathname
        if (path === '/' && options?.method === 'GET') {
          return new Response(`data: { t: 'test-token' }`)
        }
        if (path === '/cgi-bin/filetransfer' && options?.method === 'POST') {
          return Response.json({ base_resp: { err_msg: 'ok' }, cdn_url: 'https://mmbiz.qpic.cn/test.png' })
        }
        if (path === '/cgi-bin/operate_appmsg' && options?.method === 'POST') {
          return Response.json({ appMsgId: 'test-draft' })
        }
        throw new Error(`Unexpected test request: ${path}`)
      },
    } as RuntimeInterface)

    const result = await adapter.publish({ title: '公式测试', html })

    expect(result).toMatchObject({ success: true, postId: 'test-draft' })
    expect(downloadImage).toHaveBeenCalledOnce()
    const [renderUrl] = downloadImage.mock.calls[0]
    const query = renderUrl.slice(renderUrl.indexOf('?') + 1)
    expect(decodeURIComponent(query).replace(/^\\dpi\{\d+\}/, '')).toBe(latex)
  })
})
