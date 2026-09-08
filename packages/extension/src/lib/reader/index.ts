/**
 * 文章提取器
 * 使用 Safari ReaderArticleFinder 和 Defuddle 并行提取，择优选用
 *
 * 策略: 两者都执行，根据 score 选最佳结果，<article> 标签作为兜底
 *
 * 注意: reader.js 通过 manifest.json 作为 content_scripts 预先加载
 * 它会在全局作用域注入 ReaderArticleFinder 类
 */
import Defuddle from 'defuddle'
import { createLogger } from '../logger'

const logger = createLogger('Reader')

/**
 * 提取结果接口
 */
export interface ReaderResult {
  /** 文章标题 */
  title: string
  /** 文章 HTML 内容 */
  content: string
  /** 纯文本内容 */
  textContent?: string
  /** 文章摘要/描述 */
  excerpt?: string
  /** 封面图 */
  leadingImage?: string
  /** 主图 */
  mainImage?: string
  /** 作者 */
  byline?: string
  /** 站点名称 */
  siteName?: string
  /** 文章方向 (ltr/rtl) */
  dir?: string
  /** 是否从左到右 */
  isLTR?: boolean
  /** 下一页 URL */
  nextPage?: string
  /** 页码 */
  pageNumber?: number
  /** 使用的提取器 */
  extractor: 'safari-reader' | 'defuddle' | 'readability' | 'article-tag'
}

/**
 * Safari ReaderArticleFinder 全局类型
 */
declare global {
  class ReaderArticleFinder {
    constructor(doc: Document)
    isReaderModeAvailable(): boolean | null
    adoptableArticle(force?: boolean): HTMLElement | null
    articleTitle(): string | undefined
    articleTextContent(): string | undefined
    pageDescription(): string | undefined
    mainImageNode(): HTMLImageElement | null
    leadingImage: HTMLImageElement | null
    pageNumber: number
    nextPageURL(): string | null
    articleIsLTR(): boolean
  }

  class Readability {
    constructor(doc: Document, options?: object)
    parse(): {
      title: string
      content: string
      textContent: string
      excerpt: string
      byline: string | null
      siteName: string | null
      dir: string | null
    } | null
  }
}

/**
 * 获取图片 URL
 */
function getImageUrl(node: HTMLImageElement | null): string | undefined {
  if (!node) return undefined

  const src = node.getAttribute('data-src') || node.src
  if (src && src.startsWith('data:image')) return undefined

  return src || undefined
}

/**
 * 处理懒加载图片
 */
function processLazyImages(container: HTMLElement): void {
  const images = container.querySelectorAll('img')

  images.forEach((img) => {
    // 按优先级查找真实图片 URL
    const realSrc =
      img.getAttribute('data-src') ||
      img.getAttribute('data-original') ||
      img.getAttribute('data-actualsrc') ||
      img.getAttribute('_src') ||
      img.src

    // 跳过 data URL (SVG 占位符等)
    if (realSrc && !realSrc.startsWith('data:image/svg')) {
      img.setAttribute('src', realSrc)
    }

    // 清理懒加载属性
    img.removeAttribute('data-src')
    img.removeAttribute('data-original')
    img.removeAttribute('data-actualsrc')
    img.removeAttribute('_src')
    img.removeAttribute('data-ratio')
    img.removeAttribute('data-w')
    img.removeAttribute('data-type')
    img.removeAttribute('data-s')
  })
}

/**
 * 补全相对链接
 */
function processLinks(container: HTMLElement): void {
  container.querySelectorAll('a').forEach((a) => {
    a.setAttribute('href', a.href)
    if (a.target === '' || a.target.toLowerCase() === '_self') {
      a.setAttribute('target', '_top')
    }
  })

  container.querySelectorAll('img').forEach((img) => {
    img.setAttribute('src', img.src)
  })
}

/**
 * 元素备份信息
 */
