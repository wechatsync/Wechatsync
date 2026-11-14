/**
 * 文章提取器 Content Script
 * 从当前页面提取文章内容
 *
 * 提取策略:
 * 1. 特定平台提取器 (微信公众号等)
 * 2. Safari ReaderArticleFinder + Defuddle 并行竞争 (通用，择优)
 * 3. <article> 标签 (最后手段)
 *
 * 内容格式:
 * - 在页面端使用 Turndown + 原生 DOM 将 HTML 转为 Markdown
 * - Service Worker 只需处理 Markdown，无需 DOM 解析
 */

import { extractArticle as extractWithReader, ReaderResult } from '../lib/reader'
import { htmlToMarkdownNative, type PreprocessConfig } from '@wechatsync/core'
import { createLogger } from '../lib/logger'
import { preprocessContentDOM, preprocessForPlatform, backupAndSimplifyCodeBlocks, restoreCodeBlocks, type PreprocessResult } from '../lib/content-processor'
import { createSyncFab } from '../lib/fab'

const logger = createLogger('Extractor')

interface ExtractedArticle {
  title: string
  markdown: string   // Markdown 格式（主要）
  html?: string      // 原始 HTML（可选，用于某些平台）
  summary?: string
  cover?: string
  source: {
    url: string
    platform: string
  }
}

/**
 * 提取文章内容
 */
async function extractArticle(): Promise<ExtractedArticle | null> {
  const url = window.location.href

  // 微信公众号
  if (url.includes('mp.weixin.qq.com')) {
    return extractWeixinArticle()
  }

  // 飞书文档（fetch HTML 解析 script 中的 clientVars）
  if (window.location.hostname.endsWith('.feishu.cn') || window.location.hostname.endsWith('.larksuite.com')) {
    const result = await extractFeishuArticle()
    if (result) return result
  }

  // 按域名匹配的站点特定提取
  const siteConfig = findSiteConfig(window.location.hostname)
  if (siteConfig) {
    const result = extractWithSiteConfig(siteConfig)
    if (result) return result
  }

  // 通用提取 (使用 Safari Reader / Readability)
  return extractGenericArticle()
}

/**
 * 提取微信公众号文章
 */
function extractWeixinArticle(): ExtractedArticle | null {
  const title = document.querySelector('#activity-name')?.textContent?.trim()
  const contentEl = document.querySelector('#js_content')
  const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
  const summary = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

  if (!title || !contentEl) {
    return null
  }

  // 在原始 DOM 上简化代码块（innerText 只在真实 DOM 上正确工作）
  const codeBlockBackups = backupAndSimplifyCodeBlocks(contentEl)

  try {
    // 克隆内容元素（此时代码块已经是简化后的纯文本）
    const clonedContent = contentEl.cloneNode(true) as HTMLElement

    // 恢复原始 DOM（尽早恢复，避免影响页面显示）
    restoreCodeBlocks(codeBlockBackups)

    // 预处理克隆的内容
    preprocessContentDOM(clonedContent)

    // 获取 HTML 并转换为 Markdown
    const html = clonedContent.innerHTML
    const markdown = htmlToMarkdownNative(html)

    return {
      title,
      markdown,
      html, // 保留原始 HTML，微信平台需要
      summary: summary || undefined,
      cover: cover || undefined,
      source: {
        url: window.location.href,
        platform: 'weixin',
      },
    }
  } catch (e) {
    restoreCodeBlocks(codeBlockBackups)
    throw e
  }
}

// ========== 飞书文档提取 ==========

/**
 * fetch 当前页面 HTML，从 <script> 标签中解析 clientVars。
 * 飞书在 HTML 中通过 inline script 设置 window.DATA = Object.assign({}, window.DATA, { clientVars: ... })
 * 直接用正则从 HTML 文本中提取 clientVars JSON，不受 CSP 限制。
 */
async function extractFeishuArticle(): Promise<ExtractedArticle | null> {
  try {
    const resp = await fetch(window.location.href, { credentials: 'include' })
    if (!resp.ok) return null

    const html = await resp.text()

    // 从 HTML 中找到 clientVars: Object({...}) 并提取 JSON
    const marker = 'clientVars: Object('
    const start = html.indexOf(marker)
    if (start === -1) return null

    const jsonStart = html.indexOf('{', start + marker.length)
    if (jsonStart === -1) return null

    // 用大括号计数找到匹配的闭合 }（跳过字符串内的大括号）
    let depth = 0
    let inString = false
    let escape = false
    let jsonEnd = -1
    for (let i = jsonStart; i < html.length; i++) {
      const ch = html[i]
      if (escape) { escape = false; continue }
      if (ch === '\\' && inString) { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) { jsonEnd = i; break } }
    }
    if (jsonEnd === -1) return null

    const clientVars = JSON.parse(html.slice(jsonStart, jsonEnd + 1))
    if (!clientVars?.data) return null

    // 新版 docx: block_map
    if (clientVars.data.block_map) {
      return extractFeishuDocx(clientVars.data.block_map)
    }

    // 旧版 doc: collab_client_vars
    if (clientVars.data.collab_client_vars) {
      return extractFeishuDoc(clientVars.data.collab_client_vars)
    }

    return null
  } catch (e) {
    logger.error('飞书文档提取失败', e)
    return null
  }
}

