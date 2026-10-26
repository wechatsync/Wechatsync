/**
 * @vitest-environment jsdom
 *
 * 矢量图（SVG）识别与光栅化测试
 *
 * 背景：微信公众号正文不支持内联 SVG，会直接丢弃，
 * CSDN 渲染好的 Mermaid 流程图必须先转成 PNG 图片再同步。
 */
import { describe, it, expect } from 'vitest'
import {
  convertForeignObjectsToText,
  decodeSvgDataUri,
  isContentSvg,
  parseSvgSize,
} from '../src/lib/svg-rasterizer'
import { countInlineSvg, htmlMayContainSvg } from '../src/lib/mermaid-detect'

/** CSDN 渲染好的 Mermaid 流程图（内联 SVG，自带 style） */
const CSDN_RENDERED_MERMAID = `<svg id="mermaid-1700000000000" aria-roledescription="flowchart-v2" width="100%" style="max-width: 620px;" viewBox="0 0 620 320" xmlns="http://www.w3.org/2000/svg" role="graphics-document document">
<style>#mermaid-1700000000000 .node rect{fill:#ECECFF;}</style>
<g class="node"><rect width="80" height="40"></rect><text>开始</text></g>
</svg>`

function makeSvg(markup: string): SVGElement {
  const holder = document.createElement('div')
  holder.innerHTML = markup
  return holder.querySelector('svg') as SVGElement
}

/** 真实 CSDN 页面上的 Mermaid SVG（htmlLabels 开启，文字放在 foreignObject 里） */
const CSDN_MERMAID_WITH_FOREIGN_OBJECT = `<svg id="mermaid-svg-abc" class="flowchart" width="100%" style="max-width: 1153px;" viewBox="0 0 1153 198" xmlns="http://www.w3.org/2000/svg">
<style>#mermaid-svg-abc{font-size:16px;fill:#333;}</style>
<g class="node default"><rect class="node default" width="174" height="40"></rect>
<g class="label" transform="translate(-87, -12)"><foreignObject width="174" height="24"><div xmlns="http://www.w3.org/1999/xhtml" style="display: table-cell; white-space: nowrap;"><span class="nodeLabel"><p>📋 SWE.2 五个基本实践</p></span></div></foreignObject></g>
</g>
<g class="node default"><rect class="node default" width="127" height="60"></rect>
<g class="label" transform="translate(-63.5, -24)"><foreignObject width="127" height="48"><div xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel"><p>BP1 静态架构定义<br>“结构怎么搭”</p></span></div></foreignObject></g>
</g>
<g class="edgeLabel"><foreignObject width="0" height="0"><div class="labelBkg"><span class="edgeLabel"></span></div></foreignObject></g>
</svg>`

describe('convertForeignObjectsToText', () => {
  it('把带文字的 foreignObject 换成 <text>', () => {
    const svg = makeSvg(CSDN_MERMAID_WITH_FOREIGN_OBJECT)
    const count = convertForeignObjectsToText(svg)

    expect(count).toBe(2)
    expect(svg.querySelectorAll('foreignObject').length).toBe(0)
    const text = svg.querySelector('text')
    expect(text).not.toBeNull()
    expect(text!.getAttribute('text-anchor')).toBe('middle')
    // 居中放在 (w/2, h/2)
    expect(text!.getAttribute('x')).toBe('87')
    expect(text!.getAttribute('y')).toBe('12')
    expect(text!.textContent).toContain('📋 SWE.2 五个基本实践')
  })

  it('多行文字按 <br> 拆成多个 tspan', () => {
    const svg = makeSvg(CSDN_MERMAID_WITH_FOREIGN_OBJECT)
    convertForeignObjectsToText(svg)

    const texts = Array.from(svg.querySelectorAll('text'))
    const multi = texts.find((t) => t.textContent!.includes('BP1'))!
    const tspans = multi.querySelectorAll('tspan')
    expect(tspans.length).toBe(2)
    expect(tspans[0].textContent).toBe('BP1 静态架构定义')
    expect(tspans[1].textContent).toBe('“结构怎么搭”')
    // 两行分别居中在 h/2 上下各一半行高处
    expect(tspans[0].getAttribute('y')).toBe('12')
    expect(tspans[1].getAttribute('y')).toBe('36')
  })

  it('空的 foreignObject（边缘标签背景）直接删除', () => {
    const svg = makeSvg(CSDN_MERMAID_WITH_FOREIGN_OBJECT)
    convertForeignObjectsToText(svg)

    expect(svg.querySelectorAll('foreignObject').length).toBe(0)
    // 剩下的 text 只有两个有文字的
    expect(svg.querySelectorAll('text').length).toBe(2)
    expect(svg.textContent).not.toContain('labelBkg')
  })

  it('没有 foreignObject 时不做任何改动', () => {
    const svg = makeSvg(CSDN_RENDERED_MERMAID)
    const before = svg.outerHTML
    expect(convertForeignObjectsToText(svg)).toBe(0)
    expect(svg.outerHTML).toBe(before)
  })
})

