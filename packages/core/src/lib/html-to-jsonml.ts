/**
 * HTML 转魔搭（ModelScope）富文本编辑器 JSONML 树
 *
 * 魔搭文章编辑器使用自定义 JSONML 树格式:
 * ["tag", {attrs}, ...children]
 *
 * 结构说明:
 * - 根节点: ["root", {}, [block...]]
 * - 段落: ["p", {}, [inline...]]
 * - 标题: ["h1".."h6", {}, [inline...]]
 * - 文本: ["span", {"data-type":"text"}, ["span", {"data-type":"leaf"}, "文本"]]
 * - 图片: ["img", {src: "..."}]
 * - 链接: ["a", {href: "..."}, [inline...]]
 * - 代码块: ["code", {}, "代码"]
 * - 列表: ["ul"/"ol", {}, ["li", {}, [inline...]], ...]
 * - 引用: ["p", {blockquote: true}, [inline...]]
 */

export type JsonMLNode =
  | string
  | [string, Record<string, unknown>?, ...JsonMLNode[]]
  | JsonMLNode[]

/**
 * 创建文本节点
 */
function textNode(text: string): JsonMLNode {
  return ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, text]]
}

/**
 * 创建空文本节点（用于空段落）
 */
function emptyTextNode(): JsonMLNode {
  return ['span', { 'data-type': 'text' }, ['span', { 'data-type': 'leaf' }, '']]
}

/**
 * 将 DOM 元素转换为 JSONML 节点
 * @param el DOM 元素
 * @param getText 获取文本内容的函数（兼容 Service Worker 环境）
 */
export function elementToJsonML(
  el: Element,
  getText: (el: Element) => string,
  getAttr: (el: Element, name: string) => string | null
): JsonMLNode {
  const tag = el.tagName.toLowerCase()

  // 文本节点直接处理
  if (tag === '#text' || tag === 'text') {
    const text = getText(el)
    return text || ''
  }

  switch (tag) {
    case 'br':
      return ['br', {}]
    case 'hr':
      return ['hr', {}]
    case 'img': {
      const src = getAttr(el, 'src') || ''
      const attrs: Record<string, unknown> = { src }
      const width = getAttr(el, 'width')
      const height = getAttr(el, 'height')
      const alt = getAttr(el, 'alt')
      if (width) attrs.width = width
      if (height) attrs.height = height
      if (alt) attrs.alt = alt
      return ['img', attrs]
    }
    case 'a': {
      const href = getAttr(el, 'href') || ''
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['a', { href }, ...(children.length ? children : [textNode('')])]
    }
    case 'strong':
    case 'b': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['strong', {}, ...children]
    }
    case 'em':
    case 'i': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['em', {}, ...children]
    }
    case 'u': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['u', {}, ...children]
    }
    case 's':
    case 'strike':
    case 'del': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['strike', {}, ...children]
    }
    case 'code': {
      return ['code', {}, getText(el)]
    }
    case 'blockquote': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['blockquote', {}, ...children]
    }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return [tag, {}, ...(children.length ? children : [emptyTextNode()])]
    }
    case 'p': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['p', {}, ...(children.length ? children : [emptyTextNode()])]
    }
    case 'div':
    case 'section':
    case 'article':
    case 'main': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      // 有子元素时返回 p（块级）
      if (children.some(c => Array.isArray(c) && typeof c[0] === 'string' && !['span', 'a', 'strong', 'em'].includes(c[0] as string))) {
        return children
      }
      return ['p', {}, ...(children.length ? children : [emptyTextNode()])]
    }
    case 'ul':
    case 'ol': {
      const items: JsonMLNode[] = Array.from(el.children)
        .filter(child => child.tagName.toLowerCase() === 'li')
        .map(li => {
          const liChildren = elementChildrenToJsonML(li, getText, getAttr)
          return ['li', {}, ...(liChildren.length ? liChildren : [emptyTextNode()])]
        })
      return [tag, {}, ...items]
    }
    case 'li': {
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return ['li', {}, ...(children.length ? children : [emptyTextNode()])]
    }
    case 'pre': {
      // 代码块（pre > code）
      const codeEl = el.querySelector('code')
      if (codeEl) {
        return ['code', { language: getAttr(el, 'data-language') || getAttr(codeEl, 'data-language') || '' }, getText(codeEl)]
      }
      return ['code', {}, getText(el)]
    }
    case 'table': {
      // 魔搭编辑器不支持表格，转为文本
      return ['p', {}, textNode(getText(el))]
    }
    case 'iframe':
    case 'script':
    case 'style':
    case 'meta':
    case 'link':
      return ''
    case 'span': {
      // 只处理有内容的 span（可能是内联容器）
      const children = elementChildrenToJsonML(el, getText, getAttr)
      return children.length ? ['span', {}, ...children] : ''
    }
    default: {
      // 其他元素递归处理子节点
      const children = elementChildrenToJsonML(el, getText, getAttr)
      if (children.length === 0) {
        // 尝试作为文本
        const text = getText(el).trim()
        return text ? textNode(text) : ''
      }
      return children
    }
  }
}

/**
 * 将 DOM 元素的子节点转换为 JSONML 节点数组
 */
function elementChildrenToJsonML(
  el: Element,
  getText: (el: Element) => string,
  getAttr: (el: Element, name: string) => string | null
): JsonMLNode[] {
  const nodes: JsonMLNode[] = []
  const children = Array.from(el.children) as Element[]

  // 先处理直接文本内容（非空且不是子元素的）
  const directText = getText(el)
  const hasElementChildren = children.length > 0
  if (!hasElementChildren && directText.trim()) {
    // 叶子元素：返回文本节点
    nodes.push(textNode(directText))
    return nodes
  }

  for (const child of children) {
    const node = elementToJsonML(child, getText, getAttr)
    if (node === '') continue
    if (Array.isArray(node) && typeof node[0] === 'string') {
      nodes.push(node)
    }
  }

  return nodes
}

