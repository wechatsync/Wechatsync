import { afterEach, describe, expect, it, vi } from 'vitest'
import { WeixinAdapter } from '../weixin'
import { BilibiliAdapter } from '../bilibili'

// Fake runtime and network only; never accesses a browser session or saves a real draft.
afterEach(() => vi.unstubAllGlobals())

function weixin() {
  const adapter = new WeixinAdapter()
  Object.assign(adapter, { weixinMeta: {
    token: 'test', userName: 'test', ticket: 'test', svrTime: 1,
  } })
  return adapter as any
}

describe('WeChat draft metadata and code', () => {
  it('preserves dollar variables, underscores and formula-like text inside code', () => {
    const adapter = weixin()
    const code = '<pre><code>$secure_key = $local_key\n$x_{1}$</code></pre>'
    const inline = '<code>$x_{2}$</code>'
    const result = adapter.processLatex(code + inline + '<p>$x_{3}$</p>')
    expect(result).toContain(code)
    expect(result).toContain(inline)
    expect(result.match(/latex.codecogs.com/g)).toHaveLength(1)
  })

  it('keeps code line breaks explicit in the HTML sent to the editor', () => {
    expect(weixin().processContent('<pre><code>a\r\nb\nc</code></pre>'))
      .toMatch(/a<br\s*\/?\s*>b<br\s*\/?\s*>c/)
  })

  it.each(['fileid', 'file_id', 'content'])('keeps the upload material ID from %s', async field => {
    const adapter = weixin()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('image')))
    adapter.runtime = { fetch: vi.fn(async () => new Response(JSON.stringify({
      cdn_url: 'https://mmbiz.qpic.cn/fixture.png', [field]: '42', base_resp: { err_msg: 'ok', ret: 0 },
    }))) }
    const result = await adapter.uploadImageByUrl('https://example.com/image.png')
    expect(result.attrs.fileid).toBe('42')
  })

  it('binds the uploaded cover and the supplied author to the draft', async () => {
    const adapter = weixin()
    adapter.withHeaderRules = (_: unknown, run: () => unknown) => run()
    adapter.processImages = async (html: string) => html
    adapter.uploadImageByUrl = vi.fn(async () => ({ url: 'https://mmbiz.qpic.cn/cover.png', attrs: { fileid: '42' } }))
    let payload: URLSearchParams | undefined
    adapter.runtime = { fetch: vi.fn(async (_: string, options: RequestInit) => {
      payload = options.body as URLSearchParams
      return new Response(JSON.stringify({ appMsgId: 123, base_resp: { ret: 0 } }))
    }) }
    await adapter.publish({ title: 'Fixture', html: '<p>Body</p>', cover: 'https://example.com/cover.png', author: 'Example' })
    expect(payload?.get('author0')).toBe('Example')
    expect(payload?.get('fileid0')).toBe('42')
    expect(payload?.get('cdn_url0')).toBe('https://mmbiz.qpic.cn/cover.png')
    expect(payload?.get('show_cover_pic0')).toBe('1')
  })

  it('does not create a draft when an explicitly supplied cover fails to upload', async () => {
    const adapter = weixin()
    adapter.withHeaderRules = (_: unknown, run: () => unknown) => run()
    adapter.processImages = async (html: string) => html
    adapter.uploadImageByUrl = vi.fn(async () => { throw new Error('cover failed') })
    adapter.runtime = { fetch: vi.fn() }
    await expect(adapter.publish({ title: 'Fixture', html: '<p>Body</p>', cover: 'https://example.com/cover.png' })).resolves.toMatchObject({ success: false, error: 'cover failed' })
    expect(adapter.runtime.fetch).not.toHaveBeenCalled()
  })
})

describe('Bilibili direct image upload', () => {
  it('sends the uploaded cover URL without changing originality or visibility defaults', async () => {
    const adapter = new BilibiliAdapter() as any
    adapter.userInfo = { mid: 1 }
    adapter.csrf = 'test'
    adapter.withHeaderRules = (_: unknown, run: () => unknown) => run()
    adapter.processImages = async (html: string) => html
    adapter.uploadImageByUrl = vi.fn(async () => ({ url: 'https://example.com/uploaded-cover.png' }))
    adapter.postForm = vi.fn(async () => ({ code: 0, data: { aid: 123 } }))
    const result = await adapter.publish({ title: 'Fixture', html: '<p>Body</p>', cover: 'https://example.com/cover.png' })
    expect(result.success).toBe(true)
    const payload = adapter.postForm.mock.calls[0][1]
    expect(payload.image_urls).toBe('https://example.com/uploaded-cover.png')
    expect(payload).not.toHaveProperty('original')
    expect(payload).not.toHaveProperty('private_pub')
  })

  it('initializes login metadata and applies header rules before the upload request', async () => {
    const adapter = new BilibiliAdapter() as any
    const events: string[] = []
    adapter.checkAuth = async () => { events.push('auth'); adapter.csrf = 'test'; return { isAuthenticated: true } }
    adapter.withHeaderRules = async (_: unknown, run: () => unknown) => { events.push('headers'); return run() }
    adapter.blobToDataUri = async () => 'data:image/png;base64,ZmFrZQ=='
    adapter.uploadImageByUrl = async () => { events.push('upload'); return { url: 'https://example.com/uploaded.png' } }
    await adapter.uploadImage(new Blob(['fixture']))
    expect(events).toEqual(['auth', 'headers', 'upload'])
  })

  it('rejects logged-out direct uploads before requesting the image endpoint', async () => {
    const adapter = new BilibiliAdapter() as any
    adapter.checkAuth = async () => ({ isAuthenticated: false })
    adapter.withHeaderRules = vi.fn()
    await expect(adapter.uploadImage(new Blob(['fixture']))).rejects.toThrow('请先登录B站')
    expect(adapter.withHeaderRules).not.toHaveBeenCalled()
  })

  it('reports an HTML verification response without exposing its body', async () => {
    const adapter = new BilibiliAdapter() as any
    adapter.csrf = 'test'
    vi.stubGlobal('fetch', vi.fn(async () => new Response('image')))
    adapter.runtime = { fetch: async () => new Response('<html>private verification details</html>', {
      status: 403, headers: { 'content-type': 'text/html' },
    }) }
    await expect(adapter.uploadImageByUrl('https://example.com/image.png'))
      .rejects.toThrow('HTTP 403，text/html')
  })
})
