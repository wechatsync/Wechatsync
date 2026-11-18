/**
 * @vitest-environment jsdom
 *
 * Mermaid 代码块识别测试
 *
 * 重点覆盖 CSDN 的真实结构：
 * 代码块没有任何 mermaid class / data-lang，语言标识只出现在代码文本里（```mermaid）
 */
import { describe, it, expect } from 'vitest'
import {
  extractMermaidSource,
  findMermaidBlocks,
  findRenderedMermaidBlocks,
  htmlMayContainMermaid,
} from '../src/lib/mermaid-detect'

/** CSDN 文章里的真实代码块结构 */
const CSDN_MERMAID_BLOCK = `<pre data-index="0" class="new-version set-code-show prettyprint" name="code"><code class="has-numbering">\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[结束]
\`\`\`</code></pre>`

const CSDN_NORMAL_CODE_BLOCK = `<pre data-index="1" class="new-version set-code-show prettyprint" name="code"><code class="has-numbering">\`\`\`python
print("hello")
\`\`\`</code></pre>`

describe('extractMermaidSource', () => {
  it('识别 CSDN 形态的 ```mermaid 围栏', () => {
    const source = extractMermaidSource('```mermaid\ngraph TD\n  A-->B\n```')
    expect(source).toBe('graph TD\n  A-->B')
  })

  it('识别无围栏但含图表声明的源码', () => {
    expect(extractMermaidSource('sequenceDiagram\n  A->>B: hi')).toBe('sequenceDiagram\n  A->>B: hi')
  })

  it('识别其它图表类型', () => {
    expect(extractMermaidSource('```mermaid\npie title 占比\n  "a" : 10\n```')).toContain('pie title')
    expect(extractMermaidSource('```mermaid\nstateDiagram-v2\n  [*] --> A\n```')).toContain('stateDiagram-v2')
  })

  it('显式声明其它语言时返回 null', () => {
    expect(extractMermaidSource('```js\nconst a = 1\n```')).toBeNull()
    expect(extractMermaidSource('```python\nprint("hello")\n```')).toBeNull()
  })

  it('无语言标识且不含图表声明时返回 null', () => {
    expect(extractMermaidSource('const a = 1')).toBeNull()
  })

  it('只有一行关键字时返回 null（正文里提到的图表类型名）', () => {
    expect(extractMermaidSource('classDiagram')).toBeNull()
    expect(extractMermaidSource('stateDiagram')).toBeNull()
    expect(extractMermaidSource('erDiagram')).toBeNull()
  })

  it('空内容返回 null', () => {
    expect(extractMermaidSource('')).toBeNull()
    expect(extractMermaidSource('   \n  ')).toBeNull()
  })

  it('支持 ~~ 围栏', () => {
    expect(extractMermaidSource('~~~mermaid\ngraph LR\n  A-->B\n~~~')).toBe('graph LR\n  A-->B')
  })
})

describe('htmlMayContainMermaid', () => {
  it('命中 CSDN 形态（语言标识只在代码文本里）', () => {
    expect(htmlMayContainMermaid(`<div id="content_views">${CSDN_MERMAID_BLOCK}</div>`)).toBe(true)
  })

  it('命中带 mermaid class 的代码块', () => {
    expect(htmlMayContainMermaid('<pre class="language-mermaid"><code>graph TD\nA-->B</code></pre>')).toBe(true)
  })

  it('命中 data-lang="mermaid"', () => {
    expect(htmlMayContainMermaid('<pre data-lang="mermaid">graph TD\nA-->B</pre>')).toBe(true)
  })

  it('围栏丢失时靠内容嗅探命中', () => {
    expect(htmlMayContainMermaid('<pre><code>graph TD\n  A--&gt;B</code></pre>')).toBe(true)
  })

  it('普通文章不命中', () => {
    expect(htmlMayContainMermaid(`<div>${CSDN_NORMAL_CODE_BLOCK}<p>hello</p></div>`)).toBe(false)
  })

  it('空字符串不命中', () => {
    expect(htmlMayContainMermaid('')).toBe(false)
  })
})

