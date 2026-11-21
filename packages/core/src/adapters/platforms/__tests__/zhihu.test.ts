import { parseHTML } from 'linkedom/worker'
import { describe, expect, it, vi } from 'vitest'
import { ZhihuAdapter } from '../zhihu'
import type { RuntimeInterface } from '../../../runtime/interface'

async function saveDraft(html: string) {
  const fetch = vi.fn(async (url: string, options?: RequestInit) => {
    if (url === 'https://zhuanlan.zhihu.com/api/articles/drafts' && options?.method === 'POST') {
      return Response.json({ id: '123' })
    }
    if (url === 'https://zhuanlan.zhihu.com/api/articles/123/draft' && options?.method === 'PATCH') {
      return new Response(null, { status: 204 })
    }
    throw new Error(`Unexpected request: ${url}`)
  })
  const adapter = new ZhihuAdapter()
  await adapter.init({ type: 'extension', fetch } as RuntimeInterface)
  const result = await adapter.publish({ title: '公式', html }, { draftOnly: true })

  expect(result).toMatchObject({ success: true, draftOnly: true })
  expect(fetch).toHaveBeenCalledTimes(2)
  const body = JSON.parse(String(fetch.mock.calls[1][1]?.body))
  return parseHTML(body.content).document
}

describe('Zhihu draft formulas', () => {
  it('converts extracted KaTeX text into native inline and block formulas', async () => {
    const ucb = String.raw`A_{t}=\arg \max _{a}\left[Q_{t}(a)+c\sqrt{\frac{\ln t}{N_{t}(a)}}\right]`
    const html = `<p>公式 <span class="katex">$${ucb}$</span> 之后</p>`
      + '<p>$$ \nx &lt; y &amp; z = &quot;1&quot;\n $$</p>'
    const document = await saveDraft(html)
    const formulas = Array.from(document.querySelectorAll('img[eeimg]'))

    expect(formulas.map(image => image.getAttribute('eeimg'))).toEqual(['1', '2'])
    const latex = [ucb, ' \nx < y & z = "1"\n ']
    expect(formulas.map(image => image.getAttribute('alt'))).toEqual(latex)
    expect(formulas.map(image => image.getAttribute('src'))).toEqual(
      latex.map(formula => `//www.zhihu.com/equation?tex=${encodeURIComponent(formula)}`)
    )
    expect(document.querySelector('p')?.textContent).toBe('公式  之后')
    expect(document.querySelector('figure')).toBeNull()
  })

  it('keeps code, attributes, prices, and escaped dollars as text', async () => {
    const line = String.raw`<p title="$attribute$">价格 $5 或 $10，字面量 \$x\$，公式 $\text{\$5}$。</p>`
    const document = await saveDraft(
      line + '<pre><code>$$x^2$$</code></pre><p><code>$value$</code></p>'
    )

    expect(document.querySelector('p')?.getAttribute('title')).toBe('$attribute$')
    expect(document.querySelector('p')?.textContent).toBe(String.raw`价格 $5 或 $10，字面量 \$x\$，公式 。`)
    expect(Array.from(document.querySelectorAll('code'), code => code.textContent))
      .toEqual(['$$x^2$$', '$value$'])
    expect(Array.from(document.querySelectorAll('img'), image => image.getAttribute('alt')))
      .toEqual([String.raw`\text{\$5}`])
  })

  it('preserves an existing equation and still wraps a normal image', async () => {
    const document = await saveDraft(
      '<p>行内 <img eeimg="1" src="//www.zhihu.com/equation?tex=x" alt="x"> 公式</p>'
      + '<p><img src="https://pic1.zhimg.com/example.png"></p>'
    )

    expect(document.querySelector('p > img[eeimg]')?.getAttribute('alt')).toBe('x')
    expect(Array.from(document.querySelectorAll('figure img'), image => image.getAttribute('src')))
      .toEqual(['https://pic1.zhimg.com/example.png'])
  })
})
