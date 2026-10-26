/**
 * SVG 光栅化器
 *
 * 微信公众号正文只接受图片（jpg/png/gif），内联 SVG 会被微信直接丢弃，
 * 结果就是文章里出现一个空白缺口。
 *
 * CSDN 等平台在页面上渲染好的 Mermaid 流程图就是内联 <svg>，
 * 因此提取文章时必须先把它转成 PNG 图片，再走现有的图片上传流程。
 *
 * 本模块不依赖 mermaid 库，可以安全地打进 content script，
 * 在「提取文章」阶段就地转换（此时 SVG 还带着自己的 <style>，
 * 转成 PNG 后样式才不会丢）。
 */
import { createLogger } from './logger'

const logger = createLogger('SvgRasterizer')

export interface SvgRasterOptions {
  /** 像素密度，默认 2（高清图，微信端缩放显示仍然清晰） */
  scale?: number
  /** 最大宽度（CSS 像素），超出则等比缩小，默认 1200 */
  maxWidth?: number
  /** 画布背景色，默认白色（PNG 需要不透明背景，微信不支持透明 PNG 混排） */
  backgroundColor?: string
  /** 宽度小于该值视为装饰性图标，不转换，默认 80 */
  minWidth?: number
  /** 高度小于该值视为装饰性图标，不转换，默认 60 */
  minHeight?: number
  /** 只转换「有图表特征」的 SVG，跳过纯尺寸判断（用于扫描整页，避免误伤页面装饰图） */
  strictContent?: boolean
}

export interface SvgRasterSummary {
  /** 成功转换的数量 */
  rendered: number
  /** 转换失败的数量 */
  failed: number
  /** 失败原因（用于把问题暴露给用户，而不是静默跳过） */
  errors: string[]
  /** 把被替换掉的原始元素放回去（仅在扫描真实页面 DOM 时提供） */
  restore?: () => void
}

const DEFAULT_OPTIONS: Required<SvgRasterOptions> = {
  scale: 2,
  maxWidth: 1200,
  backgroundColor: '#ffffff',
  minWidth: 80,
  minHeight: 60,
  strictContent: false,
}

/**
 * 从 SVG 中解析出固有尺寸
 */
export function parseSvgSize(svg: string): { width: number; height: number } | null {
  const viewBox = svg.match(/viewBox\s*=\s*"([^"]+)"/i)
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n)) && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] }
    }
  }

  const width = svg.match(/\bwidth\s*=\s*"(\d+(?:\.\d+)?)/i)
  const height = svg.match(/\bheight\s*=\s*"(\d+(?:\.\d+)?)/i)
  if (width && height) {
    const w = Number(width[1])
    const h = Number(height[1])
    if (w > 0 && h > 0) return { width: w, height: h }
  }

  return null
}

/**
 * 把 SVG 调整成可以光栅化的形式
 * 浏览器渲染出来的 SVG 常常给根节点 width="100%" + style="max-width: Npx"，
 * 光栅化必须要有确定的像素尺寸
 */
function normalizeSvgForRaster(svg: string, width: number, height: number): string {
  return svg.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    let cleaned = attrs
      .replace(/\swidth\s*=\s*"[^"]*"/gi, '')
      .replace(/\sheight\s*=\s*"[^"]*"/gi, '')
      .replace(/\sstyle\s*=\s*"[^"]*"/gi, '')

    // mermaid 偶尔会输出 xlink:href 却没有声明 xmlns:xlink，
    // 浏览器按 XML 解析时会报 "prefix is unbound"，整张图直接加载失败
    if (/xlink:/.test(svg) && !/xmlns:xlink\s*=/.test(cleaned)) {
      cleaned += ' xmlns:xlink="http://www.w3.org/1999/xlink"'
    }

    return `<svg${cleaned} width="${Math.round(width)}" height="${Math.round(height)}">`
  })
}

/**
 * 把 HTML 命名实体转成 XML 数字实体
 *
 * SVG 被浏览器当作 XML 解析，`&nbsp;` 这类 HTML 命名实体会让整个文档解析失败，
 * 结果就是 <img> 加载不出来（onerror）。
 */
function sanitizeSvgXml(svg: string): string {
  return svg.replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name: string) => {
    if (name === 'amp' || name === 'lt' || name === 'gt' || name === 'quot' || name === 'apos') {
      return match
    }
    // 用 textarea 借助浏览器把命名实体解成字符
    const holder = document.createElement('textarea')
    holder.innerHTML = match
    const text = holder.textContent || ''
    if (!text || text === match) return match
    return `&#${text.codePointAt(0)};`
  })
}