/**
 * 将 HTML 字符串转换为魔搭 JSONML 树
 * @param html HTML 内容
 * @param parseHTML 解析 HTML 的函数（兼容不同运行环境）
 * @returns JSONML 树数组
 */
export function htmlToJsonML(
  html: string,
  parseHTML: (html: string) => Promise<Document>
): Promise<JsonMLNode[]> {
  return parseHTML(html).then(doc => {
    // 兼容性处理: 原生 DOMParser 走 doc.body；linkedom 等 环境
    // body 可能为空（碎片输入时内容挂在 document.childNodes 上）
    const body = doc.body
    let children: Element[]
    if (body && body.children.length > 0) {
      children = Array.from(body.children) as Element[]
    } else {
      // 降级: 扫描 document.childNodes（跳过 head/html/body 包装，linkedom 碎片场景）
      children = []
      const collect = (node: Element | Document) => {
        for (const child of Array.from(node.children)) {
          const tag = child.tagName.toLowerCase()
          if (tag === 'html' || tag === 'head') {
            collect(child as Element)
          } else if (tag === 'body') {
            collect(child as Element)
          } else {
            children.push(child)
          }
        }
      }
      collect(doc as unknown as Element)
    }

    // 收集块级节点
    const blocks: JsonMLNode[] = []
    const pushBlock = (node: JsonMLNode) => {
      if (node === '' || node === null || node === undefined) return
      if (typeof node === 'string') {
        if (node.trim()) blocks.push(['p', {}, textNode(node)])
        return
      }
      if (Array.isArray(node) && typeof node[0] === 'string') {
        // 内联元素包一层 p
        if (['span', 'a', 'strong', 'em', 'u', 'strike', 'img', 'br'].includes(node[0] as string)) {
          blocks.push(['p', {}, node])
        } else {
          blocks.push(node)
        }
      }
    }
    for (const child of children) {
      const node = elementToJsonML(
        child,
        el => (el.textContent || '').trim(),
        (el, name) => el.getAttribute(name)
      )
      if (node === '') continue
      if (Array.isArray(node) && typeof node[0] !== 'string') {
        // 容器元素（div/section 等）返回的是节点数组，逐个展开处理
        for (const sub of node as JsonMLNode[]) {
          pushBlock(sub)
        }
      } else {
        pushBlock(node)
      }
    }

    // 过滤空块
    return blocks.filter(block => {
      if (typeof block === 'string') return block.trim() !== ''
      return true
    })
  })
}

/**
 * 将 JSONML 树包装为魔搭需要的 ContentDraft 结构
 * ContentDraft = JSON.stringify(["root", {}, ...blocks])
 */
export function jsonmlToContentDraft(blocks: JsonMLNode[]): string {
  return JSON.stringify(['root', {}, ...blocks])
}

/**
 * 从 Markdown 转换文章内容（供魔搭适配器使用）
 * 优先使用 HTML（转换质量更高），否则用 Markdown 简单转换
 */
export function buildContentDraft(
  html: string | undefined,
  markdown: string,
  parseHTML: (html: string) => Promise<Document>
): Promise<string> {
  if (html && html.trim()) {
    return htmlToJsonML(html, parseHTML).then(jsonmlToContentDraft)
  }

  // Markdown 降级：按行简单转换（标题、段落、列表、代码块）
  const blocks: JsonMLNode[] = []
  const lines = markdown.split('\n')
  let inCode = false
  let currentCode: string[] = []
  let currentList: JsonMLNode[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushCode = () => {
    if (currentCode.length) {
      blocks.push(['code', {}, currentCode.join('\n')])
      currentCode = []
    }
  }
  const flushList = () => {
    if (currentList.length && listType) {
      blocks.push([listType, {}, ...currentList])
      currentList = []
      listType = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // 围栏代码块开关
    if (trimmed.startsWith('```')) {
      if (inCode) {
        flushCode()
        inCode = false
      } else {
        flushList()
        inCode = true
      }
      continue
    }
    // 代码块内的行原样收集
    if (inCode) {
      currentCode.push(line)
      continue
    }

    // 空行：结束当前块
    if (!trimmed) {
      flushCode()
      flushList()
      continue
    }

    // 标题
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/)
    if (headingMatch) {
      flushCode()
      flushList()
      const level = headingMatch[1].length
      blocks.push([`h${level}`, {}, textNode(headingMatch[2])])
      continue
    }

    // 列表
    const listMatch = trimmed.match(/^([-*+]|\d+\.)\s+(.*)/)
    if (listMatch) {
      flushCode()
      const isOl = /^\d+\./.test(listMatch[1])
      const type = isOl ? 'ol' : 'ul'
      if (listType !== type) {
        flushList()
        listType = type
      }
      currentList.push(['li', {}, textNode(listMatch[2])])
      continue
    }
    flushList()

    // 引用
    if (trimmed.startsWith('>')) {
      blocks.push(['blockquote', {}, textNode(trimmed.replace(/^>\s?/, ''))])
      continue
    }

    // 分割线
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(['hr', {}])
      continue
    }

    // 普通段落
    blocks.push(['p', {}, textNode(trimmed)])
  }
  flushCode()
  flushList()
  inCode = false

  return Promise.resolve(jsonmlToContentDraft(blocks))
}
