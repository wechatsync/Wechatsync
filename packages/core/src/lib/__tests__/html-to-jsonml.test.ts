/**
 * HTML → ModelScope JSONML 转换测试
 */
import { describe, it, expect } from 'vitest'
import * as linkedom from 'linkedom'
import { htmlToJsonML, jsonmlToContentDraft, buildContentDraft } from '../html-to-jsonml'

/** linkedom 解析为 Document（模拟 runtime.dom.parseHTML，原生 DOMParser 行为）
 *  注意: linkedom DOMParser 需要完整文档输入，碎片会挂错位置 */
function parse(html: string): Promise<Document> {
  return Promise.resolve(
    new linkedom.DOMParser().parseFromString(
      `<!DOCTYPE html><html><head></head><body>${html}</body></html>`,
      'text/html'
    ) as unknown as Document
  )
}

/** 便捷: HTML → JSONML 数组 */
function convert(html: string) {
  return htmlToJsonML(html, parse)
}

describe('htmlToJsonML', () => {
  it('should convert plain paragraph to p block with text leaf', async () => {
    const blocks = await convert('<p>你好魔搭</p>')
    expect(blocks).toEqual([
      ['p', {}, ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, '你好魔搭']]],
    ])
  })

  it('should convert headings h1-h3', async () => {
    const blocks = await convert('<h1>一级</h1><h2>二级</h2><h3>三级</h3>')
    expect(blocks).toHaveLength(3)
    expect(blocks[0]).toEqual(['h1', {}, ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, '一级']]])
    expect(blocks[1][0]).toBe('h2')
    expect(blocks[2][0]).toBe('h3')
  })

  it('should convert link with href', async () => {
    const blocks = await convert('<p><a href="https://modelscope.cn">魔搭</a></p>')
    const p = blocks[0] as [string, Record<string, unknown>, ...unknown[]]
    expect(p[0]).toBe('p')
    const link = p[2] as [string, Record<string, unknown>]
    expect(link[0]).toBe('a')
    expect(link[1]).toEqual({ href: 'https://modelscope.cn' })
  })

  it('should convert image with src', async () => {
    const blocks = await convert('<p><img src="https://cdn.example.com/a.png" alt="图片"></p>')
    const p = blocks[0] as [string, Record<string, unknown>, ...unknown[]]
    const img = p[2] as [string, Record<string, unknown>]
    expect(img[0]).toBe('img')
    expect(img[1]).toMatchObject({ src: 'https://cdn.example.com/a.png', alt: '图片' })
  })

  it('should convert standalone img (no wrapper p)', async () => {
    const blocks = await convert('<div><img src="https://cdn.example.com/b.png"></div>')
    expect(blocks).toHaveLength(1)
    expect(JSON.stringify(blocks)).toContain('"img"')
    expect(JSON.stringify(blocks)).toContain('b.png')
  })

  it('should convert pre>code block to code node', async () => {
    const blocks = await convert('<pre><code class="language-python">print(1)</code></pre>')
    expect(blocks).toEqual([['code', { language: '' }, 'print(1)']])
  })

  it('should convert unordered list', async () => {
    const blocks = await convert('<ul><li>甲</li><li>乙</li></ul>')
    expect(blocks).toEqual([
      ['ul', {},
        ['li', {}, ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, '甲']]],
        ['li', {}, ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, '乙']]],
      ],
    ])
  })

  it('should convert blockquote', async () => {
    const blocks = await convert('<blockquote><p>引用内容</p></blockquote>')
    expect(blocks).toHaveLength(1)
    expect(blocks[0][0]).toBe('blockquote')
    expect(JSON.stringify(blocks)).toContain('引用内容')
  })

  it('should convert strong/em inline styles', async () => {
    const blocks = await convert('<p><strong>粗</strong>和<em>斜</em></p>')
    const json = JSON.stringify(blocks)
    expect(json).toContain('"strong"')
    expect(json).toContain('"em"')
    expect(json).toContain('粗')
    expect(json).toContain('斜')
  })

  it('should drop script/style/iframe content', async () => {
    const blocks = await convert('<p>正文</p><script>alert(1)</script><style>a{}</style>')
    expect(blocks).toHaveLength(1)
    expect(JSON.stringify(blocks)).not.toContain('alert')
  })

  it('should produce empty text node for empty paragraph', async () => {
    const blocks = await convert('<p></p>')
    expect(blocks).toEqual([
      ['p', {}, ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, '']]],
    ])
  })
})

describe('jsonmlToContentDraft', () => {
  it('should wrap blocks in root node', () => {
    const draft = jsonmlToContentDraft([['p', {}, '文本'], ['h1', {}, '标题']])
    const parsed = JSON.parse(draft) as unknown[]
    expect(parsed[0]).toBe('root')
    expect(parsed).toEqual(['root', {}, ['p', {}, '文本'], ['h1', {}, '标题']])
  })
})

describe('buildContentDraft (markdown fallback)', () => {
  it('should use html path when html provided', async () => {
    const draft = await buildContentDraft('<p>HTML 优先</p>', '# 不用我', parse)
    const parsed = JSON.parse(draft) as unknown[]
    expect(parsed).toEqual([
      'root', {},
      ['p', {}, ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, 'HTML 优先']]],
    ])
  })

  it('should fall back to markdown headings', async () => {
    const draft = await buildContentDraft('', '## 标题二\n\n正文段落', parse)
    const parsed = JSON.parse(draft) as [string, unknown[]][]
    expect(parsed[2][0]).toBe('h2')
    expect(JSON.stringify(parsed)).toContain('标题二')
    expect(parsed[3][0]).toBe('p')
  })

  it('should fall back to markdown fenced code', async () => {
    const md = '```\nconst a = 1\n```'
    const draft = await buildContentDraft('', md, parse)
    const parsed = JSON.parse(draft) as [string, unknown[]][]
    expect(parsed[2][0]).toBe('code')
    expect(parsed[2][2]).toBe('const a = 1')
  })

  it('should fall back to markdown list', async () => {
    const draft = await buildContentDraft('', '- 项目一\n- 项目二', parse)
    const parsed = JSON.parse(draft) as [string, unknown[]][]
    expect(parsed[2][0]).toBe('ul')
    expect(JSON.stringify(parsed)).toContain('项目一')
    expect(JSON.stringify(parsed)).toContain('项目二')
  })

  it('should fall back to markdown blockquote', async () => {
    const draft = await buildContentDraft('', '> 引用一行', parse)
    const parsed = JSON.parse(draft) as [string, unknown[]][]
    expect(parsed[2][0]).toBe('blockquote')
  })
})
