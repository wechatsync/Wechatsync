/**
 * Mermaid 代码块识别
 *
 * 与渲染逻辑分离：本模块不依赖 mermaid 库，可以在 Service Worker 中安全引用，
 * 用于后台判断文章里是否含有 Mermaid 代码块。
 */

/**
 * Mermaid 图表类型声明（用于内容嗅探）
 * 命中任意一个即认为代码块是 Mermaid 源码
 *
 * 注意：mermaid 允许省略方向关键字（`flowchart` 单独一行也是合法流程图），
 * 所以 graph / flowchart 除了「带方向」的形式，还要匹配「独占一行」的形式。
 */
const MERMAID_DIAGRAM_PATTERN =
  /^\s*(?:%%\{[^}]*\}%%\s*)?(?:graph\s+(?:TB|TD|BT|RL|LR)\b|flowchart\s+(?:TB|TD|BT|RL|LR)\b|graph\b[ \t]*\n|flowchart\b[ \t]*\n|sequenceDiagram\b|classDiagram(?:-v2)?\b|stateDiagram(?:-v2)?\b|erDiagram\b|gantt\b|pie\b|journey\b|requirementDiagram\b|gitGraph\b|C4Context\b|quadrantChart\b|zenuml\b|radar-beta\b|xychart-beta\b|block-beta\b|packet-beta\b|architecture-beta\b|sankey-beta\b|timeline\b|mindmap\b|kanban\b|treemap-beta\b|userJourney\b|ishikawa-beta\b|venn-beta\b)/i

/**
 * HTML 字符串粗筛：是否可能含有 Mermaid 代码块
 *
 * CSDN 的代码块既没有 mermaid class，语言标识只出现在正文里（```mermaid），
 * 所以两种特征都要覆盖
 */
