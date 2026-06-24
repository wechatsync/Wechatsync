import { describe, expect, it } from 'vitest'
import { ZhihuAdapter } from '../zhihu'

describe('ZhihuAdapter', () => {
  it('renders markdown latex as Zhihu equation images', () => {
    const adapter = new ZhihuAdapter()
    const transformContent = (
      adapter as unknown as { transformContent(content: string): string }
    ).transformContent.bind(adapter)

    const html = [
      '<p>行内 $111$ 公式</p>',
      '<p>$$x^2 + y^2$$</p>',
      '<p><img src="https://example.com/a.png"></p>',
      '<pre><code>$keep$</code></pre>',
    ].join('')

    const result = transformContent(html)

    expect(result).toContain('https://www.zhihu.com/equation?tex=111')
    expect(result).toContain('eeimg="1"')
    expect(result).toContain('https://www.zhihu.com/equation?tex=x%5E2%20%2B%20y%5E2')
    expect(result).toContain('eeimg="2"')
    expect(result).toContain('<figure><img src="https://example.com/a.png"></figure>')
    expect(result).toContain('<pre><code>$keep$</code></pre>')
  })
})