/**
 * 从 block_map 提取飞书 docx 内容
 * 支持递归嵌套结构、富文本属性、图片、表格、多列布局等
 */
function extractFeishuDocx(blockMap: Record<string, any>): ExtractedArticle | null {
  const pageBlock = Object.values(blockMap).find((b: any) => b.data.type === 'page')
  if (!pageBlock) return null

  // 页面标题可能在 data.title 或 data.text 中
  const titleTextData = pageBlock.data.title?.initialAttributedTexts?.text
  const title = (typeof titleTextData === 'string' ? titleTextData : titleTextData?.['0'])
    || getBlockText(pageBlock) || document.title
  const hostname = window.location.hostname

  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  /**
   * 解析富文本属性，将纯文本转换为带格式的 HTML
   * attribs 格式如 "*0+1*1+2*2*3+4" 表示应用哪些属性到哪些字符
   * numToAttrib 映射属性编号到 [key, value] 对
   */
  function renderRichText(block: any): string {
    const textData = block.data.text
    if (!textData) return ''
    const rawTextData = textData.initialAttributedTexts?.text
    const rawText = typeof rawTextData === 'string' ? rawTextData : (rawTextData?.['0'] ?? '')
    if (!rawText) return ''

    const apool = textData.apool
    if (!apool?.numToAttrib) return escapeHtml(rawText)

    // attribs 可能是字符串 "*0*1+5..." 或对象 { '0': "*0*1+5..." }
    const rawAttribs = textData.initialAttributedTexts?.attribs
    let attribs = ''
    if (typeof rawAttribs === 'string') {
      attribs = rawAttribs
    } else if (rawAttribs && typeof rawAttribs === 'object') {
      attribs = rawAttribs['0'] ?? Object.values(rawAttribs)[0] ?? ''
    }
    if (!attribs) return escapeHtml(rawText)

    // 逐字符解析 attribs（Etherpad 格式，数字为 base-36 编码）:
    // *N 启用属性 N, +M 插入 M 个字符, |N+M 插入含 N 个换行的 M 个字符, =N 保持
    const b36 = /[0-9a-z]/i
    const ops: { attrs: number[]; len: number }[] = []
    let parsePos = 0
    while (parsePos < attribs.length) {
      const ch = attribs[parsePos]
      if (ch === '*') {
        // 收集所有连续的 *N 属性
        const currentAttrs: number[] = []
        while (parsePos < attribs.length && attribs[parsePos] === '*') {
          parsePos++ // skip *
          let numStr = ''
          while (parsePos < attribs.length && b36.test(attribs[parsePos])) {
            numStr += attribs[parsePos++]
          }
          if (numStr) currentAttrs.push(parseInt(numStr, 36))
        }
        // 跳过可选的 |N（换行计数修饰符）
        if (parsePos < attribs.length && attribs[parsePos] === '|') {
          parsePos++
          while (parsePos < attribs.length && b36.test(attribs[parsePos])) parsePos++
        }
        // 期望 + 或 =
        if (parsePos < attribs.length && (attribs[parsePos] === '+' || attribs[parsePos] === '=')) {
          parsePos++ // skip + or =
          let lenStr = ''
          while (parsePos < attribs.length && b36.test(attribs[parsePos])) {
            lenStr += attribs[parsePos++]
          }
          const len = parseInt(lenStr, 36) || 0
          if (len > 0) ops.push({ attrs: currentAttrs, len })
        }
      } else if (ch === '|') {
        // |N+M 无属性的换行操作
        parsePos++
        while (parsePos < attribs.length && b36.test(attribs[parsePos])) parsePos++
        if (parsePos < attribs.length && (attribs[parsePos] === '+' || attribs[parsePos] === '=')) {
          parsePos++
          let lenStr = ''
          while (parsePos < attribs.length && b36.test(attribs[parsePos])) {
            lenStr += attribs[parsePos++]
          }
          const len = parseInt(lenStr, 36) || 0
          if (len > 0) ops.push({ attrs: [], len })
        }
      } else if (ch === '+' || ch === '=') {
        // 无属性的插入/保持操作
        parsePos++
        let lenStr = ''
        while (parsePos < attribs.length && b36.test(attribs[parsePos])) {
          lenStr += attribs[parsePos++]
        }
        const len = parseInt(lenStr, 36) || 0
        if (len > 0) ops.push({ attrs: [], len })
      } else {
        parsePos++ // 跳过未知字符
      }
    }

    // 收集 link 定义（link-id -> url 映射）
    const linkMap: Record<string, string> = {}
    if (textData.links) {
      for (const [linkId, linkData] of Object.entries(textData.links as Record<string, any>)) {
        linkMap[linkId] = linkData.url || linkData.href || ''
      }
    }

    // 逐段应用属性
    let pos = 0
    const htmlFragments: string[] = []
    for (const op of ops) {
      const segment = rawText.slice(pos, pos + op.len)
      pos += op.len
      if (!segment) continue

      let html = escapeHtml(segment)

      // 收集当前段需要的样式和标签
      let isBold = false
      let isItalic = false
      let isInlineCode = false
      let isStrikethrough = false
      let isUnderline = false
      let linkUrl = ''
      let color = ''
      let bgColor = ''

      for (const attrIdx of op.attrs) {
        const attr = apool.numToAttrib[String(attrIdx)]
        if (!attr) continue
        const [key, value] = attr
        switch (key) {
          case 'bold': if (value === 'true') isBold = true; break
          case 'italic': if (value === 'true') isItalic = true; break
          case 'inlineCode': if (value === 'true') isInlineCode = true; break
          case 'strikethrough': if (value === 'true') isStrikethrough = true; break
          case 'underline': if (value === 'true') isUnderline = true; break
          case 'link-id': linkUrl = linkMap[value] || ''; break
          case 'textHighlight': bgColor = value; break
          case 'textColor': color = value; break
        }
      }

      // 应用格式（内层先应用）
      if (isInlineCode) {
        html = `<code>${html}</code>`
      } else {
        if (isBold) html = `<strong>${html}</strong>`
        if (isItalic) html = `<em>${html}</em>`
        if (isStrikethrough) html = `<del>${html}</del>`
        if (isUnderline) html = `<u>${html}</u>`
      }

      // 颜色/高亮用 span
      const styles: string[] = []
      if (color) styles.push(`color:${color}`)
      if (bgColor) styles.push(`background-color:${bgColor}`)
      if (styles.length) html = `<span style="${styles.join(';')}">${html}</span>`

      // 链接包裹在最外层
      if (linkUrl) html = `<a href="${escapeHtml(linkUrl)}">${html}</a>`

      htmlFragments.push(html)
    }

    // 如果还有剩余文本未被 attribs 覆盖
    if (pos < rawText.length) {
      htmlFragments.push(escapeHtml(rawText.slice(pos)))
    }

    return htmlFragments.join('')
  }

  /**
   * 递归渲染一个 block 为 HTML
   */
  function renderBlock(blockId: string): string {
    const block = blockMap[blockId]
    if (!block) return ''

    const type = block.data.type
    const richText = renderRichText(block)
    const children = block.data.children || []

    switch (type) {
      case 'page':
        return renderChildren(children)

      case 'text':
        if (!richText && !children.length) return ''
        if (children.length) {
          return `<p>${richText}</p>\n${renderChildren(children)}`
        }
        return `<p>${richText}</p>`

      case 'heading1': return `<h1>${richText}</h1>`
      case 'heading2': return `<h2>${richText}</h2>`
      case 'heading3': return `<h3>${richText}</h3>`
      case 'heading4': return `<h4>${richText}</h4>`
      case 'heading5': return `<h5>${richText}</h5>`
      case 'heading6': return `<h6>${richText}</h6>`

      case 'code': {
        const plainText = getBlockText(block) || ''
        return `<pre><code>${escapeHtml(plainText)}</code></pre>`
      }

      case 'quote':
      case 'callout': {
        if (children.length) {
          return `<blockquote>${richText ? `<p>${richText}</p>\n` : ''}${renderChildren(children)}</blockquote>`
        }
        return `<blockquote><p>${richText}</p></blockquote>`
      }

      case 'bullet':
      case 'bulletList': {
        const inner = children.length ? `${richText}\n${renderChildren(children)}` : richText
        return `<!--list:ul--><li>${inner}</li><!--/list:ul-->`
      }

      case 'ordered':
      case 'orderedList': {
        const inner = children.length ? `${richText}\n${renderChildren(children)}` : richText
        return `<!--list:ol--><li>${inner}</li><!--/list:ol-->`
      }

      case 'todoList': {
        const done = block.data.done === true
        const checkbox = done ? '&#9745; ' : '&#9744; '
        return `<p>${checkbox}${richText}</p>`
      }

      case 'divider':
        return '<hr>'

      case 'image': {
        const imageData = block.data.image || block.data
        const token = imageData.token || ''
        const src = imageData.url || imageData.src ||
          (token ? `https://${hostname}/space/api/box/stream/download/all/${token}/` : '')
        if (src) return `<img src="${escapeHtml(String(src))}">`
        return ''
      }

      case 'table': {
        return renderTable(block)
      }

      case 'table_cell': {
        // table_cell 的内容在 children 中
        if (children.length) return renderChildren(children)
        if (richText) return richText
        return ''
      }

      case 'grid': {
        // 多列布局: 渲染每个 grid_column 的内容
        if (children.length) {
          return `<div style="display:flex;gap:16px;">${children.map((cid: string) => renderBlock(cid)).join('')}</div>`
        }
        return ''
      }

      case 'grid_column': {
        if (children.length) {
          return `<div style="flex:1;">${renderChildren(children)}</div>`
        }
        return ''
      }

      case 'view':
      case 'file': {
        // 附件/文件块：显示文件名
        const fileName = block.data.file_name || block.data.name || '附件'
        return `<p>[${escapeHtml(String(fileName))}]</p>`
      }

      default:
        // 未知类型：尝试渲染文本和子块
        if (richText || children.length) {
          const parts: string[] = []
          if (richText) parts.push(`<p>${richText}</p>`)
          if (children.length) parts.push(renderChildren(children))
          return parts.join('\n')
        }
        return ''
    }
  }

  /**
   * 渲染一组子 block，并合并连续的列表项到同一个 <ul>/<ol> 中
   */
  function renderChildren(childIds: string[]): string {
    const rendered = childIds.map(id => renderBlock(id)).filter(Boolean)
    // 合并连续的列表标记：<!--list:ul-->...<li>...</li>...<!--/list:ul-->
    const merged: string[] = []
    let i = 0
    while (i < rendered.length) {
      const item = rendered[i]
      if (item.startsWith('<!--list:ul-->')) {
        // 收集连续的 ul 项
        const lis: string[] = []
        while (i < rendered.length && rendered[i].startsWith('<!--list:ul-->')) {
          lis.push(rendered[i].replace('<!--list:ul-->', '').replace('<!--/list:ul-->', ''))
          i++
        }
        merged.push(`<ul>${lis.join('\n')}</ul>`)
      } else if (item.startsWith('<!--list:ol-->')) {
        // 收集连续的 ol 项
        const lis: string[] = []
        while (i < rendered.length && rendered[i].startsWith('<!--list:ol-->')) {
          lis.push(rendered[i].replace('<!--list:ol-->', '').replace('<!--/list:ol-->', ''))
          i++
        }
        merged.push(`<ol>${lis.join('\n')}</ol>`)
      } else {
        merged.push(item)
        i++
      }
    }
    return merged.join('\n')
  }

  /**
   * 渲染表格 block
   * table block 有 columns_id, rows_id, cell_set 结构
   */
  function renderTable(block: any): string {
    const data = block.data
    const columnsId: string[] = data.columns_id || []
    const rowsId: string[] = data.rows_id || []
    const cellSet: Record<string, any> = data.cell_set || {}
    const children: string[] = data.children || []

    if (!columnsId.length || !rowsId.length) {
      if (children.length) return renderChildren(children)
      return ''
    }

    // 尝试找到 cell 的函数：支持多种 key 格式和数据结构
    function getCellContent(rowId: string, colId: string): string {
      // 尝试多种 cell_set key 格式
      const cell = cellSet[`${rowId}:${colId}`] || cellSet[`${rowId}${colId}`]

      if (cell) {
        // 格式1: cell 是字符串（直接就是 block ID）
        if (typeof cell === 'string' && blockMap[cell]) {
          return renderBlock(cell)
        }
        // 格式2: cell.block_id 指向 blockMap 中的 block
        if (cell.block_id && blockMap[cell.block_id]) {
          return renderBlock(cell.block_id)
        }
        // 格式3: cell.id 指向 blockMap 中的 block
        if (cell.id && blockMap[cell.id]) {
          return renderBlock(cell.id)
        }
        // 格式4: cell 自身有 children
        if (cell.children?.length) {
          return renderChildren(cell.children)
        }
        // 格式5: cell 自身有 text 数据
        if (cell.text) {
          return renderRichText({ data: cell })
        }
      }

      return ''
    }

    // 如果 cell_set 完全为空，尝试从 children（table_cell blocks）按行列顺序构建
    const cellSetEmpty = Object.keys(cellSet).length === 0
    if (cellSetEmpty && children.length) {
      const numCols = columnsId.length
      const rows: string[] = []
      for (let r = 0; r < rowsId.length; r++) {
        const cells: string[] = []
        for (let c = 0; c < numCols; c++) {
          const idx = r * numCols + c
          const cellBlockId = children[idx]
          const content = cellBlockId ? renderBlock(cellBlockId) : ''
          cells.push(`<td>${content}</td>`)
        }
        rows.push(`<tr>${cells.join('')}</tr>`)
      }
      return `<table border="1" cellpadding="4" cellspacing="0">${rows.join('\n')}</table>`
    }

    const rows: string[] = []
    for (const rowId of rowsId) {
      const cells: string[] = []
      for (const colId of columnsId) {
        cells.push(`<td>${getCellContent(rowId, colId)}</td>`)
      }
      rows.push(`<tr>${cells.join('')}</tr>`)
    }

    return `<table border="1" cellpadding="4" cellspacing="0">${rows.join('\n')}</table>`
  }

  // 渲染页面子块
  const children = pageBlock.data.children || []
  const html = renderChildren(children)
  if (!html.trim()) return null

  const markdown = htmlToMarkdownNative(html)

  return {
    title,
    markdown,
    html,
    source: {
      url: window.location.href,
      platform: 'feishu',
    },
  }
}