interface ElementBackup {
  element: Element
  originalHTML: string
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function detectCodeLang(pre: Element): string {
  const elements = [pre, pre.querySelector('code')].filter(Boolean) as Element[]

  for (const el of elements) {
    const attrLang =
      el.getAttribute('data-lang') ||
      el.getAttribute('data-language') ||
      el.getAttribute('lang') ||
      ''
    if (attrLang) return attrLang.trim().toLowerCase()

    const className = el.className || ''
    const patterns = [
      /(?:language|lang|highlight)-([a-zA-Z0-9+#._-]+)/,
      /\bhljs\s+([a-zA-Z0-9+#._-]+)/,
      /\b(javascript|typescript|python|java|cpp|c|csharp|go|rust|ruby|php|swift|kotlin|scala|sql|html|css|json|xml|yaml|markdown|bash|shell|powershell)\b/i,
    ]
    for (const pattern of patterns) {
      const match = className.match(pattern)
      if (match) return match[1].toLowerCase()
    }
  }

  return ''
}

/**
 * 临时简化页面中的代码块，返回备份以便恢复
 * 使用真实 DOM 提取代码（保留换行）
 */
function backupAndReplaceCodeBlocks(): ElementBackup[] {
  const backups: ElementBackup[] = []

  // 行号元素选择器
  const GUTTER_SELECTORS = [
    '.gutter',
    '.line-numbers-rows',
    '.hljs-ln-numbers',
    '.code-snippet__line-index',
    '[class*="line-number"]',
    '[class*="lineNumber"]',
  ].join(', ')

  document.querySelectorAll('pre').forEach((pre) => {
    // 临时隐藏行号元素
    const gutterEls = pre.querySelectorAll(GUTTER_SELECTORS)
    gutterEls.forEach(el => (el as HTMLElement).style.display = 'none')

    // 优先从 code 元素提取
    const code = pre.querySelector('code')
    const targetEl = (code || pre) as HTMLElement

    // 检测 code 内是否有块级嵌套（非法结构，会导致 innerText 产生额外换行）
    // - div: expressive-code 等
    // - code[style*="display: block"]: 微信代码块（多个 block code）
    const hasNestedBlock = code && (
      code.querySelector('div') ||
      code.querySelector('code[style*="display: block"], code[style*="display:block"]')
    )

    const text = targetEl.innerText

    // 恢复行号显示
    gutterEls.forEach(el => (el as HTMLElement).style.display = '')

    // 跳过空代码块
    if (!text.trim()) return

    // 清理首尾空白
    let cleanedText = text.replace(/^\n+/, '').replace(/\n+$/, '')

    // 如果有非法嵌套的块级元素，清理连续空行（块级边界会产生额外换行）
    if (hasNestedBlock) {
      cleanedText = cleanedText.replace(/\n{2,}/g, '\n')
    }

    logger.debug('[Reader CodeBlock] original:', pre.innerHTML.slice(0, 100))
    logger.debug('[Reader CodeBlock] cleaned text:', cleanedText.slice(0, 100))

    backups.push({
      element: pre,
      originalHTML: pre.innerHTML,
    })

    const lang = detectCodeLang(pre)

    // 替换为纯文本，同时保留语言给后续 HTML→Markdown 转换使用。
    pre.innerHTML = `<code>${escapeHtml(cleanedText)}</code>`
    if (lang) {
      pre.setAttribute('data-lang', lang)
      pre.className = `language-${lang}`
    }
  })

  return backups
}

/**
 * 恢复页面中被简化的代码块
 */
function restoreCodeBlocks(backups: ElementBackup[]): void {
  backups.forEach(({ element, originalHTML }) => {
    element.innerHTML = originalHTML
  })
}

// KaTeX 备份信息（类型别名）
type KatexBackup = ElementBackup

/**
 * Unicode 希腊字母转 LaTeX 命令
 * 某些渲染器（如 codecogs）需要标准 LaTeX 命令，不识别 Unicode 字符
 */
function unicodeToLatex(latex: string): string {
  const greekMap: Record<string, string> = {
    // 大写希腊字母
    'Α': 'A', 'Β': 'B', 'Γ': '\\Gamma', 'Δ': '\\Delta',
    'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': '\\Theta',
    'Ι': 'I', 'Κ': 'K', 'Λ': '\\Lambda', 'Μ': 'M',
    'Ν': 'N', 'Ξ': '\\Xi', 'Ο': 'O', 'Π': '\\Pi',
    'Ρ': 'P', 'Σ': '\\Sigma', 'Τ': 'T', 'Υ': '\\Upsilon',
    'Φ': '\\Phi', 'Χ': 'X', 'Ψ': '\\Psi', 'Ω': '\\Omega',
    // 小写希腊字母
    'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
    'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
    'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
    'ν': '\\nu', 'ξ': '\\xi', 'ο': 'o', 'π': '\\pi',
    'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon',
    'φ': '\\phi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
    // 变体
    'ϕ': '\\varphi', 'ϵ': '\\varepsilon', 'ϑ': '\\vartheta',
    'ϖ': '\\varpi', 'ϱ': '\\varrho', 'ς': '\\varsigma',
  }

  return latex.replace(/[Α-Ωα-ωϕϵϑϖϱς]/g, (char) => greekMap[char] || char)
}

/**
 * 提取 LaTeX 内容
 * 优先从 annotation 标签提取，回退到 katex-mathml textContent
 */
function extractLatex(container: Element): string | null {
  let latex: string | null = null

  // 优先从 annotation 标签提取（标准 KaTeX）
  const annotation = container.querySelector('annotation[encoding="application/x-tex"]')
  if (annotation?.textContent) {
    latex = annotation.textContent.trim()
  } else {
    // 回退：从 katex-mathml 的 textContent 提取（CSDN 等无 annotation 的情况）
    // textContent 结构通常是多行：前面是 MathML 分散字符，后面是完整 LaTeX
    const mathml = container.querySelector('.katex-mathml')
    if (mathml?.textContent) {
      const text = mathml.textContent.trim()

      // 按行分割，从后往前找包含 LaTeX 特殊字符的行
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]
        // 找包含 \ 或 ^_ 的行（完整 LaTeX 公式）
        if (line.includes('\\') || /[\^_{}]/.test(line)) {
          latex = line
          break
        }
      }

      // 如果没找到，取最后一行
      if (!latex && lines.length > 0) {
        latex = lines[lines.length - 1]
      }
    }
  }

  // 转换 Unicode 希腊字母为 LaTeX 命令
  return latex ? unicodeToLatex(latex) : null
}

/**
 * 临时替换页面中的 KaTeX 为纯文本，返回备份以便恢复
 * 这样 Reader 处理时 KaTeX 已经是纯文本，不会被破坏
 */
function backupAndReplaceKatex(): KatexBackup[] {
  const backups: KatexBackup[] = []

  // 处理块级公式 (.katex-display 或 .katex--display)
  document.querySelectorAll('.katex-display, .katex--display').forEach((katexDisplay) => {
    const latex = extractLatex(katexDisplay)
    if (latex) {
      backups.push({
        element: katexDisplay,
        originalHTML: katexDisplay.innerHTML,
      })
      katexDisplay.innerHTML = `$$${latex}$$`
    }
  })

  // 处理 CSDN inline 公式 (.katex--inline) - 作为整体处理
  document.querySelectorAll('.katex--inline').forEach((katexInline) => {
    const latex = extractLatex(katexInline)
    if (latex) {
      backups.push({
        element: katexInline,
        originalHTML: katexInline.innerHTML,
      })
      katexInline.innerHTML = `$${latex}$`
    }
  })

  // 处理行内公式 (.katex，排除上面已处理的)
  document.querySelectorAll('.katex:not(.katex-display .katex):not(.katex--display .katex):not(.katex--inline .katex)').forEach((katex) => {
    const latex = extractLatex(katex)
    if (latex) {
      backups.push({
        element: katex,
        originalHTML: katex.innerHTML,
      })
      katex.innerHTML = `$${latex}$`
    }
  })

  return backups
}

/**
 * 恢复页面中被替换的 KaTeX 元素
 */
function restoreKatex(backups: KatexBackup[]): void {
  backups.forEach(({ element, originalHTML }) => {
    element.innerHTML = originalHTML
  })
}

// ========== 评分系统 ==========

/**
 * 对提取结果进行质量评分
 * 分数越高，提取质量越好
 */
function scoreResult(result: ReaderResult): number {
  let score = 0
  const text = result.textContent || ''
  const html = result.content || ''

  // 1. 内容长度 — 太短说明提取不完整，太长说明带了噪音
  const len = text.length
  if (len > 200) score += 20
  if (len > 500) score += 10
  if (len > 50000) score -= 10  // 可能带了评论/侧栏

  // 2. 文本密度 — text/html 比值越高，噪音越少
  const density = html.length > 0 ? text.length / html.length : 0
  score += Math.min(Math.round(density * 50), 30)

  // 3. 结构化内容 — 有标题/段落/代码块说明提取质量好
  if (/<h[1-3]/i.test(html)) score += 10
  if (/<pre/i.test(html)) score += 5
  if (/<img/i.test(html)) score += 5

  // 4. 元数据完整度
  if (result.title && result.title !== document.title) score += 5
  if (result.excerpt) score += 3
  if (result.byline) score += 2

  return score
}

// ========== 提取器 ==========

/**
 * 使用 Safari ReaderArticleFinder 提取
 * 需要在已做好代码块/KaTeX 预处理的页面上调用
 */
function extractWithSafariReader(): ReaderResult | null {
  try {
    const reader = new ReaderArticleFinder(document)

    if (!reader.isReaderModeAvailable()) {
      return null
    }

    const articleNode = reader.adoptableArticle(true)
    if (!articleNode) {
      return null
    }

    // 克隆并处理
    const cloned = articleNode.cloneNode(true) as HTMLElement
    processLazyImages(cloned)
    processLinks(cloned)

    return {
      title: reader.articleTitle() || document.title,
      content: cloned.outerHTML,
      textContent: reader.articleTextContent(),
      excerpt: reader.pageDescription(),
      leadingImage: getImageUrl(reader.leadingImage),
      mainImage: getImageUrl(reader.mainImageNode()),
      isLTR: reader.articleIsLTR(),
      nextPage: reader.nextPageURL() || undefined,
      pageNumber: reader.pageNumber,
      extractor: 'safari-reader',
    }
  } catch (e) {
    logger.error('Safari ReaderArticleFinder error:', e)
    return null
  }
}

/**
 * 使用 Defuddle 提取
 * 需要在已做好代码块/KaTeX 预处理的页面上调用
 */
function extractWithDefuddle(): ReaderResult | null {
  try {
    // Defuddle 需要克隆的 document（此时代码块已是纯文本）
    const docClone = document.cloneNode(true) as Document
    // 移除插件注入的 UI 元素（loading 遮罩、悬浮按钮、编辑器等）
    docClone.querySelectorAll('[data-wechatsync-ui]').forEach(el => el.remove())
    const defuddle = new Defuddle(docClone, {
      // 关闭 standardize，我们有自己的代码块/KaTeX 预处理
      standardize: false,
      url: window.location.href,
    })
    const result = defuddle.parse()

    if (!result.content) {
      return null
    }

    // 处理内容中的图片和链接
    const container = document.createElement('div')
    container.innerHTML = result.content
    processLazyImages(container)
    processLinks(container)

    // 提取 textContent
    const textContent = container.textContent || undefined

    // 获取首图
    const firstImg = container.querySelector('img')
    const leadingImage = firstImg?.src || result.image || undefined

    return {
      title: result.title || document.title,
      content: container.innerHTML,
      textContent,
      excerpt: result.description || undefined,
      byline: result.author || undefined,
      siteName: result.site || undefined,
      leadingImage,
      mainImage: leadingImage,
      extractor: 'defuddle',
    }
  } catch (e) {
    logger.error('Defuddle error:', e)
    return null
  }
}

/**
 * 使用 Mozilla Readability 提取
 * 需要在已做好代码块/KaTeX 预处理的页面上调用
 */
function extractWithReadability(): ReaderResult | null {
  try {
    // Readability 需要克隆的 document（此时代码块已是纯文本）
    const docClone = document.cloneNode(true) as Document
    docClone.querySelectorAll('[data-wechatsync-ui]').forEach(el => el.remove())
    const reader = new Readability(docClone)
    const article = reader.parse()

    if (!article) {
      return null
    }

    // 处理内容中的图片
    const container = document.createElement('div')
    container.innerHTML = article.content
    processLazyImages(container)
    processLinks(container)

    // 获取首图
    const firstImg = container.querySelector('img')
    const leadingImage = firstImg?.src || undefined

    return {
      title: article.title || document.title,
      content: container.innerHTML,
      textContent: article.textContent,
      excerpt: article.excerpt,
      byline: article.byline || undefined,
      siteName: article.siteName || undefined,
      dir: article.dir || undefined,
      leadingImage,
      mainImage: leadingImage,
      extractor: 'readability',
    }
  } catch (e) {
    logger.error('Readability error:', e)
    return null
  }
}

/**
 * 使用 <article> 标签提取
 * 需要在已做好代码块/KaTeX 预处理的页面上调用
 */
function extractWithArticleTag(): ReaderResult | null {
  const articleEl = document.querySelector('article')
  if (!articleEl) {
    return null
  }

  try {
    const cloned = articleEl.cloneNode(true) as HTMLElement
    processLazyImages(cloned)
    processLinks(cloned)

    const firstImg = cloned.querySelector('img')
    const leadingImage = firstImg?.src || undefined

    const description = document.querySelector('meta[name="description"]')?.getAttribute('content')

    return {
      title: document.title,
      content: cloned.outerHTML,
      textContent: cloned.textContent || undefined,
      excerpt: description || undefined,
      leadingImage,
      mainImage: leadingImage,
      extractor: 'article-tag',
    }
  } catch (e) {
    logger.error('ArticleTag error:', e)
    return null
  }
}

/**
 * 提取文章
 * Safari Reader、Defuddle、Readability 并行执行，按 score 择优；<article> 标签兜底
 */
export function extractArticle(): ReaderResult | null {
  // 统一做一次代码块/KaTeX 预处理
  const codeBlockBackup = backupAndReplaceCodeBlocks()
  const katexBackup = backupAndReplaceKatex()

  try {
    // 并行执行三个提取器，按 score 择优
    const safariResult = extractWithSafariReader()
    const defuddleResult = extractWithDefuddle()
    const readabilityResult = extractWithReadability()

    // 恢复原始页面
    restoreKatex(katexBackup)
    restoreCodeBlocks(codeBlockBackup)

    // 收集所有有效结果，按 score 排序择优
    const candidates: { result: ReaderResult; score: number }[] = []
    if (safariResult) candidates.push({ result: safariResult, score: scoreResult(safariResult) })
    if (defuddleResult) candidates.push({ result: defuddleResult, score: scoreResult(defuddleResult) })
    if (readabilityResult) candidates.push({ result: readabilityResult, score: scoreResult(readabilityResult) })

    if (candidates.length > 0) {
      // 打印所有候选分数
      const scoreLog = candidates.map(c => `${c.result.extractor}=${c.score}`).join(', ')
      logger.debug(`Score: ${scoreLog}`)

      candidates.sort((a, b) => b.score - a.score)
      logger.debug(`Winner: ${candidates[0].result.extractor}`)
      return candidates[0].result
    }

    // 全部失败 → 兜底 <article> 标签
    const articleTagResult = extractWithArticleTag()
    if (articleTagResult) {
      logger.debug('Extracted with <article> tag (fallback)')
      return articleTagResult
    }

    logger.debug('No article found')
    return null
  } catch (e) {
    // 确保异常时也恢复页面
    restoreKatex(katexBackup)
    restoreCodeBlocks(codeBlockBackup)
    logger.error('extractArticle error:', e)
    return null
  }
}

/**
 * 检查是否有可提取的文章
 */
export function isArticleAvailable(): boolean {
  try {
    // 快速检查 Safari Reader
    const reader = new ReaderArticleFinder(document)
    if (reader.isReaderModeAvailable()) {
      return true
    }
  } catch (e) {
    // 忽略
  }

  // Defuddle 没有轻量级的 isAvailable 检查，跳过

  // 检查 <article> 标签
  return !!document.querySelector('article')
}