describe('htmlMayContainSvg', () => {
  it('识别内联 SVG', () => {
    expect(htmlMayContainSvg(`<p>文字</p>${CSDN_RENDERED_MERMAID}`)).toBe(true)
  })

  it('识别 SVG data URI 图片', () => {
    expect(htmlMayContainSvg('<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">')).toBe(true)
  })

  it('没有 SVG 时返回 false', () => {
    expect(htmlMayContainSvg('<p>普通文章</p><img src="https://example.com/a.png">')).toBe(false)
    expect(htmlMayContainSvg('')).toBe(false)
  })
})

describe('countInlineSvg', () => {
  it('统计剩余的内联 SVG 数量', () => {
    expect(countInlineSvg(`${CSDN_RENDERED_MERMAID}${CSDN_RENDERED_MERMAID}`)).toBe(2)
    expect(countInlineSvg('<p>没有图</p>')).toBe(0)
  })
})

describe('parseSvgSize', () => {
  it('优先使用 viewBox', () => {
    expect(parseSvgSize('<svg viewBox="0 0 620 320" width="100%"></svg>')).toEqual({ width: 620, height: 320 })
  })

  it('没有 viewBox 时使用宽高属性', () => {
    expect(parseSvgSize('<svg width="200" height="100"></svg>')).toEqual({ width: 200, height: 100 })
  })

  it('百分比宽度且无 viewBox 时返回 null', () => {
    expect(parseSvgSize('<svg width="100%" style="max-width: 600px;"></svg>')).toBeNull()
  })
})

describe('isContentSvg', () => {
  it('Mermaid 渲染出来的 SVG 是内容图', () => {
    const svg = makeSvg(CSDN_RENDERED_MERMAID)
    expect(isContentSvg(svg, parseSvgSize(CSDN_RENDERED_MERMAID))).toBe(true)
  })

  it('带 data-processed 标记的 SVG 是内容图', () => {
    const svg = makeSvg('<svg data-processed="true" width="10" height="10"></svg>')
    expect(isContentSvg(svg, { width: 10, height: 10 })).toBe(true)
  })

  it('尺寸够大的普通 SVG 是内容图', () => {
    const svg = makeSvg('<svg viewBox="0 0 800 400"><rect width="10" height="10"/></svg>')
    expect(isContentSvg(svg, { width: 800, height: 400 })).toBe(true)
  })

  it('小图标不算内容图', () => {
    const svg = makeSvg('<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>')
    expect(isContentSvg(svg, { width: 16, height: 16 })).toBe(false)
  })
})

describe('decodeSvgDataUri', () => {
  it('解码普通（URL 编码）data URI', () => {
    const svg = '<svg viewBox="0 0 10 10"></svg>'
    const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`
    expect(decodeSvgDataUri(uri)).toBe(svg)
  })

  it('解码 base64 data URI', () => {
    const svg = '<svg viewBox="0 0 10 10"></svg>'
    const uri = `data:image/svg+xml;base64,${btoa(svg)}`
    expect(decodeSvgDataUri(uri)).toBe(svg)
  })

  it('不是 SVG data URI 时返回 null', () => {
    expect(decodeSvgDataUri('https://example.com/a.png')).toBeNull()
  })
})