/**
 * 旧版 doc: 从 collab_client_vars 提取
 * texts["0"] 是主文档正文，其中 "*" 独占一行是 zone 占位符（代码块等）
 * 其他 texts key 是 zone 内容，按 apool 中 zoneId 出现顺序对应正文中的 * 位置
 */
function extractFeishuDoc(vars: {
  title?: string
  initialAttributedTexts?: { texts?: Record<string, string> }
  initialAttributedText?: { text?: string }
  apool?: { numToAttrib?: Record<string, [string, string]> }
}): ExtractedArticle | null {
  const title = vars.title || document.title
  const texts = vars.initialAttributedTexts?.texts
  const mainText = texts?.['0'] || vars.initialAttributedText?.text
  if (!mainText) return null

  // 从 apool 按 index 顺序收集 zoneId，保持出现顺序
  const zoneIds: string[] = []
  if (vars.apool?.numToAttrib) {
    const entries = Object.entries(vars.apool.numToAttrib)
      .sort(([a], [b]) => Number(a) - Number(b))
    for (const [, [key, val]] of entries) {
      if (key === 'zoneId' && !zoneIds.includes(val)) {
        zoneIds.push(val)
      }
    }
  }

  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 按行处理正文，遇到 * 占位符行就插入对应的 zone 内容
  const htmlParts: string[] = []
  let zoneIndex = 0
  for (const line of mainText.split('\n')) {
    if (line.trim() === '*') {
      // zone 占位符，插入对应代码块
      if (texts && zoneIndex < zoneIds.length) {
        const zoneContent = texts[zoneIds[zoneIndex]]
        if (zoneContent?.trim()) {
          htmlParts.push(`<pre><code>${escapeHtml(zoneContent.trim())}</code></pre>`)
        }
        zoneIndex++
      }
      continue
    }
    if (!line.trim()) continue
    htmlParts.push(`<p>${escapeHtml(line)}</p>`)
  }

  const html = htmlParts.join('\n')
  if (!html.trim()) return null

  const markdown = htmlToMarkdownNative(html)

  return {
    title,
    markdown,
    html,
    source: {
      url: window.location.href,
      platform: 'feishu',
    },
  }
}