describe('findMermaidBlocks', () => {
  function makeContainer(html: string): HTMLElement {
    const container = document.createElement('div')
    container.innerHTML = html
    return container
  }

  it('找到 CSDN 形态的代码块，并定位到 <pre>', () => {
    const container = makeContainer(CSDN_MERMAID_BLOCK)
    const blocks = findMermaidBlocks(container)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].element.tagName).toBe('PRE')
    expect(blocks[0].source).toContain('graph TD')
    expect(blocks[0].source).not.toContain('```')
  })

  it('带 class 的代码块定位到 <pre>', () => {
    const container = makeContainer(
      '<pre class="language-mermaid"><code class="language-mermaid">graph TD\nA-->B</code></pre>'
    )
    const blocks = findMermaidBlocks(container)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].element.tagName).toBe('PRE')
  })

  it('普通代码块不会被误判', () => {
    const container = makeContainer(CSDN_NORMAL_CODE_BLOCK)
    expect(findMermaidBlocks(container)).toHaveLength(0)
  })

  it('行内 code 提到图表类型名时不会被误判', () => {
    const container = makeContainer(
      '<p>用关键词 <code>classDiagram</code> 表示类图，<code>flowchart</code> 表示流程图</p>'
    )
    expect(findMermaidBlocks(container)).toHaveLength(0)
  })

  it('混合内容时只返回 Mermaid 块', () => {
    const container = makeContainer(
      `<div>${CSDN_NORMAL_CODE_BLOCK}${CSDN_MERMAID_BLOCK}<p>正文</p></div>`
    )
    const blocks = findMermaidBlocks(container)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].source).toContain('graph TD')
  })

  it('同一块代码不会被 pre/code 重复命中', () => {
    const container = makeContainer(CSDN_MERMAID_BLOCK)
    expect(findMermaidBlocks(container)).toHaveLength(1)
  })

  it('多个 Mermaid 块都能找到', () => {
    const container = makeContainer(
      CSDN_MERMAID_BLOCK +
        '<pre data-index="1"><code>```mermaid\nsequenceDiagram\n  A->>B: hi\n```</code></pre>'
    )
    const blocks = findMermaidBlocks(container)

    expect(blocks).toHaveLength(2)
    expect(blocks[0].source).toContain('graph TD')
    expect(blocks[1].source).toContain('sequenceDiagram')
  })
})

describe('行号与围栏容错', () => {
  it('剥掉代码块里的行号', () => {
    const source = extractMermaidSource('```mermaid\n1 graph TD\n2   A-->B\n3   B-->C\n```')
    expect(source).toBe('graph TD\n  A-->B\n  B-->C')
  })

  it('围栏前面有噪音时仍能识别', () => {
    const source = extractMermaidSource('```mermaid\ngraph TD\n  A-->B\n```')
    expect(source).toContain('graph TD')
  })

  it('带行号且带围栏的 HTML 也能命中', () => {
    const html = '<pre><code>```mermaid\n1 graph TD\n2   A--&gt;B\n3   B--&gt;C\n```</code></pre>'
    expect(htmlMayContainMermaid(html)).toBe(true)
  })
})

describe('findRenderedMermaidBlocks', () => {
  function makeContainer(html: string): HTMLElement {
    const container = document.createElement('div')
    container.innerHTML = html
    return container
  }

  it('识别已经渲染成 SVG 的 Mermaid 容器', () => {
    const container = makeContainer(
      '<div class="mermaid"><svg viewBox="0 0 100 50"><g></g></svg></div>'
    )
    const blocks = findRenderedMermaidBlocks(container)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].svg.tagName.toLowerCase()).toBe('svg')
  })

  it('普通 SVG 不会被当成 Mermaid', () => {
    const container = makeContainer('<div class="figure"><svg viewBox="0 0 10 10"></svg></div>')
    expect(findRenderedMermaidBlocks(container)).toHaveLength(0)
  })
})
