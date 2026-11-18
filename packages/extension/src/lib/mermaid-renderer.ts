/**
 * Mermaid 图表渲染器
 *
 * 背景：
 * CSDN 等平台允许在文章里写 Mermaid 流程图（```mermaid 围栏代码块），
 * 但微信公众号正文只接受 jpg/png/gif 图片，无法直接渲染 Mermaid。
 * 本模块把 Mermaid 源码渲染成 PNG，并以 <img> 替换掉原代码块，
 * 让后续的图片上传流程（processImages）把它转存到微信 CDN。
 *
 * 运行位置：需要 DOM 的扩展页面（preprocessor 页）。
 * Service Worker 没有 DOM，不能调用本模块。
 */
import { createLogger } from './logger'
import { findMermaidBlocks, findRenderedMermaidBlocks } from './mermaid-detect'
import {
  createDiagramImage,
  rasterizeSvgElement,
  rasterizeSvgToPng,
} from './svg-rasterizer'

const logger = createLogger('Mermaid')

export interface MermaidRenderOptions {
  /** 像素密度，默认 2（高清图，微信端缩放显示仍然清晰） */
  scale?: number
  /** 最大宽度（CSS 像素），超出则等比缩小，默认 1200 */
  maxWidth?: number
  /** 画布背景色，默认白色（PNG 需要不透明背景，微信不支持透明 PNG 混排） */
  backgroundColor?: string
  /** 主题，默认 default */
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base'
}

export interface MermaidRenderSummary {
  /** 成功渲染的数量 */
  rendered: number
  /** 渲染失败（保留原代码块）的数量 */
  failed: number
  /** 失败原因（用于把问题暴露给用户，而不是静默跳过） */
  errors: string[]
}

const DEFAULT_OPTIONS: Required<MermaidRenderOptions> = {
  scale: 2,
  maxWidth: 1200,
  backgroundColor: '#ffffff',
  theme: 'default',
}

/**
 * 渲染结果缓存
 * 同一篇文章可能同步到多个平台，缓存避免重复渲染
 */
const renderCache = new Map<string, string>()

interface MermaidApi {
  initialize(config: Record<string, unknown>): void
  render(id: string, text: string): Promise<{ svg: string }>
}

/**
 * mermaid 库按需加载
 * mermaid 内部对各图表类型使用动态 import，Vite 会拆成独立 chunk，
 * 只有真正用到某图表时才会下载对应代码
 */
let mermaidPromise: Promise<MermaidApi> | null = null

function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
      .then((mod) => {
        const api = ((mod as any).default ?? mod) as MermaidApi
        api.initialize({
          startOnLoad: false,
          // strict 会清洗标签里的 HTML，避免注入
          securityLevel: 'strict',
          theme: DEFAULT_OPTIONS.theme,
          // 必须关闭 htmlLabels：开启后 mermaid 使用 <foreignObject>，
          // Chrome 会因此污染 canvas，导致 toDataURL 抛出 SecurityError
          htmlLabels: false,
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
        })
        return api
      })
      .catch((error) => {
        mermaidPromise = null
        throw error
      })
  }
  return mermaidPromise
}

let renderCounter = 0

/**
 * 清理 mermaid 渲染时在 body 里留下的临时节点
 */
function cleanupRenderNodes(id: string): void {
  document.getElementById(`d${id}`)?.remove()
  document.getElementById(id)?.remove()
}

/**
 * 把 Mermaid 源码渲染成 SVG（失败会重试一次）
 */