function getBlockText(block: any): string | undefined {
  const t = block.data?.text?.initialAttributedTexts?.text
  if (!t) return undefined
  return typeof t === 'string' ? t : t['0']
}

// ========== 站点特定提取配置 ==========

interface SiteExtractConfig {
  /** 匹配的域名（支持后缀匹配，如 'feishu.cn' 匹配 xxx.feishu.cn） */
  domains: string[]
  /** 平台标识 */
  platform: string
  /** 正文容器选择器 */
  contentSelector: string
  /** 标题选择器（按优先级排列，可选，回退到 h1 / og:title / document.title） */
  titleSelectors?: string[]
  /** 需要删除的元素选择器 */
  removeSelectors?: string[]
  /** 需要解包的元素选择器（将内部的 heading 提升出来替换外层容器） */
  unwrapHeadingSelectors?: string[]
}

const SITE_CONFIGS: SiteExtractConfig[] = [
  {
    domains: ['github.com'],
    platform: 'github',
    contentSelector: '.markdown-body',
    titleSelectors: ['[itemprop="name"] a', '.AppHeader-context-item-label'],
    removeSelectors: ['.anchor', 'a[aria-hidden="true"]', '[data-testid]', '.octicon', '.zeroclipboard-container', '.btn-octicon'],
    unwrapHeadingSelectors: ['.markdown-heading'],
  },
  {
    domains: ['csdn.net'],
    platform: 'csdn',
    contentSelector: '#content_views, .markdown_views, .htmledit_views, article',
    titleSelectors: ['.title-article', '#articleContentId', 'h1'],
    removeSelectors: [
      '.hide-preCode-box',
      '.pre-numbering',
      '.code-toolbar .toolbar',
      '.blog-tags-box',
      '.article-info-box',
      '.recommend-box',
      '.comment-box',
    ],
  },
  // 飞书/Lark 使用虚拟滚动，由 extractFeishuArticle() 通过 fetch + clientVars 解析提取
]

