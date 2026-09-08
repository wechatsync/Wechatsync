/**
 * Turndown HTML→Markdown 转换工具
 *
 * 基于 turndown 库，添加表格和代码块扩展规则
 * 移植自旧版 @wechatsync/drivers/tools/turnDownExtend.js
 *
 * 架构说明:
 * - htmlToMarkdownNative: 使用原生 DOM，适用于 Content Script（推荐）
 * - htmlToMarkdown: 使用正则转换，适用于 Service Worker（回退方案）
 */

import TurndownService from 'turndown'
import { createLogger } from './logger'

const logger = createLogger('Turndown')

// ============ 源平台链接清理规则 ============

/** 需要去除的站内链接域名（去掉 <a> 只保留文本） */
export const SOURCE_LINK_REMOVE_DOMAINS = [
  'zhida.zhihu.com',
]

/** 跳转中转规则：domain → 真实 URL 所在的 query 参数名 */
export const SOURCE_LINK_REDIRECT_RULES: Array<{ domain: string; param: string }> = [
  { domain: 'link.zhihu.com', param: 'target' },
]

// ============ HTML 实体解码工具 ============

/**
 * 完整的 HTML 实体解码（用于代码块提取）
 * 处理：命名实体、十进制实体、十六进制实体、双重编码
 */
function decodeHtmlEntities(text: string): string {
  let result = text

  // 1. 先处理双重编码（如 &amp;lt; → &lt;）
  // 最多处理 3 层嵌套
  for (let i = 0; i < 3; i++) {
    const prev = result
    result = result.replace(/&amp;/g, '&')
    if (prev === result) break
  }

  // 2. 解码十六进制实体 &#xNN; 或 &#XNN;
  result = result.replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  // 3. 解码十进制实体 &#NN;
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 10))
  })

  // 4. 解码常用命名实体
  const namedEntities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&#039;': "'",
    '&nbsp;': ' ',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&hellip;': '\u2026',
  }

  for (const [entity, char] of Object.entries(namedEntities)) {
    result = result.split(entity).join(char)
  }

  return result
}

/**
 * 已知的 HTML 标签白名单（可能出现在代码块中的格式化标签）
 * 只移除这些标签，避免误删代码中的泛型语法如 List<String>
 */
const KNOWN_HTML_TAGS = [
  // 文本格式化
  'span', 'em', 'strong', 'b', 'i', 'u', 's', 'strike', 'del', 'ins', 'mark',
  'sub', 'sup', 'small', 'big', 'font', 'a',
  // 代码相关
  'code', 'pre', 'kbd', 'samp', 'var', 'tt',
  // 块级元素
  'div', 'p', 'section', 'article', 'header', 'footer', 'aside', 'nav',
  'main', 'figure', 'figcaption', 'blockquote', 'address',
  // 列表
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // 表格
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // 换行/分隔
  'br', 'hr', 'wbr',
  // 其他
  'abbr', 'acronym', 'cite', 'dfn', 'q', 'time', 'ruby', 'rt', 'rp',
  'bdi', 'bdo', 'data', 'meter', 'progress', 'output', 'details', 'summary',
  // 微信特殊标签
  'mpvoice', 'mpprofile', 'qqmusic', 'mpcps',
]

/**
 * 从 HTML 中安全提取代码文本
 *
 * 策略：
 * 1. 先用占位符保护 HTML 实体编码的 < > （如 &lt; &gt;）
 * 2. 只移除已知的 HTML 标签（白名单），保留代码中的泛型语法
 * 3. 恢复占位符并解码所有 HTML 实体
 */
