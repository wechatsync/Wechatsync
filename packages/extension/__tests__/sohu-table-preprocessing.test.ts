import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseHTML } from 'linkedom'

vi.unmock('@wechatsync/core')

import {
  DEFAULT_PREPROCESS_CONFIG,
  SohuAdapter,
  type PreprocessConfig,
} from '../../core/src/index.ts'
import { preprocessForPlatform } from '../src/lib/content-processor.ts'
import {
  renderTableToSvg,
  repairMalformedTableHtml,
  transformTablesToSvgImages,
} from '../src/lib/table-transformers/svg-image.ts'

function installDom(): void {
  const { document, window } = parseHTML('<!doctype html><html><body></body></html>')

  Object.assign(globalThis, {
    document,
    window,
    Node: window.Node,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    NodeFilter: { SHOW_COMMENT: 128 },
  })
}

function sohuConfig(): PreprocessConfig {
  return {
    ...DEFAULT_PREPROCESS_CONFIG,
    ...new SohuAdapter().preprocessConfig,
  }
}

function createContainer(html: string): HTMLDivElement {
  const container = document.createElement('div')
  container.innerHTML = html
  return container
}

function decodeSvgSource(image: HTMLImageElement): string {
  const source = image.getAttribute('src') || ''
  const commaIndex = source.indexOf(',')
  return decodeURIComponent(source.slice(commaIndex + 1))
}

describe('表格 SVG 图片渲染器', () => {
  beforeEach(() => {
    installDom()
  })

  it('把整张普通 HTML 表格渲染成一个带边框的 640px SVG，而不是依赖平台 CSS', () => {
    const container = createContainer(`
      <table aria-label="月度质检评分表">
        <thead><tr><th>客服</th><th>语言规范性(25分)</th><th>信息准确性(30分)</th><th>同理心(15分)</th><th>响应效率(20分)</th><th>合规性(10分)</th><th>总分</th><th>排名</th></tr></thead>
        <tbody>
          <tr><td>客服A</td><td>22</td><td>28</td><td>13</td><td>18</td><td>10</td><td>91</td><td>1</td></tr>
          <tr><td>客服B</td><td>20</td><td>26</td><td>11</td><td>17</td><td>9</td><td>83</td><td>2</td></tr>
          <tr><td>客服C</td><td>18</td><td>24</td><td>12</td><td>15</td><td>8</td><td>77</td><td>3</td></tr>
        </tbody>
      </table>
    `)

    transformTablesToSvgImages(container)

    const image = container.querySelector('img') as HTMLImageElement
    const svg = decodeSvgSource(image)
    expect(container.querySelector('table')).toBeNull()
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(image.getAttribute('width')).toBe('640')
    expect(image.getAttribute('height')).toBe('192')
    expect(image.getAttribute('alt')).toBe('月度质检评分表')
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="192"')
    expect(svg.match(/<rect /g)).toHaveLength(32)
    expect(svg).toContain('stroke="#c8ced8"')
    expect(svg).toContain('语言规</text>')
    expect(svg).toContain('范性(25</text>')
    expect(svg).toContain('客服C')
  })

  it('按比例使用 colgroup 列宽，并支持 colspan/rowspan 的统一网格布局', () => {
    const table = createContainer(`
      <table>
        <colgroup><col width="100"><col width="300"></colgroup>
        <tbody>
          <tr><td rowspan="2">A</td><td>B</td></tr>
          <tr><td>C</td></tr>
          <tr><td colspan="2">D</td></tr>
        </tbody>
      </table>
    `).querySelector('table') as HTMLTableElement

    const result = renderTableToSvg(table)

    expect(result.width).toBe(640)
    expect(result.height).toBe(108)
    expect(result.svg).toContain('<rect x="0" y="0" width="160" height="72"')
    expect(result.svg).toContain('<rect x="160" y="0" width="480" height="36"')
    expect(result.svg).toContain('<rect x="0" y="72" width="640" height="36"')
  })

  it('转义单元格文本，并保留 br 和块元素产生的显式换行', () => {
    const table = createContainer(`
      <table><tbody><tr><td>甲&lt;乙 &amp; 丙<br><strong>第二行</strong><p>第三行</p></td></tr></tbody></table>
    `).querySelector('table') as HTMLTableElement

    const result = renderTableToSvg(table)

    expect(result.svg).toContain('甲&lt;乙 &amp; 丙')
    expect(result.svg).toContain('第二行')
    expect(result.svg).toContain('第三行')
    expect(result.svg).not.toContain('<乙')
  })

  it('多个表格分别生成一张图片，没有表格时不改动正文', () => {
    const container = createContainer('<p>前文</p><table><tr><td>A</td></tr></table><table><tr><td>B</td></tr></table>')
    transformTablesToSvgImages(container)
    expect(container.querySelectorAll('img')).toHaveLength(2)
    expect(container.querySelector('p')?.textContent).toBe('前文')

    const plain = createContainer('<p>只有正文</p>')
    transformTablesToSvgImages(plain)
    expect(plain.innerHTML).toBe('<p>只有正文</p>')
  })
})