/**
 * 转义裸 & （不是合法实体的 & 会让 XML 解析失败）
 */
function escapeBareAmpersands(svg: string): string {
  return svg.replace(/&(?!(?:#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]+;))/g, '&amp;')
}

/**
 * 用 DOMParser 校验 SVG 是否是合法的 XML
 *
 * 浏览器把 SVG 当 XML 解析，一旦有语法错误，<img> 会直接 onerror，
 * 而且报错信息里完全看不出是哪一行坏了，这里提前把解析错误抓出来。
 */
function describeSvgParseError(svg: string): string | null {
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const error = doc.querySelector('parsererror')
    return error ? (error.textContent || '').replace(/\s+/g, ' ').slice(0, 300) : null
  } catch {
    return null
  }
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('SVG 光栅化失败'))
    img.src = src
  })
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * 取出 <foreignObject> 里的文字，按 <br> 分行
 */
function extractTextLines(fo: Element): string[] {
  const holder = fo.ownerDocument.createElement('div')
  holder.innerHTML = fo.innerHTML
  holder.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))

  return (holder.textContent || '')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * 把 <foreignObject> 换成原生 SVG <text>
 *
 * Chrome 不支持在「以图片方式加载的 SVG」里渲染 <foreignObject>：
 * <img src="data:image/svg+xml,..."> 会直接 onerror，整张图根本加载不出来。
 * 而 Mermaid 开启 htmlLabels（默认）时，节点文字正是放在 foreignObject 里的，
 * 所以光栅化之前必须先把它们换成 <text>。
 *
 * Mermaid 的结构是：
 *   <g class="label" transform="translate(-w/2, -h/2)">
 *     <foreignObject width="w" height="h"><div><span class="nodeLabel"><p>文字</p></span></div></foreignObject>
 *   </g>
 * foreignObject 没有 x/y，起点就是 (0,0)，所以文字要放在 (w/2, h/2) 居中。
 */
export function convertForeignObjectsToText(svg: Element): number {
  const list = Array.from(svg.querySelectorAll('foreignObject'))
  let converted = 0

  for (const fo of list) {
    const width = parseFloat(fo.getAttribute('width') || '0') || 0
    const height = parseFloat(fo.getAttribute('height') || '0') || 0
    const lines = extractTextLines(fo)

    // 空的边缘标签背景（只用来垫底色），没有文字就没有保留价值
    if (!lines.length || width <= 0 || height <= 0) {
      fo.remove()
      continue
    }

    const doc = fo.ownerDocument
    const text = doc.createElementNS(SVG_NS, 'text')
    text.setAttribute('x', String(width / 2))
    text.setAttribute('y', String(height / 2))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'central')

    const lineHeight = height / lines.length
    lines.forEach((line, index) => {
      const tspan = doc.createElementNS(SVG_NS, 'tspan')
      tspan.setAttribute('x', String(width / 2))
      tspan.setAttribute(
        'y',
        String(height / 2 + (index - (lines.length - 1) / 2) * lineHeight)
      )
      tspan.textContent = line
      text.appendChild(tspan)
    })

    fo.parentNode?.replaceChild(text, fo)
    converted++
  }

  return converted
}

/**
 * 对 SVG 字符串做 foreignObject → text 转换
 */
function convertForeignObjectsInSvgString(svg: string): string {
  if (!/<foreignObject[\s>]/i.test(svg)) return svg

  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    if (doc.getElementsByTagName('parsererror').length > 0) return svg
    const root = doc.documentElement
    if (!root) return svg
    convertForeignObjectsToText(root)
    return new XMLSerializer().serializeToString(root)
  } catch (error) {
    logger.warn('foreignObject 转换失败:', error)
    return svg
  }
}

/**
 * 加载 SVG 图片
 *
 * 依次尝试三种方式，任一成功即可：
 * 1. UTF-8 编码的 data URI（最常用）
 * 2. base64 编码的 data URI（避开非 ASCII 字符带来的编码问题）
 * 3. blob URL（避开 data URI 长度限制）
 */