function findSiteConfig(hostname: string): SiteExtractConfig | undefined {
  return SITE_CONFIGS.find(config =>
    config.domains.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    )
  )
}

/**
 * 基于站点配置提取文章
 */
function extractWithSiteConfig(config: SiteExtractConfig): ExtractedArticle | null {
  const contentEl = document.querySelector(config.contentSelector) as HTMLElement
  if (!contentEl) return null

  // 提取标题
  let title: string | undefined
  if (config.titleSelectors) {
    for (const sel of config.titleSelectors) {
      const el = document.querySelector(sel)
      if (el?.textContent?.trim()) {
        title = el.textContent.trim()
        break
      }
    }
  }
  if (!title) {
    const h1 = contentEl.querySelector('h1')
    title = h1?.textContent?.trim()
      || document.querySelector('meta[property="og:title"]')?.getAttribute('content')
      || document.title
  }

  const codeBlockBackups = backupAndSimplifyCodeBlocks(contentEl)

  try {
    const clonedContent = contentEl.cloneNode(true) as HTMLElement
    restoreCodeBlocks(codeBlockBackups)

    // 删除非内容元素
    if (config.removeSelectors) {
      for (const sel of config.removeSelectors) {
        clonedContent.querySelectorAll(sel).forEach(el => el.remove())
      }
    }

    // 解包标题容器
    if (config.unwrapHeadingSelectors) {
      for (const sel of config.unwrapHeadingSelectors) {
        clonedContent.querySelectorAll(sel).forEach(wrapper => {
          const heading = wrapper.querySelector('h1, h2, h3, h4, h5, h6')
          if (heading) {
            wrapper.replaceWith(heading)
          }
        })
      }
    }

    preprocessContentDOM(clonedContent)
    const html = clonedContent.innerHTML
    const markdown = htmlToMarkdownNative(html)

    const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const summary = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

    return {
      title,
      markdown,
      html,
      summary: summary || undefined,
      cover: cover || undefined,
      source: {
        url: window.location.href,
        platform: config.platform,
      },
    }
  } catch (e) {
    restoreCodeBlocks(codeBlockBackups)
    throw e
  }
}

