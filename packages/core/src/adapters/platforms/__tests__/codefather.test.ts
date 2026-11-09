import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createContext, runInContext } from 'node:vm'
import type { RuntimeInterface } from '../../../runtime/interface'
import type { Article } from '../../../types'
import { CodefatherAdapter } from '../codefather'

const SITE = 'https://www.codefather.cn'
const article: Article = { title: '测试文章', markdown: '# 内容\n\n```ts\nconst a = 1\n```', summary: '摘要', tags: ['编程'] }

const fetchMock = vi.fn()
const runtime = { type: 'extension', fetch: fetchMock } as unknown as RuntimeInterface

function browserRuntime() {
  const storage = new Map<string, string>()
  const location = { origin: SITE, href: `${SITE}/`, assign: vi.fn() }
  const context = createContext({
    location,
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
    },
    Date, JSON,
  })
  const tabs = {
    query: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 123 }),
    waitForLoad: vi.fn().mockResolvedValue(undefined),
    executeScript: vi.fn(async (_id: number, fn: (...args: unknown[]) => unknown, args: unknown[]) => {
      // 扩展运行时读取 InjectionResult.result，不把页面异常当作调用方异常。
      context.args = args
      try { return runInContext(`(${fn.toString()})(...args)`, context) } catch { return undefined }
    }),
  }
  return { runtime: { ...runtime, tabs } as unknown as RuntimeInterface, storage, tabs, location }
}