const MERMAID_HTML_HINT =
  /```\s*mermaid\b|<(?:pre|code|div|section)\b[^>]*(?:class|data-lang|data-language|data-code-lang)\s*=\s*["'][^"']*\bmermaid\b/i

/**
 * 行号前缀（CSDN 新版代码块会给每一行加行号）
 * 只吃掉行号和紧随其后的一个空格，保留源码缩进
 */
const LINE_NUMBER_PREFIX = /^[ \t]*\d{1,4}[.、):：]?[ \t]/

/** 围栏（允许出现在任意位置，前面可能带行号等噪音） */
const CODE_FENCE_PATTERN = /(`{3,}|~{3,})[ \t]*([^\n`~]*)/

/** 承载代码的容器标签（内容嗅探用） */
const CODE_CONTAINER_PATTERN = /<(pre|code|div|section)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi

export interface MermaidBlock {
  /** 承载 Mermaid 源码的 DOM 元素（替换的目标，通常是 <pre>） */
  element: Element
  /** 提取出的 Mermaid 源码（已去掉 markdown 围栏与行号） */
  source: string
}

export interface RenderedMermaidBlock {
  /** 已渲染成图表的容器元素 */
  element: Element
  /** 容器里的 SVG */
  svg: Element
}

/**
 * 去掉代码块里的行号
 *
 * CSDN 等平台会把代码块的每一行都加上行号（`1  graph TD`），
 * 这些行号会让 Mermaid 解析失败，必须先剥掉。
 * 只有当「带行号的行」占多数时才处理，避免误伤正常的 mermaid 源码。
 */
function stripLineNumbers(text: string): string {
  const lines = text.split('\n')
  if (lines.length < 2) return text

  const numbered = lines.filter((line) => LINE_NUMBER_PREFIX.test(line))
  if (numbered.length < 2 || numbered.length * 2 < lines.length) return text

  return lines.map((line) => line.replace(LINE_NUMBER_PREFIX, '')).join('\n')
}

/**
 * 去掉 markdown 围栏，返回语言标识与正文
 *
 * 围栏不一定在文本开头（前面可能有行号），因此在全文本里搜索
 */
function stripCodeFence(raw: string): { lang: string; body: string } {
  const text = raw.replace(/\r\n/g, '\n')
  const fenceMatch = text.match(CODE_FENCE_PATTERN)

  if (!fenceMatch) {
    return { lang: '', body: stripLineNumbers(text.trim()) }
  }

  const fence = fenceMatch[1]
  const lang = (fenceMatch[2] || '').trim().split(/\s+/)[0].toLowerCase()
  // 去掉结尾的围栏
  const body = text
    .slice((fenceMatch.index || 0) + fenceMatch[0].length)
    .replace(new RegExp(`\\n?\\s*${fence[0]}{${fence.length},}[ \\t]*$`), '')

  return { lang, body: stripLineNumbers(body.trim()) }
}

/**
 * 源码里至少要有两行有效内容才算流程图
 *
 * 只有一行时，多半是正文里顺带提到的关键字（例如 <code>classDiagram</code>），
 * 把它当成流程图去渲染只会得到一句「解析失败」，反而污染同步结果。
 */
function hasDiagramBody(source: string): boolean {
  return source.split('\n').filter((line) => line.trim()).length >= 2
}

/**
 * 从原始文本中提取 Mermaid 源码
 * 不是 Mermaid 时返回 null
 *
 * 兼容两种写法：
 * 1. 带围栏：```mermaid\ngraph TD\n...\n```
 * 2. 无围栏：<div class="mermaid">graph TD ...</div>
 */
export function extractMermaidSource(raw: string): string | null {
  if (!raw || !raw.trim()) return null

  const { lang, body } = stripCodeFence(raw)
  const source = body.trim()

  if (!source) return null
  // 明确标注了其它语言 → 不是 Mermaid
  if (lang && lang !== 'mermaid') return null
  // 没有语言标识 → 靠图表声明嗅探
  if (!lang && (!MERMAID_DIAGRAM_PATTERN.test(source) || !hasDiagramBody(source))) return null

  return source
}

/**
 * 在容器中查找所有 Mermaid 代码块
 * 判定依据：语言标识（class / data-lang）或内容嗅探
 */
export function findMermaidBlocks(container: Element): MermaidBlock[] {
  const candidates = new Set<Element>()

  // 1. 带明确语言标识的元素
  const tagged = container.querySelectorAll(
    [
      '[class*="mermaid" i]',
      '[data-lang="mermaid" i]',
      '[data-language="mermaid" i]',
      '[data-code-lang="mermaid" i]',
      '[class*="language-mermaid" i]',
      '[class*="lang-mermaid" i]',
    ].join(', ')
  )
  tagged.forEach((el) => candidates.add(el))

  // 2. 内容嗅探：CSDN 的代码块既没有 mermaid class，语言标识也只在正文里
  const sniffable = container.querySelectorAll('pre, code, div')
  sniffable.forEach((el) => {
    if (candidates.has(el)) return
    // 只处理叶子节点，避免和内层 pre/code 重复
    if (el.querySelector('pre, code')) return
    // 已经是渲染好的图表（容器里有 svg），交给 SVG 光栅化处理
    if (el.querySelector('svg')) return
    // 行内 <code>（正文里提到的关键字）不是代码块，跳过
    if (el.tagName === 'CODE' && !el.closest('pre')) return
    const source = extractMermaidSource(el.textContent || '')
    if (source) candidates.add(el)
  })

  // 3. 命中的是 <code> 时，替换整个 <pre>，否则代码块的外壳样式会残留
  const targets = new Set<Element>()
  for (const el of candidates) {
    const parent = el.parentElement
    if (el.tagName === 'CODE' && parent && parent.tagName === 'PRE') {
      targets.add(parent)
    } else {
      targets.add(el)
    }
  }

  // 4. 同一块代码可能被 pre 和 code 同时命中，只保留最外层
  const list = Array.from(targets).filter((el) =>
    !Array.from(targets).some((other) => other !== el && other.contains(el))
  )

  const blocks: MermaidBlock[] = []
  for (const element of list) {
    const source = extractMermaidSource(element.textContent || '')
    if (source) blocks.push({ element, source })
  }

  return blocks
}

/**
 * 查找「已经被渲染成图表」的 Mermaid 容器（容器里是 SVG 而不是源码）
 *
 * 部分平台（例如已经在浏览器里渲染过 Mermaid 的编辑器）会把流程图渲染成
 * `<div class="mermaid"><svg>...</svg></div>`，这类内容需要光栅化成图片，
 * 否则会被平台的 SVG 清理规则直接删掉。
 */
export function findRenderedMermaidBlocks(container: Element): RenderedMermaidBlock[] {
  const candidates = container.querySelectorAll(
    [
      '[class*="mermaid" i]',
      '[data-lang="mermaid" i]',
      '[data-language="mermaid" i]',
      '[data-code-lang="mermaid" i]',
    ].join(', ')
  )

  const blocks: RenderedMermaidBlock[] = []
  candidates.forEach((el) => {
    // 容器本身就是 svg 的情况
    const svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg')
    if (svg) blocks.push({ element: el, svg })
  })
  return blocks
}

/**
 * 去掉 HTML 标签，得到纯文本
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
}

/**
 * 解码 HTML 实体（只处理常见的几个，够用即可）
 */
function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    ['&' + 'lt;']: '<',
    ['&' + 'gt;']: '>',
    ['&' + 'quot;']: '"',
    ['&' + 'apos;']: "'",
    ['&' + 'nbsp;']: ' ',
  }
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&(?:lt|gt|quot|apos|nbsp);/g, (m) => named[m] || m)
    .replace(/&/g, '&')
}

/**
 * HTML 字符串里是否可能含有 Mermaid 代码块
 *
 * 这个函数在 Service Worker（无 DOM）里也能用：
 * 1. 先做字符串粗筛（围栏 / mermaid class）
 * 2. 再对代码块做内容嗅探，即使围栏在编辑往返中丢失也能命中
 *
 * 兜底：文章里只要出现 mermaid 字样就返回 true。
 * 判断错了最多多开一次扩展页面（慢一点），
 * 但判断漏了就会让整篇文章的流程图被静默跳过（用户完全看不到原因）。
 */
export function htmlMayContainMermaid(html: string): boolean {
  if (!html) return false
  if (/mermaid/i.test(html)) return true
  if (MERMAID_HTML_HINT.test(html)) return true

  // 内容嗅探：逐个检查代码块容器
  CODE_CONTAINER_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = CODE_CONTAINER_PATTERN.exec(html)) !== null) {
    const text = decodeEntities(stripHtmlTags(match[2]))
    if (extractMermaidSource(text)) return true
  }

  return false
}

/**
 * 统计 HTML 里「仍然是 Mermaid 源码」的代码块数量
 *
 * 用途：预处理完成后做兜底检查。
 * 这里的数字 > 0 就说明有流程图没能转换成图片（退化成了代码块），
 * 必须把数量告诉用户，而不是让流程图静默消失。
 */
export function countMermaidCodeBlocks(html: string): number {
  if (!html) return 0

  let count = 0
  CODE_CONTAINER_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = CODE_CONTAINER_PATTERN.exec(html)) !== null) {
    const text = decodeEntities(stripHtmlTags(match[2]))
    if (extractMermaidSource(text)) count++
  }

  return count
}

/**
 * HTML 里是否含有矢量图（内联 SVG 或 SVG data URI）
 *
 * 微信正文不支持 SVG，会把这些图直接丢掉，
 * 所以含有矢量图时必须先转成 PNG 图片再同步。
 */
export function htmlMayContainSvg(html: string): boolean {
  if (!html) return false
  return /<svg[\s>]/i.test(html) || /data:image\/svg\+xml/i.test(html)
}

/**
 * 统计 HTML 里还剩多少内联 SVG
 *
 * 用途：兜底检查。预处理之后还有 SVG，说明有图没能转成图片，
 * 微信会把它们丢掉，用户看到的就是空白缺口，必须提示用户。
 */
export function countInlineSvg(html: string): number {
  if (!html) return 0
  const matches = html.match(/<svg[\s>]/gi)
  return matches ? matches.length : 0
}