function extractCodeText(html: string): string {
  const LT_PLACEHOLDER = '\x00__CODE_LT__\x00'
  const GT_PLACEHOLDER = '\x00__CODE_GT__\x00'

  let text = html

  // 1. 保护所有表示 < > 的 HTML 实体（它们是代码内容，不是标签）
  // 命名实体
  text = text.replace(/&lt;/gi, LT_PLACEHOLDER)
  text = text.replace(/&gt;/gi, GT_PLACEHOLDER)
  // 十进制实体 &#60; &#62;
  text = text.replace(/&#0*60;/gi, LT_PLACEHOLDER)
  text = text.replace(/&#0*62;/gi, GT_PLACEHOLDER)
  // 十六进制实体 &#x3C; &#x3E;
  text = text.replace(/&#x0*3[cC];/gi, LT_PLACEHOLDER)
  text = text.replace(/&#x0*3[eE];/gi, GT_PLACEHOLDER)

  // 2. 只移除已知的 HTML 标签（白名单方式）
  // 这样可以保留代码中的泛型语法如 List<String>, Map<K, V> 等
  const tagPattern = KNOWN_HTML_TAGS.join('|')
  // 匹配开标签: <tagname ...> 或自闭合 <tagname ... />
  text = text.replace(new RegExp(`<(${tagPattern})\\b[^>]*\\/?>`, 'gi'), '')
  // 匹配闭标签: </tagname>
  text = text.replace(new RegExp(`<\\/(${tagPattern})>`, 'gi'), '')

  // 3. 恢复占位符为实际的 < > 字符
  text = text.replace(new RegExp(LT_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<')
  text = text.replace(new RegExp(GT_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '>')

  // 4. 解码剩余的 HTML 实体
  text = decodeHtmlEntities(text)

  return text
}

/**
 * 修复代码块中未转义的 < 字符
 * 在 DOM 解析之前调用，防止浏览器将 < 误认为标签开始而截断内容
 *
 * 策略：在 <pre> 和 <code> 标签内，将看起来不像 HTML 标签的 < 转义为 &lt;
 */
export function fixUnescapedLtInCode(html: string): string {
  // 处理 <pre>...</pre> 块
  let result = html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (_match, attrs, content) => {
    const fixedContent = escapeNonTagLt(content)
    return `<pre${attrs}>${fixedContent}</pre>`
  })

  // 处理独立的 <code>...</code> 块（不在 pre 内的）
  result = result.replace(/<code([^>]*)>([\s\S]*?)<\/code>/gi, (_match, attrs, content) => {
    const fixedContent = escapeNonTagLt(content)
    return `<code${attrs}>${fixedContent}</code>`
  })

  return result
}

/**
 * 转义不是 HTML 标签的 < 字符
 * HTML 标签的特征：< 后紧跟字母或 /
 */
function escapeNonTagLt(content: string): string {
  // 匹配 < 后面不是字母、/ 或 ! 的情况（不是有效标签开始）
  // 例如：< 5, < =, <=, < b (空格后字母)
  return content.replace(/<(?![a-zA-Z\/!])/g, '&lt;')
}

/**
 * 从 HTML 代码块中提取纯文本（更安全的方式）
 * 先处理换行标签，再提取文本
 * @exported 供其他模块使用
 */
export function extractCodeFromHtml(html: string): string {
  let text = html
    // 保留换行标签的换行效果
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    // 移除 code 标签但保留内容
    .replace(/<\/?code[^>]*>/gi, '')

  // 提取代码文本（处理实体和标签）
  text = extractCodeText(text)

  return text.trim()
}

/**
 * 转换选项
 */
export interface TurndownOptions {
  /** 标题样式: setext (===) 或 atx (#) */
  headingStyle?: 'setext' | 'atx'
  /** 水平线样式 */
  hr?: string
  /** 粗体分隔符 */
  bulletListMarker?: '-' | '+' | '*'
  /** 代码块样式 */
  codeBlockStyle?: 'indented' | 'fenced'
  /** 代码块围栏符号 */
  fence?: '```' | '~~~'
  /** 强调分隔符 */
  emDelimiter?: '_' | '*'
  /** 粗体分隔符 */
  strongDelimiter?: '__' | '**'
  /** 链接样式 */
  linkStyle?: 'inlined' | 'referenced'
  /** 链接引用样式 */
  linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut'
}

/**
 * 规范化单元格内容
 * markdown 表格要求每行单元格在同一行，且 `|` 需转义
 * - 去首尾空白
 * - 转义管道符
 * - 换行 → <br>（保留视觉换行；CSDN/标准 markdown 渲染器在表格单元格内支持 <br>）
 * - 合并多余空白
 */
function normalizeCellContent(content: string): string {
  let result = content.replace(/^\s+|\s+$/g, '')
  result = result.replace(/\|/g, '\\|')
  result = result.replace(/\s*\r?\n\s*/g, '<br>')
  result = result.replace(/[ \t]{2,}/g, ' ')
  return result
}

/**
 * 从 pre/code 元素的属性中提取代码语言。
 * 多平台页面会把语言放在 data-lang、class、data-language 或 CSDN 的 language-* class 中。
 */
function detectCodeLanguage(pre: Element): string {
  const elements = [pre, pre.querySelector('code')].filter(Boolean) as Element[]

  for (const el of elements) {
    const attrLanguage =
      el.getAttribute('data-lang') ||
      el.getAttribute('data-language') ||
      el.getAttribute('lang') ||
      ''
    if (attrLanguage) return attrLanguage

    const className = el.className || ''
    const lang = extractLangFromClass(className)
    if (lang) return lang
  }

  return ''
}

/**
 * 表格单元格处理
 */
function cell(content: string, node: Element): string {
  const normalized = normalizeCellContent(content)
  // 计算元素在兄弟元素中的位置
  // 使用 querySelectorAll 获取所有同级 th/td（更可靠）
  const parent = node.parentNode as Element | null
  if (!parent) {
    return '| ' + normalized + ' |'
  }
  const siblings = parent.querySelectorAll('th, td')
  const index = Array.from(siblings).indexOf(node)
  const prefix = index === 0 ? '| ' : ' '
  return prefix + normalized + ' |'
}

/**
 * 获取表格的第一行（兼容 linkedom，不依赖 table.rows）
 */
function getFirstRow(table: Element): Element | null {
  // linkedom 没有 table.rows，直接查询 tr
  const tr = table.querySelector('tr')
  return tr
}

/**
 * 判断是否为表头行
 */
function isHeadingRow(tr: Element): boolean {
  const parentNode = tr.parentNode as Element | null
  if (!parentNode) return false

  // 获取所有元素子节点（th/td），排除文本节点
  // 使用 querySelectorAll 更可靠（兼容 linkedom）
  const cells = tr.querySelectorAll('th, td')

  return (
    parentNode.nodeName === 'THEAD' ||
    (
      parentNode.firstChild === tr &&
      (parentNode.nodeName === 'TABLE' || isFirstTbody(parentNode)) &&
      cells.length > 0 &&
      Array.from(cells).every((n: Element) => n.nodeName === 'TH')
    )
  )
}

/**
 * 判断是否为第一个 tbody
 */
function isFirstTbody(element: Element): boolean {
  const previousSibling = element.previousSibling as Element | null

  return (
    element.nodeName === 'TBODY' && (
      !previousSibling ||
      (
        previousSibling.nodeName === 'THEAD' &&
        /^\s*$/i.test(previousSibling.textContent || '')
      )
    )
  )
}

/**
 * 添加表格和代码块扩展规则
 */
function addExtensionRules(turndownService: TurndownService): void {
  // figure 元素 - 直接透传内容（常包裹 table）
  turndownService.addRule('figure', {
    filter: 'figure',
    replacement: function(content) {
      return content
    }
  })

  // figcaption 元素 - 转为斜体文本
  turndownService.addRule('figcaption', {
    filter: 'figcaption',
    replacement: function(content) {
      return content ? '\n*' + content.trim() + '*\n' : ''
    }
  })

  // 表格单元格
  turndownService.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: function(content, node) {
      return cell(content, node as Element)
    }
  })

  // 表格行
  turndownService.addRule('tableRow', {
    filter: 'tr',
    replacement: function(content, node) {
      const tr = node as Element
      let borderCells = ''
      const alignMap: Record<string, string> = { left: ':--', right: '--:', center: ':-:' }

      if (isHeadingRow(tr)) {
        // 使用 querySelectorAll 获取所有 th/td（兼容 linkedom）
        const cells = tr.querySelectorAll('th, td')
        cells.forEach((child) => {
          let border = '---'
          const align = (child.getAttribute?.('align') || '').toLowerCase()

          if (align && alignMap[align]) {
            border = alignMap[align]
          }

          borderCells += cell(border, child)
        })
      }
      return '\n' + content + (borderCells ? '\n' + borderCells : '')
    }
  })

  // 表格
  turndownService.addRule('table', {
    filter: function(node) {
      try {
        if (node.nodeName !== 'TABLE') return false
        const table = node as Element
        const firstRow = getFirstRow(table)
        if (!firstRow) return false
        return isHeadingRow(firstRow)
      } catch (err) {
        logger.error('Table filter error:', err)
        return false
      }
    },
    replacement: function(content) {
      // 确保没有空行
      content = content.replace(/\n\n/g, '\n')
      return '\n\n' + content + '\n\n'
    }
  })

  // 表格区段
  turndownService.addRule('tableSection', {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function(content) {
      return content
    }
  })

  // 代码块
  turndownService.addRule('preCode', {
    filter: ['pre'],
    replacement: function(_content, node) {
      const pre = node as HTMLPreElement

      let language = detectCodeLanguage(pre)

      // 处理微信等平台将每行代码放在单独 <code> 标签的情况
      const codeElements = pre.querySelectorAll('code')
      let text: string
      if (codeElements.length > 1) {
        // 多个 code 标签，提取每个的文本并用换行连接
        const lines: string[] = []
        codeElements.forEach((codeEl) => {
          lines.push(codeEl.innerText || codeEl.textContent || '')
        })
        text = lines.join('\n')
      } else {
        text = pre.innerText || ''
      }

      // 清理文本
      text = text
        .replace(/\r\n/g, '\n')  // 统一换行符
        .replace(/\r/g, '\n')    // 处理旧 Mac 换行符
        .replace(/^\n+/, '')     // 移除开头空行
        .replace(/\n+$/, '')     // 移除结尾空行

      // 空代码块不输出
      if (!text.trim()) {
        return ''
      }

      // 清理语言标识（只保留字母数字和常见字符）。无语言时保持空 fence，避免误标成 bash。
      language = language.replace(/[^a-zA-Z0-9+#._-]/g, '').toLowerCase()

      // 检测内容中最长的连续反引号，使用更多反引号包裹
      // 例如内容有 ``` 则用 ````，内容有 ```` 则用 `````
      let fence = '```'
      const backtickMatches = text.match(/`+/g)
      if (backtickMatches) {
        const maxBackticks = Math.max(...backtickMatches.map(m => m.length))
        if (maxBackticks >= 3) {
          fence = '`'.repeat(maxBackticks + 1)
        }
      }

      return '\n' + fence + language + '\n' + text + '\n' + fence + '\n'
    }
  })

  // 源平台链接清理（站内链接去除、跳转中转还原）
  turndownService.addRule('sourcePlatformLinks', {
    filter: function(node) {
      if (node.nodeName !== 'A') return false
      const href = (node as Element).getAttribute('href') || ''
      return SOURCE_LINK_REMOVE_DOMAINS.some(d => href.includes(d))
        || SOURCE_LINK_REDIRECT_RULES.some(r => href.includes(r.domain))
    },
    replacement: function(content, node) {
      const href = (node as Element).getAttribute('href') || ''
      if (SOURCE_LINK_REMOVE_DOMAINS.some(d => href.includes(d))) {
        return content
      }
      const rule = SOURCE_LINK_REDIRECT_RULES.find(r => href.includes(r.domain))
      if (rule) {
        try {
          const url = new URL(href)
          const real = url.searchParams.get(rule.param)
          if (real) return '[' + content + '](' + real + ')'
        } catch {}
      }
      return '[' + content + '](' + href + ')'
    }
  })

  // 保留没有表头的表格（作为 HTML）
  turndownService.keep(function(node) {
    try {
      if (node.nodeName !== 'TABLE') return false
      const table = node as Element
      const firstRow = getFirstRow(table)
      if (!firstRow) return true
      return !isHeadingRow(firstRow)
    } catch (err) {
      logger.error('Table keep filter error:', err)
      return false
    }
  })
}

/**
 * 创建配置好的 Turndown 实例
 */
export function createTurndownService(options: TurndownOptions = {}): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: options.headingStyle || 'atx',
    hr: options.hr || '---',
    bulletListMarker: options.bulletListMarker || '-',
    codeBlockStyle: options.codeBlockStyle || 'fenced',
    fence: options.fence || '```',
    emDelimiter: options.emDelimiter || '*',
    strongDelimiter: options.strongDelimiter || '**',
    linkStyle: options.linkStyle || 'inlined',
    linkReferenceStyle: options.linkReferenceStyle || 'full',
  })

  // 添加扩展规则
  addExtensionRules(turndownService)

  return turndownService
}

/**
 * HTML 转 Markdown
 * 使用 linkedom 解析 HTML，兼容 Service Worker 环境
 * 如果 turndown 失败，使用简单正则转换作为回退
 */
export function htmlToMarkdown(html: string, _options: TurndownOptions = {}): string {
  // linkedom + turndown has compatibility issues in Service Worker environments
  // Use regex-based conversion instead for reliability
  return htmlToMarkdownSimple(html)
}

/**
 * 从 className 提取编程语言
 */
function extractLangFromClass(className: string): string {
  if (!className) return ''

  const patterns = [
    /language-(\w+)/i,           // language-javascript
    /lang-(\w+)/i,               // lang-js
    /\bhljs\s+(\w+)/i,           // hljs javascript
    /\b(javascript|typescript|python|java|cpp|c|csharp|go|rust|ruby|php|swift|kotlin|scala|sql|html|css|json|xml|yaml|markdown|bash|shell|powershell)\b/i,
  ]

  for (const pattern of patterns) {
    const match = className.match(pattern)
    if (match) {
      return match[1].toLowerCase()
    }
  }

  return ''
}

/**
 * 简单的正则 HTML → Markdown 转换 (回退方案)
 * 增强版：支持表格转换、代码块语言识别、LaTeX 公式
 */
function htmlToMarkdownSimple(html: string): string {
  let md = html

  // ============ 预处理：移除微信代码块行号 ============
  // 必须在列表转换之前执行，否则 <li> 会被转成 "- "
  // 支持 class="code-snippet__line-index" 和 class='code-snippet__line-index'
  md = md.replace(
    /<ul[^>]*class=["'][^"']*code-snippet__line-index[^"']*["'][^>]*>[\s\S]*?<\/ul>/gi,
    ''
  )

  // 表格转换 - 必须在移除其他标签之前处理
  md = convertTables(md)

  // 标题
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n')
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n')

  // 粗体和斜体
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')

  // 链接
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')

  // 图片
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')

  // 代码块 - 增强语言检测
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, content) => {
    let language = ''

    // 从 pre 标签提取语言
    const preLangMatch = match.match(/<pre[^>]*data-lang(?:uage)?=["'](\w+)["']/)
    const preClassMatch = match.match(/<pre[^>]*class="([^"]*)"/)
    if (preLangMatch) {
      language = preLangMatch[1]
    } else if (preClassMatch) {
      language = extractLangFromClass(preClassMatch[1])
    }

    // 从 code 标签提取语言
    const codeLangMatch = content.match(/<code[^>]*data-lang(?:uage)?=["'](\w+)["']/)
    const codeClassMatch = content.match(/<code[^>]*class="([^"]*)"/)
    if (!language) {
      if (codeLangMatch) {
        language = codeLangMatch[1]
      } else if (codeClassMatch) {
        language = extractLangFromClass(codeClassMatch[1])
      }
    }

    // 使用安全的代码提取函数
    const text = extractCodeFromHtml(content)

    return '\n```' + language + '\n' + text + '\n```\n'
  })

  // 行内代码
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')

  // 列表
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n')
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')

  // 段落和换行
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
  md = md.replace(/<br\s*\/?>/gi, '\n')
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n')

  // 块引用
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    return '\n' + content.trim().split('\n').map((line: string) => '> ' + line).join('\n') + '\n'
  })

  // LaTeX 公式 - 块级 (mode=display)
  // 注意：$$ 在替换字符串中需要写成 $$$$ 才能输出 $$
  md = md.replace(/<script[^>]*type=["']math\/tex[^"']*display[^"']*["'][^>]*>([\s\S]*?)<\/script>/gi, '\n$$$$\n$1\n$$$$\n')
  // LaTeX 公式 - 行内
  md = md.replace(/<script[^>]*type=["']math\/tex["'][^>]*>([\s\S]*?)<\/script>/gi, ' $$$$$1$$$$ ')

  // 移除其他标签
  md = md.replace(/<\/?[^>]+(>|$)/g, '')

  // 解码 HTML 实体
  md = md.replace(/&amp;/g, '&')
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&quot;/g, '"')
  md = md.replace(/&#039;/g, "'")
  md = md.replace(/&nbsp;/g, ' ')

  // 清理多余空行
  md = md.replace(/\n{3,}/g, '\n\n')
  md = md.trim()

  return md
}

/**
 * 将 HTML 表格转换为 Markdown 表格
 */
function convertTables(html: string): string {
  // 先处理 figure 包裹的表格
  html = html.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (match, figureContent) => {
    // 检查是否包含表格
    if (/<table[^>]*>/i.test(figureContent)) {
      // 提取表格部分，保留 figcaption
      const tableMatch = figureContent.match(/<table[^>]*>([\s\S]*?)<\/table>/i)
      const captionMatch = figureContent.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)

      if (tableMatch) {
        let result = tableMatch[0] // 返回表格部分
        if (captionMatch) {
          // 添加 caption 作为斜体
          const caption = captionMatch[1].replace(/<[^>]+>/g, '').trim()
          if (caption) {
            result += '\n*' + caption + '*\n'
          }
        }
        return result
      }
    }
    return match // 非表格 figure 保持原样
  })

  // 匹配整个表格
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    // 检查是否有表头（thead 或 第一行全是 th）
    const hasTheadMatch = tableContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)
    const rows: string[][] = []
    const alignments: string[][] = [] // 存储每行每个单元格的对齐方式
    let headerRowIndex = -1

    // 提取所有行
    const rowMatches = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []

    for (let i = 0; i < rowMatches.length; i++) {
      const rowContent = rowMatches[i]
      const cells: string[] = []
      const rowAligns: string[] = []

      // 检查单元格类型（th 或 td）
      const cellMatches = rowContent.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || []
      const isHeaderRow = cellMatches.length > 0 && cellMatches.every((c: string) => c.startsWith('<th'))

      for (const cellMatch of cellMatches) {
        // 提取单元格内容和对齐属性
        const fullMatch = cellMatch.match(/<t[hd]([^>]*)>([\s\S]*?)<\/t[hd]>/i)
        if (fullMatch) {
          const attrs = fullMatch[1]
          const rawContent = fullMatch[2]

          // 提取对齐方式
          const alignMatch = attrs.match(/align=["']?(left|center|right)["']?/i) ||
                            attrs.match(/style=["'][^"']*text-align:\s*(left|center|right)/i)
          const align = alignMatch ? alignMatch[1].toLowerCase() : ''
          rowAligns.push(align)

          // 清理内容
          let content = rawContent
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim()

          // 转义管道符
          content = content.replace(/\|/g, '\\|')
          cells.push(content)
        }
      }

      if (cells.length > 0) {
        rows.push(cells)
        alignments.push(rowAligns)
        // 记录表头行（在 thead 中或是第一行全 th）
        if (hasTheadMatch && rowContent.indexOf('<th') !== -1) {
          headerRowIndex = i
        } else if (i === 0 && isHeaderRow) {
          headerRowIndex = 0
        }
      }
    }

    // 如果没有行，返回空
    if (rows.length === 0) {
      return ''
    }

    // 如果没有找到表头行，将第一行作为表头（降级处理）
    if (headerRowIndex === -1) {
      headerRowIndex = 0
    }

    // 转换为 Markdown
    const mdRows: string[] = []
    const colCount = Math.max(...rows.map(r => r.length))

    // 获取表头行的对齐信息
    const headerAligns = alignments[headerRowIndex] || []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      // 填充缺失的单元格
      while (row.length < colCount) {
        row.push('')
      }

      mdRows.push('| ' + row.join(' | ') + ' |')

      // 在表头行之后添加分隔行（带对齐信息）
      if (i === headerRowIndex) {
        const separators = []
        for (let j = 0; j < colCount; j++) {
          const align = headerAligns[j] || ''
          if (align === 'left') {
            separators.push(':---')
          } else if (align === 'center') {
            separators.push(':---:')
          } else if (align === 'right') {
            separators.push('---:')
          } else {
            separators.push('---')
          }
        }
        mdRows.push('| ' + separators.join(' | ') + ' |')
      }
    }

    return '\n\n' + mdRows.join('\n') + '\n\n'
  })
}

/**
 * 默认的 Turndown 实例（可复用）
 */
let defaultService: TurndownService | null = null

/**
 * 获取默认 Turndown 实例
 */
export function getDefaultTurndownService(): TurndownService {
  if (!defaultService) {
    defaultService = createTurndownService()
  }
  return defaultService
}

// 导出 TurndownService 类型供外部使用
export { TurndownService }

/**
 * HTML 转 Markdown（使用原生 DOM）
 * 适用于 Content Script / 页面环境，利用浏览器原生 DOM
 * 比 linkedom 兼容性更好，转换质量更高
 */
export function htmlToMarkdownNative(html: string, options: TurndownOptions = {}): string {
  if (typeof document === 'undefined') {
    // 回退到简单正则转换（Service Worker 环境）
    logger.warn('No native DOM, falling back to regex conversion')
    return htmlToMarkdownSimple(html)
  }

  try {
    const turndownService = new TurndownService({
      headingStyle: options.headingStyle || 'atx',
      hr: options.hr || '---',
      bulletListMarker: options.bulletListMarker || '-',
      codeBlockStyle: options.codeBlockStyle || 'fenced',
      fence: options.fence || '```',
      emDelimiter: options.emDelimiter || '*',
      strongDelimiter: options.strongDelimiter || '**',
      linkStyle: options.linkStyle || 'inlined',
      linkReferenceStyle: options.linkReferenceStyle || 'full',
    })

    // 添加扩展规则
    addExtensionRules(turndownService)

    // 使用原生 DOM 解析 HTML
    const container = document.createElement('div')
    container.innerHTML = html

    // 预处理：移除微信代码块行号元素（必须在 turndown 之前）
    container.querySelectorAll('ul.code-snippet__line-index, ul[class*="code-snippet__line-index"]')
      .forEach(el => el.remove())

    return turndownService.turndown(container)
  } catch (err) {
    logger.error('Native DOM conversion failed:', err)
    return htmlToMarkdownSimple(html)
  }
}

// ============ Markdown → HTML ============

import { marked } from 'marked'

/**
 * Markdown 转 HTML
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string
}

/**
 * HTML 标准化
 * 通过 HTML → Markdown → HTML 往返转换，清理所有多余结构
 */
export function normalizeHtml(html: string, options: TurndownOptions = {}): string {
  const markdown = htmlToMarkdown(html, options)
  return markdownToHtml(markdown)
}