async function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  const bytes = new TextEncoder().encode(svg)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)

  const attempts: Array<() => Promise<HTMLImageElement>> = [
    () => loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`),
    () => loadImage(`data:image/svg+xml;base64,${btoa(binary)}`),
    () => {
      const blobUrl = URL.createObjectURL(
        new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      )
      return loadImage(blobUrl).finally(() => URL.revokeObjectURL(blobUrl))
    },
  ]

  let lastError: unknown
  for (const attempt of attempts) {
    try {
      return await attempt()
    } catch (error) {
      lastError = error
      logger.debug('SVG 光栅化尝试失败，尝试下一种方式:', error)
    }
  }

  const parseError = describeSvgParseError(svg)
  throw new Error(
    `${(lastError as Error)?.message || 'SVG 光栅化失败'}` +
    `（SVG 长度 ${svg.length}${parseError ? `，XML 解析错误：${parseError}` : ''}）`
  )
}

/**
 * 把 SVG 字符串光栅化成 PNG data URI
 */
export async function rasterizeSvgToPng(
  svg: string,
  options: SvgRasterOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Chrome 不支持「以图片加载的 SVG」里的 foreignObject，必须先换成 <text>
  svg = convertForeignObjectsInSvgString(svg)

  const size = parseSvgSize(svg)
  if (!size) {
    throw new Error('无法解析 SVG 尺寸')
  }

  // 等比缩放到最大宽度
  const displayWidth = Math.min(size.width, opts.maxWidth)
  const ratio = displayWidth / size.width
  const displayHeight = size.height * ratio

  const rasterSvg = sanitizeSvgXml(
    escapeBareAmpersands(normalizeSvgForRaster(svg, displayWidth, displayHeight))
  )

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(displayWidth * opts.scale))
  canvas.height = Math.max(1, Math.round(displayHeight * opts.scale))

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建 canvas 上下文')
  }

  ctx.fillStyle = opts.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const image = await loadSvgImage(rasterSvg)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/png')
}

/**
 * 把 SVG 元素光栅化成 PNG data URI
 */
export async function rasterizeSvgElement(
  svgElement: Element,
  options: SvgRasterOptions = {}
): Promise<string> {
  const clone = svgElement.cloneNode(true) as SVGElement
  // 先把 foreignObject 换成 <text>，否则 Chrome 加载不了这张图
  convertForeignObjectsToText(clone)
  let svgString = clone.outerHTML

  // SVG 没有 viewBox / 像素尺寸时，用实际渲染尺寸兜底
  if (!parseSvgSize(svgString)) {
    const rect = svgElement.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      svgString = svgString.replace(
        /<svg\b/i,
        `<svg width="${Math.round(rect.width)}" height="${Math.round(rect.height)}"`
      )
    }
  }

  return rasterizeSvgToPng(svgString, options)
}

/**
 * 解码 data:image/svg+xml URI，还原成 SVG 源码
 */
export function decodeSvgDataUri(src: string): string | null {
  const match = src.match(/^data:image\/svg\+xml([^,]*),(.*)$/i)
  if (!match) return null

  const meta = match[1]
  const payload = match[2]

  if (/;base64/i.test(meta)) {
    try {
      const binary = atob(payload)
      const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
      return new TextDecoder('utf-8').decode(bytes)
    } catch {
      return null
    }
  }

  try {
    return decodeURIComponent(payload)
  } catch {
    return payload
  }
}

/**
 * 判断一个 SVG 是不是「内容图」（而不是装饰性图标）
 *
 * 微信会丢弃所有内联 SVG，所以只要是内容图就应该转成 PNG；
 * 而纯装饰的小图标转成 PNG 只会变成噪点，直接跳过。
 */
export function isContentSvg(
  svg: SVGElement,
  size: { width: number; height: number } | null,
  options: SvgRasterOptions = {}
): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // 1. 图表库（Mermaid 等）留下的标志性特征
  if (svg.getAttribute('aria-roledescription')) return true
  if (svg.getAttribute('data-processed') === 'true') return true

  const marker = `${svg.getAttribute('id') || ''} ${svg.getAttribute('class') || ''}`
  if (/mermaid|flowchart|sequencediagram|classdiagram|statediagram|erdiagram|mindmap|gitgraph|gantt|piechart/i.test(marker)) {
    return true
  }
  if (svg.querySelector('g.node, g.edgePath, g.cluster, g.flowchart-link, g.label, .node, .edgePath, .cluster')) {
    return true
  }

  // 2. 尺寸够大的一律当作内容图
  if (opts.strictContent) return false
  if (size && size.width >= opts.minWidth && size.height >= opts.minHeight) return true

  return false
}

/**
 * 创建 <img> 元素
 */
export function createDiagramImage(dataUri: string, alt = 'mermaid'): HTMLImageElement {
  const img = document.createElement('img')
  img.setAttribute('src', dataUri)
  img.setAttribute('alt', alt)
  img.setAttribute('style', 'max-width:100%;height:auto;display:block;margin:0 auto;')
  return img
}

/**
 * 替换 SVG 所在的代码块外壳
 *
 * 有些平台把渲染好的图表塞在 <pre>/<code> 里（CSDN 的代码块就是这种结构），
 * 不拆掉外壳的话，图片会被当成代码块处理。
 *
 * 返回被替换掉的原始元素，方便之后还原。
 */
function replaceCodeShell(svg: SVGElement, img: HTMLImageElement): Element {
  const pre = svg.closest('pre')
  if (pre) {
    pre.replaceWith(img)
    return pre
  }
  const code = svg.closest('code')
  if (code) {
    code.replaceWith(img)
    return code
  }
  svg.replaceWith(img)
  return svg
}

/**
 * 创建一个用于测量尺寸的隐藏容器
 */
function createMeasureContainer(): HTMLElement {
  const holder = document.createElement('div')
  holder.style.cssText =
    'position:absolute;left:-99999px;top:0;width:1200px;visibility:hidden;pointer-events:none;'
  document.body.appendChild(holder)
  return holder
}

/**
 * 把容器里的矢量图（内联 SVG / SVG data URI 图片）转成 PNG
 *
 * @param container 存放文章内容的容器
 * @param options 光栅化参数
 */
export async function rasterizeSvgContentInContainer(
  container: HTMLElement,
  options: SvgRasterOptions = {}
): Promise<SvgRasterSummary> {
  const summary: SvgRasterSummary = { rendered: 0, failed: 0, errors: [] }
  // 记录还原动作，用于把真实页面 DOM 恢复原样
  const backups: Array<() => void> = []

  // 1. <img src="data:image/svg+xml...">
  const svgImgs = Array.from(container.querySelectorAll('img[src^="data:image/svg"]'))
  for (const img of svgImgs) {
    const dataSrc = img.getAttribute('data-src')
    if (dataSrc) {
      // 懒加载占位符，换成真实地址
      img.setAttribute('src', dataSrc)
      continue
    }

    const svgText = decodeSvgDataUri(img.getAttribute('src') || '')
    if (!svgText) {
      img.remove()
      continue
    }

    try {
      const dataUri = await rasterizeSvgToPng(svgText, options)
      const originalSrc = img.getAttribute('src')
      img.setAttribute('src', dataUri)
      img.setAttribute('alt', img.getAttribute('alt') || 'mermaid')
      backups.push(() => {
        if (originalSrc) img.setAttribute('src', originalSrc)
      })
      summary.rendered++
    } catch (error) {
      summary.failed++
      summary.errors.push(`SVG 图片转换失败: ${(error as Error).message}`)
      logger.error('SVG 图片转换失败:', error)
    }
  }

  // 2. 内联 <svg>
  const svgs = Array.from(container.querySelectorAll('svg'))
  if (svgs.length > 0) {
    const holder = createMeasureContainer()
    try {
      for (const svg of svgs) {
        // 嵌套的 SVG 由最外层处理
        if (svg.parentElement?.closest('svg')) continue

        const size = parseSvgSize(svg.outerHTML)
        if (!isContentSvg(svg, size, options)) continue

        try {
          // 挂到隐藏容器里量尺寸，SVG 用的是百分比宽度时必须有真实布局
          const clone = svg.cloneNode(true) as SVGElement
          holder.appendChild(clone)
          const dataUri = await rasterizeSvgElement(clone, options)
          holder.removeChild(clone)

          const img = createDiagramImage(dataUri)
          const original = replaceCodeShell(svg, img)
          backups.push(() => {
            if (img.parentNode) img.replaceWith(original)
          })
          summary.rendered++
        } catch (error) {
          summary.failed++
          summary.errors.push(`内联 SVG 转换失败: ${(error as Error).message}`)
          logger.error('内联 SVG 转换失败:', error)
        }
      }
    } finally {
      holder.remove()
    }
  }

  if (summary.rendered > 0 || summary.failed > 0) {
    logger.info(`矢量图转换完成: 成功 ${summary.rendered} 个，失败 ${summary.failed} 个`)
  }

  if (backups.length) {
    summary.restore = () => {
      for (const undo of backups.reverse()) {
        try {
          undo()
        } catch (error) {
          logger.warn('还原矢量图失败:', error)
        }
      }
    }
  }

  return summary
}

/**
 * 把 HTML 字符串里的矢量图替换成 PNG 图片
 */
export async function rasterizeSvgContentInHtml(
  html: string,
  options: SvgRasterOptions = {}
): Promise<{ html: string; summary: SvgRasterSummary }> {
  const empty: SvgRasterSummary = { rendered: 0, failed: 0, errors: [] }
  if (!html) return { html, summary: empty }

  const container = document.createElement('div')
  container.innerHTML = html

  const summary = await rasterizeSvgContentInContainer(container, options)
  if (summary.rendered === 0 && summary.failed === 0) return { html, summary }

  return { html: container.innerHTML, summary }
}