describe('编程导航适配器', () => {
  beforeEach(() => { vi.resetAllMocks() })

  it('平台显示名称保持为编程导航', () => {
    expect(new CodefatherAdapter().meta.name).toBe('编程导航')
  })

  it('通过实际登录接口识别用户', async () => {
    const adapter = new CodefatherAdapter()
    await adapter.init(runtime)
    fetchMock.mockResolvedValue(Response.json({
      code: 0,
      data: { id: '99840012512', userName: '测试用户', userAvatar: 'https://pic.code-nav.cn/avatar.png' },
    }))
    expect(await adapter.checkAuth()).toEqual({
      isAuthenticated: true, userId: '99840012512', username: '测试用户', avatar: 'https://pic.code-nav.cn/avatar.png',
    })
    expect(fetchMock).toHaveBeenCalledWith('https://api.codefather.cn/api/user/get/login', expect.objectContaining({ credentials: 'include' }))
  })

  it('只写入站点兼容的本地草稿并打开编辑器，不调用发布接口', async () => {
    const browser = browserRuntime()
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const before = Date.now()
    const result = await adapter.publish(article, { draftOnly: false })
    expect(result).toMatchObject({ platform: 'codefather', success: true, draftOnly: true, postUrl: `${SITE}/add/passage` })
    expect(result.postId).toBeUndefined()
    expect(result.message).toContain('本地')
    expect(result.message).not.toMatch(/[()（）]/)
    const cache = JSON.parse(browser.storage.get('add_post')!)
    expect(cache.value).toEqual({ title: article.title, content: article.markdown, description: article.summary, tags: article.tags })
    expect(cache.expires).toBeGreaterThanOrEqual(before + 86400000)
    expect(cache.expires).toBeLessThanOrEqual(Date.now() + 86400000)
    expect(browser.location.assign).toHaveBeenCalledWith(`${SITE}/add/passage`)
    expect(fetchMock.mock.calls.every(([url, options]) => url.endsWith('/api/user/get/login') && options.method === 'GET')).toBe(true)
  })

  it('add_post 被用户清成空字符串后仍可同步', async () => {
    const browser = browserRuntime()
    browser.storage.set('add_post', '')
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const result = await adapter.publish(article)
    expect(result, result.error).toMatchObject({ success: true, draftOnly: true })
    expect(JSON.parse(browser.storage.get('add_post')!).value.content).toBe(article.markdown)
    expect(browser.location.assign).toHaveBeenCalledWith(`${SITE}/add/passage`)
  })

  it('正文已清空时允许同步，不受 expires 和其他字段影响', async () => {
    const browser = browserRuntime()
    browser.storage.set('add_post', JSON.stringify({ value: { title: '旧标题', content: '', extra: '其他字段' }, expires: Date.now() + 86400000 }))
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const result = await adapter.publish(article)
    expect(result, result.error).toMatchObject({ success: true, draftOnly: true })
    expect(JSON.parse(browser.storage.get('add_post')!).value.content).toBe(article.markdown)
  })

  it.each(['已有本地草稿', '存储空间不足'])('页面错误通过执行结果返回具体原因：%s', async expected => {
    const browser = browserRuntime()
    if (expected === '已有本地草稿') {
      browser.storage.set('add_post', JSON.stringify({ value: { title: '不能覆盖', content: '已有正文' }, expires: null }))
    } else {
      vi.spyOn(browser.storage, 'set').mockImplementation(() => { throw new Error(expected) })
    }
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const result = await adapter.publish(article)
    expect(result.success).toBe(false)
    expect(result.error).toContain(expected)
    expect(browser.location.assign).not.toHaveBeenCalled()
  })

  it('页面脚本没有返回结果时明确提示，而非谎称写入校验失败', async () => {
    const browser = browserRuntime()
    browser.tabs.executeScript.mockResolvedValue(undefined)
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const result = await adapter.publish(article)
    expect(result.success).toBe(false)
    expect(result.error).toContain('页面脚本未返回结果')
  })

  it.each([
    JSON.stringify({ value: { content: '不能丢' }, expires: Date.now() + 86400000 }),
    JSON.stringify({ value: { content: '不能丢' }, expires: 1 }),
    JSON.stringify({ value: { content: '不能丢' }, expires: null }),
    JSON.stringify({ value: { content: '不能丢' } }),
  ])('只要正文有内容就拒绝覆盖，与 expires 无关：%s', async raw => {
    const browser = browserRuntime()
    browser.storage.set('add_post', raw)
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const result = await adapter.publish(article)
    expect(result.success).toBe(false)
    expect(result.error).toContain('草稿')
    expect(browser.storage.get('add_post')).toBe(raw)
    expect(browser.location.assign).not.toHaveBeenCalled()
  })

  it('已有编辑器打开时拒绝同步，保护尚未写入缓存的内容', async () => {
    const browser = browserRuntime()
    browser.tabs.query.mockResolvedValue([{ id: 5, url: `${SITE}/add/passage` }])
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    const result = await adapter.publish(article)
    expect(result.success).toBe(false)
    expect(browser.tabs.create).not.toHaveBeenCalled()
    expect(browser.storage.size).toBe(0)
  })

  it.each(['upload', 'load'])('图片处理或页面加载期间打开编辑器时，写缓存前再次拒绝同步：%s', async stage => {
    const browser = browserRuntime()
    let editorOpened = false
    browser.tabs.query.mockImplementation(async () => editorOpened ? [{ id: 5, url: `${SITE}/add/passage` }] : [])
    browser.tabs.waitForLoad.mockImplementation(async () => { if (stage === 'load') editorOpened = true })
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/api/user/get/login')) return Response.json({ code: 0, data: { id: '123' } })
      if (stage === 'upload') editorOpened = true
      return Response.json({ code: 0, data: 'https://pic.code-nav.cn/post_picture/test.png' })
    })
    const result = await adapter.publish({ title: '竞态保护', markdown: '![图](https://example.com/a.png)' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('编辑器')
    expect(browser.tabs.query).toHaveBeenCalledTimes(2)
    expect(browser.storage.size).toBe(0)
    expect(browser.tabs.executeScript).not.toHaveBeenCalled()
    expect(browser.location.assign).not.toHaveBeenCalled()
  })

  it('按真实 multipart 协议上传正文图片', async () => {
    const adapter = new CodefatherAdapter()
    await adapter.init(runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: 'https://pic.code-nav.cn/post_picture/test.png' }))
    const file = new Blob(['image'], { type: 'image/png' })
    expect(await adapter.uploadImage(file, '测试.png')).toBe('https://pic.code-nav.cn/post_picture/test.png')
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.codefather.cn/api/file/upload?biz=post_picture&compress=true')
    expect(options).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('file').name).toBe('测试.png')
    expect(new Headers(options.headers).has('Content-Type')).toBe(false)
  })

  it('通过真实外链转存接口替换正文图片链接', async () => {
    const browser = browserRuntime()
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockImplementation(async (url: string) => Response.json(url.endsWith('/api/user/get/login')
      ? { code: 0, data: { id: '123' } }
      : { code: 0, data: 'https://pic.code-nav.cn/post_picture/test.png' }))
    const markdown = '![说明](https://example.com/a.png)'
    const progress = vi.fn()
    const result = await adapter.publish({ title: '图片稿', markdown }, { onImageProgress: progress })
    expect(result.success).toBe(true)
    expect(JSON.parse(browser.storage.get('add_post')!).value.content).toBe('![说明](https://pic.code-nav.cn/post_picture/test.png)')
    expect(fetchMock).toHaveBeenCalledWith('https://api.codefather.cn/api/file/url/upload', expect.objectContaining({
      method: 'POST', credentials: 'include', body: JSON.stringify({ biz: 'post_picture', compress: true, url: 'https://example.com/a.png' }),
    }))
    expect(progress).toHaveBeenCalledWith(1, 1)
  })

  it.each([
    { code: 40100, message: '未登录' },
    { code: 0 },
  ])('拒绝将图片业务错误或空 URL 当作成功：%s', async response => {
    const adapter = new CodefatherAdapter()
    await adapter.init(runtime)
    fetchMock.mockResolvedValue(Response.json(response))
    await expect(adapter.uploadImage(new Blob(['image']))).rejects.toThrow()
  })

  it.each([
    { code: 40100, message: '未登录' },
    { code: 0, data: {} },
    { code: 40500, data: { id: '123' }, message: '账号不可用' },
  ])('登录业务状态不是有效用户时不打开页面：%s', async response => {
    const browser = browserRuntime()
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockImplementation(async () => Response.json(response))
    expect((await adapter.checkAuth()).isAuthenticated).toBe(false)
    expect((await adapter.publish(article)).success).toBe(false)
    expect(browser.tabs.create).not.toHaveBeenCalled()
  })

  it('旧稿没有正文时允许同步，但保留其他站点缓存', async () => {
    const browser = browserRuntime()
    browser.storage.set('add_post', JSON.stringify({ value: { title: '过期' }, expires: Date.now() - 1000 }))
    browser.storage.set('edit-post-123', '已有文章的编辑缓存')
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    expect((await adapter.publish(article)).success).toBe(true)
    expect(JSON.parse(browser.storage.get('add_post')!).value.title).toBe(article.title)
    expect(browser.storage.get('edit-post-123')).toBe('已有文章的编辑缓存')
  })

  it('图片转存失败时保留原链接并提示人工检查', async () => {
    const browser = browserRuntime()
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockImplementation(async (url: string) => Response.json(url.endsWith('/api/user/get/login')
      ? { code: 0, data: { id: '123' } }
      : { code: 50000, message: '转存失败' }))
    const markdown = '![图](https://example.com/a.png)'
    const result = await adapter.publish({ title: '图片稿', markdown })
    expect(result.success).toBe(true)
    expect(result.message).toContain('1 张图片转存失败')
    expect(JSON.parse(browser.storage.get('add_post')!).value.content).toBe(markdown)
  })

  it('页面被重定向到其他域名时不写缓存', async () => {
    const browser = browserRuntime()
    browser.location.origin = 'https://example.com'
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    expect((await adapter.publish(article)).success).toBe(false)
    expect(browser.storage.size).toBe(0)
  })

  it('不支持 tabs 的运行时明确失败而不发文', async () => {
    const adapter = new CodefatherAdapter()
    await adapter.init(runtime)
    const result = await adapter.publish(article)
    expect(result.success).toBe(false)
    expect(result.error).toContain('浏览器扩展')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['auth', 'upload'])('API 失败后清理动态请求头规则：%s', async action => {
    const headerRules = { add: vi.fn().mockResolvedValue('rule_1'), remove: vi.fn(), clear: vi.fn() }
    const adapter = new CodefatherAdapter()
    await adapter.init({ ...runtime, headerRules })
    fetchMock.mockRejectedValue(new Error('网络不可用'))
    if (action === 'auth') expect((await adapter.checkAuth()).isAuthenticated).toBe(false)
    else await expect(adapter.uploadImage(new Blob(['image']))).rejects.toThrow('网络不可用')
    expect(headerRules.remove).toHaveBeenCalledWith('rule_1')
  })

  it.each([{ title: '', markdown: '正文' }, { title: '标题', markdown: '  ' }, { title: '长'.repeat(101), markdown: '正文' }])('拒绝无效标题或正文：%s', async invalid => {
    const browser = browserRuntime()
    const adapter = new CodefatherAdapter()
    await adapter.init(browser.runtime)
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: '123' } }))
    expect((await adapter.publish(invalid)).success).toBe(false)
    expect(browser.tabs.create).not.toHaveBeenCalled()
  })
})