describe('搜狐表格完整预处理', () => {
  beforeEach(() => {
    installDom()
  })

  it('搜狐声明 SVG 图片表格格式和 H3 粗体规则', () => {
    const config = sohuConfig()
    expect(config.tableFormat).toBe('svg-image')
    expect(config.boldHeadingLevels).toEqual([3])
  })

  it('把表格整体替换成可进入现有图片上传链路的 SVG data URI', () => {
    const rawHtml = '<table><thead><tr><th>指标</th><th>分数</th></tr></thead><tbody><tr><td>响应效率</td><td>20</td></tr></tbody></table>'
    const { html } = preprocessForPlatform(rawHtml, sohuConfig())
    const container = createContainer(html)
    const image = container.querySelector('img') as HTMLImageElement

    expect(container.querySelector('table')).toBeNull()
    expect(image.getAttribute('src')).toMatch(/^data:image\/svg\+xml;charset=utf-8,/)
    expect(decodeSvgSource(image)).toContain('响应效率')
  })

  it('在浏览器解析前修复用户现场出现的 tr > p 非法表格，避免段落被移出表格', () => {
    const rawHtml = '<table class="quill-better-table" style="width: 640px; table-layout: fixed;"><colgroup><col width="128"><col width="128"><col width="128"><col width="128"><col width="128"></colgroup><tbody><tr><p>同理心(15分)</p><p>响应效率(20分)</p><p>合规性(10分)</p><p>总分</p><p>排名</p></tr></tbody></table>'
    const repairedHtml = repairMalformedTableHtml(rawHtml)
    const { html } = preprocessForPlatform(rawHtml, sohuConfig())
    const container = createContainer(html)
    const image = container.querySelector('img') as HTMLImageElement
    const svg = decodeSvgSource(image)
    const svgText = createContainer(svg).textContent

    expect(repairedHtml).toContain('<td><p>同理心(15分)</p></td>')
    expect(container.children).toHaveLength(1)
    expect(container.querySelectorAll(':scope > p')).toHaveLength(0)
    expect(svg.match(/<rect /g)).toHaveLength(5)
    expect(svgText).toContain('同理心(15分)')
    expect(svgText).toContain('响应效率(20分)')
    expect(svgText).toContain('排名')
  })

  it('旧 convertTablesToText 仍生效，但平台显式 SVG 格式优先', () => {
    const rawHtml = '<table><thead><tr><th>名称</th></tr></thead><tbody><tr><td>快商通</td></tr></tbody></table>'
    const textResult = preprocessForPlatform(rawHtml, {
      ...DEFAULT_PREPROCESS_CONFIG,
      convertTablesToText: true,
    })
    const sohuResult = preprocessForPlatform(rawHtml, {
      ...sohuConfig(),
      convertTablesToText: true,
    })

    expect(textResult.html).not.toContain('<table')
    expect(textResult.html).toContain('名称: 快商通')
    expect(sohuResult.html).not.toContain('<table')
    expect(sohuResult.html).toContain('data:image/svg+xml')
  })

  it('非搜狐平台继续保留语义表格，不受 SVG 输出影响', () => {
    const rawHtml = '<table><tbody><tr><td>普通表格</td></tr></tbody></table>'
    const { html } = preprocessForPlatform(rawHtml, {
      ...DEFAULT_PREPROCESS_CONFIG,
      outputFormat: 'html',
    })
    expect(html).toContain('<table>')
    expect(html).not.toContain('data:image/svg+xml')
  })
})

describe('搜狐标题完整预处理', () => {
  beforeEach(() => {
    installDom()
  })

  it('为 H3 标题生成显式粗体，并保持其他标题不变', () => {
    const { html } = preprocessForPlatform('<h2>二级</h2><h3>三级 <em>强调</em></h3>', sohuConfig())
    expect(html).toBe('<h2>二级</h2><h3><strong>三级 <em>强调</em></strong></h3>')
  })

  it('没有表格的搜狐正文不发生无关变化', () => {
    const rawHtml = '<p>正文 <strong>加粗</strong></p>'
    expect(preprocessForPlatform(rawHtml, sohuConfig()).html).toBe(rawHtml)
  })
})