/**
 * 通用文章提取
 * 使用 Safari ReaderArticleFinder / Defuddle 并行竞争
 */
function extractGenericArticle(): ExtractedArticle | null {
  // 使用统一的 Reader 提取器
  const result = extractWithReader()

  if (result) {
    return readerResultToArticle(result)
  }

  // 如果 Reader 提取失败，尝试简单的选择器
  return extractWithSelectors()
}

/**
 * 将 ReaderResult 转换为 ExtractedArticle
 */
function readerResultToArticle(result: ReaderResult): ExtractedArticle {
  // 创建临时 DOM 进行预处理
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = result.content
  preprocessContentDOM(tempDiv)
  const processedHtml = tempDiv.innerHTML

  // 转换为 Markdown
  const markdown = htmlToMarkdownNative(processedHtml)

  return {
    title: result.title,
    markdown,
    html: processedHtml, // 预处理后的 HTML
    summary: result.excerpt,
    cover: result.leadingImage || result.mainImage,
    source: {
      url: window.location.href,
      platform: result.extractor,
    },
  }
}

/**
 * 使用 CSS 选择器提取 (最后手段)
 */
function extractWithSelectors(): ExtractedArticle | null {
  // 尝试常见的文章选择器
  const selectors = {
    title: [
      'h1',
      'article h1',
      '.article-title',
      '.post-title',
      '[itemprop="headline"]',
    ],
    content: [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '[itemprop="articleBody"]',
      'main',
    ],
  }

  let title: string | null = null
  for (const selector of selectors.title) {
    const el = document.querySelector(selector)
    if (el?.textContent?.trim()) {
      title = el.textContent.trim()
      break
    }
  }

  let html: string | null = null
  for (const selector of selectors.content) {
    const el = document.querySelector(selector)
    if (el?.innerHTML) {
      // 在原始 DOM 上简化代码块
      const codeBlockBackups = backupAndSimplifyCodeBlocks(el)

      try {
        // 克隆并预处理
        const clonedContent = el.cloneNode(true) as HTMLElement

        // 恢复原始 DOM
        restoreCodeBlocks(codeBlockBackups)

        preprocessContentDOM(clonedContent)
        html = clonedContent.innerHTML
        break
      } catch (e) {
        restoreCodeBlocks(codeBlockBackups)
        throw e
      }
    }
  }

  // 回退到 meta 标签
  if (!title) {
    title = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
      || document.title
  }

  if (!title || !html) {
    return null
  }

  // 转换为 Markdown
  const markdown = htmlToMarkdownNative(html)

  const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
  const summary = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

  return {
    title,
    markdown,
    html, // 保留原始 HTML
    summary: summary || undefined,
    cover: cover || undefined,
    source: {
      url: window.location.href,
      platform: 'selector',
    },
  }
}

// ========== 悬浮按钮 ==========

// 预先显示的 loading（点击按钮时立即显示，避免等待 background 响应）
let pendingLoading: { remove: () => void } | null = null

let floatingButton: HTMLDivElement | null = null