async function renderToSvg(source: string): Promise<string> {
  const mermaid = await loadMermaid()

  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    const id = `wechatsync-mermaid-${++renderCounter}`
    try {
      const result = await mermaid.render(id, source)
      cleanupRenderNodes(id)
      return result.svg
    } catch (error) {
      lastError = error
      cleanupRenderNodes(id)
      logger.warn(`Mermaid 渲染失败（第 ${attempt} 次尝试）:`, error)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/**
 * 把 Mermaid 源码渲染成 PNG data URI
 */
export async function renderMermaidToPngDataUri(
  source: string,
  options: MermaidRenderOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cacheKey = `${opts.scale}|${opts.maxWidth}|${opts.backgroundColor}|${opts.theme}|${source}`

  const cached = renderCache.get(cacheKey)
  if (cached) return cached

  const svg = await renderToSvg(source)
  const dataUri = await rasterizeSvgToPng(svg, opts)
  renderCache.set(cacheKey, dataUri)

  return dataUri
}

/**
 * 把「已经渲染成 SVG」的 Mermaid 图表光栅化成 PNG
 *
 * 页面本身已经渲染好的流程图（<div class="mermaid"><svg>…</svg></div>）
 * 同样需要转成图片，否则会被平台的 SVG 清理规则直接删掉。
 */
export async function rasterizeMermaidSvg(
  svgElement: Element,
  options: MermaidRenderOptions = {}
): Promise<string> {
  return rasterizeSvgElement(svgElement, options)
}

/**
 * 取源码的首行，作为失败时的定位信息
 */
function describeSource(source: string): string {
  const firstLine = source.split('\n').map((l) => l.trim()).find(Boolean) || ''
  return firstLine.slice(0, 60)
}

/**
 * 把容器里的 Mermaid 代码块替换成 PNG 图片
 * 渲染失败的代码块保持原样（降级为普通代码块），失败原因记入 summary.errors
 */
export async function replaceMermaidWithImages(
  container: Element,
  options: MermaidRenderOptions = {}
): Promise<MermaidRenderSummary> {
  const summary: MermaidRenderSummary = { rendered: 0, failed: 0, errors: [] }

  // 1. 已经渲染成 SVG 的图表：直接光栅化
  for (const block of findRenderedMermaidBlocks(container)) {
    try {
      const dataUri = await rasterizeMermaidSvg(block.svg, options)
      block.element.replaceWith(createDiagramImage(dataUri))
      summary.rendered++
    } catch (error) {
      summary.failed++
      summary.errors.push(`已渲染的 Mermaid 图表转换失败: ${(error as Error).message}`)
      logger.error('已渲染的 Mermaid 图表转换失败:', error)
    }
  }

  // 2. Mermaid 源码代码块：渲染成图片
  const blocks = findMermaidBlocks(container)
  for (const block of blocks) {
    try {
      const dataUri = await renderMermaidToPngDataUri(block.source, options)
      block.element.replaceWith(createDiagramImage(dataUri))
      summary.rendered++
    } catch (error) {
      summary.failed++
      summary.errors.push(
        `Mermaid 渲染失败: ${(error as Error).message}（代码块首行：${describeSource(block.source)}）`
      )
      logger.error('Mermaid 渲染失败，保留原代码块:', error)
    }
  }

  if (blocks.length > 0 || summary.rendered > 0) {
    logger.info(
      `Mermaid 渲染完成: 成功 ${summary.rendered} 个，失败 ${summary.failed} 个`
    )
  }

  return summary
}

/**
 * 把 HTML 字符串里的 Mermaid 代码块替换成 PNG 图片
 * 返回替换后的 HTML 与渲染统计
 */
export async function renderMermaidInHtml(
  html: string,
  options: MermaidRenderOptions = {}
): Promise<{ html: string; summary: MermaidRenderSummary }> {
  const empty: MermaidRenderSummary = { rendered: 0, failed: 0, errors: [] }
  if (!html) return { html, summary: empty }

  const container = document.createElement('div')
  // 挂到 document 上，保证 mermaid 的尺寸测量和已渲染 SVG 的
  // getBoundingClientRect 能拿到真实值
  container.style.cssText =
    'position:absolute;left:-99999px;top:0;width:1200px;visibility:hidden;'
  document.body.appendChild(container)

  try {
    container.innerHTML = html

    const summary = await replaceMermaidWithImages(container, options)
    if (summary.rendered === 0) return { html, summary }

    return { html: container.innerHTML, summary }
  } finally {
    container.remove()
  }
}
