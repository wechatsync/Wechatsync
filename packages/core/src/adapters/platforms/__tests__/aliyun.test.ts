import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AliyunAdapter } from '../aliyun'
import type { RuntimeInterface } from '../../../runtime/interface'
import type { Article, HeaderRule } from '../../../types'

const origin = 'https://developer.aliyun.com'
const editorHtml = `<script>var GLOBAL_CONFIG = {
  "csrf_key": 'p_csrf', "csrf_val": 'test-csrf', "groupCode": null
};</script>`
const article: Article = {
  title: '中文标题',
  markdown:
    '# 标题\n\n- 列表\n\n```java\nint x = 1;\n```\n\n| 项目 | 数值 |\n| --- | --- |\n| CTR | 0.25 |\n\n$p=\\frac{c}{v}$\n\n$$E=mc^2$$',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function createRuntime() {
  let nextAid = 100
  const fetch = vi.fn(async (url: string, options?: RequestInit): Promise<Response> => {
    const path = new URL(url).pathname
    if (path.endsWith('/getUser'))
      return json({ success: true, data: { uccId: 'test-user', nickname: '测试用户', avatar: '' } })
    if (path === '/article/new') return new Response(editorHtml)
    if (path.endsWith('/getImageUploadUrl'))
      return json({
        success: true,
        data: {
          uploadUrl: 'https://test-bucket.oss-cn-hangzhou.aliyuncs.com/test.png?signature=test',
          imageUrl: 'https://ucc.alicdn.com/test.png',
          header: { 'content-type': 'image/png', 'x-oss-meta-author': 'test-author' },
        },
      })
    if (options?.method === 'PUT') return new Response(null, { status: 200 })
    if (path.endsWith('/putDraft')) return json({ success: true, data: { aid: nextAid++ } })
    if (url === 'https://example.com/image.png')
      return new Response(new Uint8Array([137, 80, 78, 71]), {
        headers: { 'Content-Type': 'image/png' },
      })
    throw new Error('Unexpected test request: ' + path)
  })
  const headerRules = {
    add: vi.fn(async (_rule: HeaderRule) => 'rule-test'),
    remove: vi.fn(async (_id: string) => {}),
    clear: vi.fn(async () => {}),
  }
  const runtime = { type: 'extension', fetch, headerRules } as unknown as RuntimeInterface
  return { runtime, fetch, headerRules }
}

describe('AliyunAdapter', () => {
  let adapter: AliyunAdapter
  let port: ReturnType<typeof createRuntime>
  beforeEach(async () => {
    adapter = new AliyunAdapter()
    port = createRuntime()
    await adapter.init(port.runtime)
  })

  it('读取社区用户身份', async () => {
    expect(await adapter.checkAuth()).toMatchObject({
      isAuthenticated: true,
      userId: 'test-user',
      username: '测试用户',
    })
  })

  it('未登录时不创建草稿', async () => {
    port.fetch.mockResolvedValue(
      json({ success: false, code: '40001', message: '用户未登录或登录已失效' })
    )
    expect(await adapter.checkAuth()).toMatchObject({ isAuthenticated: false })
    await expect(adapter.publish(article)).rejects.toThrow('登录')
    expect(port.fetch.mock.calls.some(([url]) => url.includes('putDraft'))).toBe(false)
    expect(port.headerRules.remove).toHaveBeenCalledWith('rule-test')
  })

  it('每次新建 Markdown 草稿并返回编辑链接，保留公式和代码', async () => {
    const first = await adapter.publish(article, { draftOnly: false })
    const second = await adapter.publish(article)
    expect(first).toMatchObject({
      success: true,
      draftOnly: true,
      postId: '100',
      postUrl: `${origin}/article/new?edit=100`,
    })
    expect(second.postId).toBe('101')
    const saves = port.fetch.mock.calls.filter(([url]) => url.includes('putDraft'))
    expect(saves).toHaveLength(2)
    for (const [url, options] of saves) {
      expect(new URL(url).searchParams.get('p_csrf')).toBe('test-csrf')
      expect(options).toMatchObject({ method: 'POST', credentials: 'include' })
      expect(JSON.parse(options!.body as string)).toMatchObject({
        title: article.title,
        content: article.markdown,
        aid: null,
        format: null,
        contentRender: '',
      })
    }
    expect(port.headerRules.remove).toHaveBeenCalledTimes(2)
  })

  it('重复图片只上传一次，全部替换后再保存', async () => {
    const progress = vi.fn()
    await adapter.publish(
      {
        ...article,
        markdown: '![a](https://example.com/image.png)\n![b](https://example.com/image.png)',
      },
      { onImageProgress: progress }
    )
    const uploads = port.fetch.mock.calls.filter(([, options]) => options?.method === 'PUT')
    expect(uploads).toHaveLength(1)
    expect(uploads[0][1]?.body).toBeInstanceOf(Blob)
    expect(uploads[0][1]?.headers).toMatchObject({
      'content-type': 'image/png',
      'x-oss-meta-author': 'test-author',
    })
    const save = port.fetch.mock.calls.find(([url]) => url.includes('putDraft'))!
    expect(JSON.parse(save[1]!.body as string).content).toBe(
      '![a](https://ucc.alicdn.com/test.png)\n![b](https://ucc.alicdn.com/test.png)'
    )
    expect(progress).toHaveBeenCalled()
  })

  it.each(['download', 'credentials', 'upload'])(
    '图片 %s 失败时不保存草稿并清理规则',
    async (phase) => {
      const normalFetch = port.fetch.getMockImplementation()!
      port.fetch.mockImplementation(async (url, options) => {
        if (phase === 'download' && url.startsWith('https://example.com/'))
          return new Response('not found', { status: 404 })
        if (phase === 'credentials' && url.includes('getImageUploadUrl'))
          return json({ success: false, message: 'upload denied' })
        if (phase === 'upload' && options?.method === 'PUT')
          return new Response('denied', { status: 403 })
        return normalFetch(url, options)
      })
      await expect(
        adapter.publish({ ...article, markdown: '![a](https://example.com/image.png)' })
      ).rejects.toThrow('图片')
      expect(port.fetch.mock.calls.some(([url]) => url.includes('putDraft'))).toBe(false)
      expect(port.headerRules.remove).toHaveBeenCalledWith('rule-test')
    }
  )

  it.each([
    { success: false, message: '草稿保存失败' },
    { success: true, data: {} },
    { success: true, data: { aid: 0 } },
  ])('不把异常草稿响应报告为成功 %#', async (body) => {
    const normalFetch = port.fetch.getMockImplementation()!
    port.fetch.mockImplementation((url, options) =>
      url.includes('putDraft') ? Promise.resolve(json(body)) : normalFetch(url, options)
    )
    await expect(adapter.publish(article)).rejects.toThrow('草稿')
  })

  it('编辑页缺少 CSRF 时停止，不把 HTML 登录页当作配置', async () => {
    const normalFetch = port.fetch.getMockImplementation()!
    port.fetch.mockImplementation((url, options) =>
      url.endsWith('/article/new')
        ? Promise.resolve(new Response('<html>登录</html>'))
        : normalFetch(url, options)
    )
    await expect(adapter.publish(article)).rejects.toThrow('CSRF')
    expect(port.fetch.mock.calls.some(([url]) => url.includes('putDraft'))).toBe(false)
  })

  it('不上传或改写代码块、行内代码和转义文字中的图片示例', async () => {
    const markdown =
      '```markdown\n![example](https://example.com/image.png)\n```\n\n`![inline](https://example.com/image.png)`\n\n\\![escaped](https://example.com/image.png)'
    await adapter.publish({ ...article, markdown })
    const save = port.fetch.mock.calls.find(([url]) => url.includes('putDraft'))!
    expect(JSON.parse(save[1]!.body as string).content).toBe(markdown)
    expect(port.fetch.mock.calls.some(([url]) => url === 'https://example.com/image.png')).toBe(
      false
    )
  })

  it('转存引用式图片和合法 HTML 图片，保留普通链接及图片属性', async () => {
    const markdown =
      '![图][pic]\n\n[普通链接][pic]\n\n[pic]: https://example.com/image.png "说明"\n\n<img src=\'https://example.com/image.png\' alt="说明" width="64">\n<img src=https://example.com/image.png>'
    await adapter.publish({ ...article, markdown })
    const save = port.fetch.mock.calls.find(([url]) => url.includes('putDraft'))!
    const content = JSON.parse(save[1]!.body as string).content
    expect(content).toContain('![图](https://ucc.alicdn.com/test.png "说明")')
    expect(content).toContain('[pic]: https://example.com/image.png "说明"')
    expect(content).toContain('alt="说明"')
    expect(content).toContain('width="64"')
    expect(content.match(/https:\/\/ucc\.alicdn\.com\/test\.png/g)).toHaveLength(3)
    expect(port.fetch.mock.calls.filter(([, options]) => options?.method === 'PUT')).toHaveLength(1)
  })

  it('HTML 注释里的图片不上传', async () => {
    const markdown = '<!-- <img src="https://example.com/image.png"> -->'
    await adapter.publish({ ...article, markdown })
    expect(port.fetch.mock.calls.some(([url]) => url === 'https://example.com/image.png')).toBe(
      false
    )
  })

  it('协议相对图片使用 HTTPS 下载', async () => {
    await adapter.publish({ ...article, markdown: '![图](//example.com/image.png)' })
    expect(port.fetch.mock.calls.some(([url]) => url === 'https://example.com/image.png')).toBe(
      true
    )
    expect(port.fetch.mock.calls.some(([url]) => url.startsWith('//'))).toBe(false)
  })

  it('相对图片基于来源文章 URL 解析', async () => {
    await adapter.publish({
      ...article,
      markdown: '![图](/image.png)',
      source: { url: 'https://example.com/posts/article', platform: 'web' },
    })
    expect(port.fetch.mock.calls.some(([url]) => url === 'https://example.com/image.png')).toBe(
      true
    )
  })

  it('并发同步只清理自身 Header 规则', async () => {
    const active = new Set<string>()
    let nextRule = 0
    port.headerRules.add.mockImplementation(async () => {
      const id = `rule-${nextRule++}`
      active.add(id)
      return id
    })
    port.headerRules.remove.mockImplementation(async (id) => {
      active.delete(id)
    })
    let release!: () => void
    let entered!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const downloading = new Promise<void>((resolve) => {
      entered = resolve
    })
    const normalFetch = port.fetch.getMockImplementation()!
    const rulesDuringWrites: number[] = []
    port.fetch.mockImplementation(async (url, options) => {
      if (url === 'https://example.com/image.png') {
        entered()
        await gate
      }
      if (options?.method === 'POST') rulesDuringWrites.push(active.size)
      return normalFetch(url, options)
    })
    const slow = adapter.publish({ ...article, markdown: '![图](https://example.com/image.png)' })
    await downloading
    await adapter.publish(article)
    const remaining = active.size
    release()
    await slow
    expect(remaining).toBe(1)
    expect(rulesDuringWrites.every((count) => count > 0)).toBe(true)
    expect(active.size).toBe(0)
  })
})