function injectFloatingButton() {
  if (floatingButton) return
  // 微信公众号页面已有专属悬浮按钮，不重复注入
  if (window.location.hostname === 'mp.weixin.qq.com') return

  const btn = createSyncFab({
    onClick: () => {
      pendingLoading = showLoading()
      chrome.runtime.sendMessage({ type: 'TRIGGER_OPEN_EDITOR' })
    },
  })
  btn.id = 'wechatsync-floating-btn'
  btn.setAttribute('data-wechatsync-ui', '')

  document.body.appendChild(btn)
  floatingButton = btn as HTMLDivElement
}

function removeFloatingButton() {
  if (floatingButton) {
    floatingButton.remove()
    floatingButton = null
  }
}

// 初始化：读取设置决定是否注入
chrome.storage.local.get('floatingButtonEnabled', (result) => {
  if (result.floatingButtonEnabled) {
    injectFloatingButton()
  }
})

// 监听设置变化，实时响应
chrome.storage.onChanged.addListener((changes) => {
  if (changes.floatingButtonEnabled) {
    if (changes.floatingButtonEnabled.newValue) {
      injectFloatingButton()
    } else {
      removeFloatingButton()
    }
  }
})

// ========== Loading 提示 ==========

function showLoading(): { remove: () => void } {
  const overlay = document.createElement('div')
  overlay.setAttribute('data-wechatsync-ui', '')
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.3); z-index: 2147483646;
    display: flex; align-items: center; justify-content: center;
  `
  overlay.innerHTML = `
    <div style="background:white;padding:20px 32px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:12px;">
      <div style="width:20px;height:20px;border:3px solid #e5e5e5;border-top-color:#07c160;border-radius:50%;animation:wcs-spin 0.8s linear infinite;"></div>
      <span style="font-size:14px;color:#333;">正在提取文章内容...</span>
    </div>
    <style>@keyframes wcs-spin { to { transform: rotate(360deg); } }</style>
  `
  document.body.appendChild(overlay)
  return { remove: () => overlay.remove() }
}

// ========== 编辑器注入 ==========

let editorIframe: HTMLIFrameElement | null = null
let editorContainer: HTMLDivElement | null = null

/**
 * 打开编辑器
 */
function openEditor(article: ExtractedArticle, platforms: any[], selectedPlatformIds?: string[]) {
  if (editorContainer) {
    // 已经打开，重新发送数据
    sendDataToEditor(article, platforms, selectedPlatformIds)
    return
  }

  // 创建全屏容器
  editorContainer = document.createElement('div')
  editorContainer.id = 'wechatsync-editor-container'
  editorContainer.setAttribute('data-wechatsync-ui', '')
  editorContainer.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  `

  // 创建 iframe
  editorIframe = document.createElement('iframe')
  editorIframe.src = chrome.runtime.getURL('src/editor/index.html')
  editorIframe.style.cssText = `
    width: 100vw !important;
    height: 100vh !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
  `

  editorContainer.appendChild(editorIframe)
  document.body.appendChild(editorContainer)

  // 禁止页面滚动
  document.body.style.overflow = 'hidden'

  // 等待 iframe 准备好后发送数据
  const handleEditorReady = (event: MessageEvent) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      if (data.type === 'EDITOR_READY') {
        sendDataToEditor(article, platforms, selectedPlatformIds)
        window.removeEventListener('message', handleEditorReady)
      }
    } catch (e) {
      // ignore
    }
  }
  window.addEventListener('message', handleEditorReady)
}

/**
 * 发送数据到编辑器
 */
function sendDataToEditor(article: ExtractedArticle, platforms: any[], selectedPlatformIds?: string[]) {
  if (!editorIframe?.contentWindow) return

  // 发送文章数据
  editorIframe.contentWindow.postMessage(JSON.stringify({
    type: 'ARTICLE_DATA',
    article: {
      title: article.title,
      content: article.html || article.markdown,
      cover: article.cover,
      url: article.source.url,
      extractor: article.source.platform,
    },
  }), '*')

  // 发送平台数据（包含已选中的平台）
  editorIframe.contentWindow.postMessage(JSON.stringify({
    type: 'PLATFORMS_DATA',
    platforms,
    selectedPlatformIds, // 传递已选中的平台 ID
  }), '*')
}

/**
 * 关闭编辑器
 */
function closeEditor() {
  if (editorContainer) {
    editorContainer.remove()
    editorContainer = null
    editorIframe = null
    document.body.style.overflow = ''
  }
}

/**
 * 为多个平台预处理内容
 * @param rawHtml 原始 HTML
 * @param platformIds 平台 ID 列表
 * @param configs 各平台的预处理配置
 * @returns 各平台的预处理结果
 */
function preprocessForMultiplePlatformsLocal(
  rawHtml: string,
  platformIds: string[],
  configs: Record<string, PreprocessConfig>
): Record<string, PreprocessResult> {
  const results: Record<string, PreprocessResult> = {}

  for (const platformId of platformIds) {
    const config = configs[platformId]
    if (config) {
      results[platformId] = preprocessForPlatform(rawHtml, config)
    } else {
      // 没有配置的平台使用默认处理
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = rawHtml
      preprocessContentDOM(tempDiv)
      const html = tempDiv.innerHTML
      results[platformId] = {
        html,
        markdown: htmlToMarkdownNative(html),
      }
    }
  }

  return results
}

/**
 * 监听编辑器消息
 */
window.addEventListener('message', async (event) => {
  try {
    const data = parseWindowMessage(event.data)
    if (!data?.type) return

    if (data.type === 'CLOSE_EDITOR') {
      closeEditor()
    } else if (data.type === 'START_SYNC') {
      // 只处理来自编辑器的 START_SYNC，忽略来自 sync-dialog 的
      if (!editorIframe) return
      // 转发同步请求到 background
      // 编辑器传来的是 HTML content
      const rawHtml = data.article.content || ''
      const platforms: string[] = data.platforms || []

      // 从 background 获取各平台的预处理配置
      const configResponse = await chrome.runtime.sendMessage({
        type: 'GET_PREPROCESS_CONFIGS',
        platforms,
      })

      const configs: Record<string, PreprocessConfig> = configResponse?.configs || {}

      // 为每个平台分别预处理
      const platformContents = preprocessForMultiplePlatformsLocal(rawHtml, platforms, configs)

      logger.debug('Preprocessed contents for platforms:', Object.keys(platformContents))

      chrome.runtime.sendMessage({
        type: 'START_SYNC_FROM_EDITOR',
        article: {
          ...data.article,
          // 保留一份默认内容（兼容）
          html: rawHtml,
          markdown: htmlToMarkdownNative(rawHtml),
          // 各平台专属预处理内容
          platformContents,
        },
        platforms,
        syncId: data.syncId,  // 转发 syncId
      })
    }
  } catch (e) {
    logger.error('Error handling editor message:', e)
  }
})

function parseWindowMessage(data: unknown): any | null {
  if (typeof data !== 'string') {
    return data && typeof data === 'object' ? data : null
  }

  const trimmed = data.trim()
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) {
    return null
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

/**
 * 监听 background 消息，转发同步进度到编辑器
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_ARTICLE') {
    // 微信页面有专用 content script 处理提取，避免竞争
    const url = window.location.href
    if (url.includes('mp.weixin.qq.com/cgi-bin/appmsg') || url.includes('mp.weixin.qq.com/s')) {
      return false // 不处理，交给 weixin-editor.ts 或 weixin.ts
    }
    const loading = showLoading()
    extractArticle().then(article => {
      loading.remove()
      sendResponse({ article })
    }).catch(() => { loading.remove(); sendResponse({ article: null }) })
    return true
  } else if (message.type === 'OPEN_EDITOR') {
    // 复用按钮点击时已显示的 loading，否则新建
    const loading = pendingLoading || showLoading()
    pendingLoading = null
    extractArticle().then(article => {
      loading.remove()
      if (article) {
        openEditor(article, message.platforms || [], message.selectedPlatforms || [])
        sendResponse({ success: true })
      } else {
        sendResponse({ success: false, error: '无法提取文章内容' })
      }
    }).catch(() => { loading.remove(); sendResponse({ success: false, error: '提取失败' }) })
    return true
  } else if (message.type === 'PREPROCESS_FOR_PLATFORMS') {
    // 为多个平台预处理内容（由 background 调用）
    const { rawHtml, platforms, configs } = message.payload as {
      rawHtml: string
      platforms: string[]
      configs: Record<string, PreprocessConfig>
    }
    const platformContents = preprocessForMultiplePlatformsLocal(rawHtml, platforms, configs)
    sendResponse({ platformContents })
  } else if (message.type === 'SYNC_PROGRESS') {
    // 转发同步进度到编辑器（带上 syncId）
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_PROGRESS',
      result: message.result,
      syncId: message.syncId,
    }), '*')
  } else if (message.type === 'SYNC_DETAIL_PROGRESS') {
    // 转发详细进度到编辑器（带上 syncId）
    // 兼容两种格式：message.payload (from SYNC_ARTICLE) 或直接展开 (from START_SYNC_FROM_EDITOR)
    const progress = message.payload || {
      platform: message.platform,
      platformName: message.platformName,
      stage: message.stage,
      imageProgress: message.imageProgress,
      result: message.result,
      error: message.error,
    }
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_DETAIL_PROGRESS',
      progress,
      syncId: message.syncId,
    }), '*')
  } else if (message.type === 'SYNC_COMPLETE') {
    // 同步完成（带上 syncId）
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_COMPLETE',
      rateLimitWarning: message.rateLimitWarning,
      syncId: message.syncId,
    }), '*')
  } else if (message.type === 'SYNC_ERROR') {
    // 同步错误（带上 syncId）
    editorIframe?.contentWindow?.postMessage(JSON.stringify({
      type: 'SYNC_ERROR',
      error: message.error,
      syncId: message.syncId,
    }), '*')
  }
  return true
})
