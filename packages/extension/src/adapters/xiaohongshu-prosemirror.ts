interface UploadedImage {
  url: string
  width: number
  height: number
}

export interface XiaohongshuProseMirrorNode {
  type: string
  attrs?: Record<string, unknown>
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  content?: XiaohongshuProseMirrorNode[]
  text?: string
}

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'image'; alt: string; url: string }
  | { type: 'link'; url: string; children: InlineNode[] }
  | { type: 'strong' | 'emphasis' | 'delete'; children: InlineNode[] }
  | { type: 'inlineCode'; value: string }
  | { type: 'break' }

type BlockNode =
  | { type: 'heading'; depth: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'list'; ordered: boolean; start?: number; children: BlockNode[] }
  | { type: 'listItem'; children: BlockNode[] }
  | { type: 'table'; children: BlockNode[] }
  | { type: 'tableRow'; children: BlockNode[] }
  | { type: 'tableCell'; children: InlineNode[] }
  | { type: 'thematicBreak' }
  | { type: 'code'; lang?: string; value: string }

function parseInline(value: string): InlineNode[] {
  const nodes: InlineNode[] = []
  let remaining = value
  while (remaining.length > 0) {
    const image = remaining.match(/^!\[([^\]]*)]\(([^)]+)\)/)
    if (image) {
      nodes.push({ type: 'image', alt: image[1], url: image[2] })
      remaining = remaining.slice(image[0].length)
      continue
    }
    const link = remaining.match(/^\[([^\]]+)]\(([^)]+)\)/)
    if (link) {
      nodes.push({
        type: 'link',
        url: link[2],
        children: [{ type: 'text', value: link[1] }],
      })
      remaining = remaining.slice(link[0].length)
      continue
    }
    const strong = remaining.match(/^(\*\*|__)([^*_]+)\1/)
    if (strong) {
      nodes.push({
        type: 'strong',
        children: [{ type: 'text', value: strong[2] }],
      })
      remaining = remaining.slice(strong[0].length)
      continue
    }
    const emphasis = remaining.match(/^(\*|_)([^*_]+)\1/)
    if (emphasis) {
      nodes.push({
        type: 'emphasis',
        children: [{ type: 'text', value: emphasis[2] }],
      })
      remaining = remaining.slice(emphasis[0].length)
      continue
    }
    const deleted = remaining.match(/^~~([^~]+)~~/)
    if (deleted) {
      nodes.push({
        type: 'delete',
        children: [{ type: 'text', value: deleted[1] }],
      })
      remaining = remaining.slice(deleted[0].length)
      continue
    }
    const inlineCode = remaining.match(/^`([^`]+)`/)
    if (inlineCode) {
      nodes.push({ type: 'inlineCode', value: inlineCode[1] })
      remaining = remaining.slice(inlineCode[0].length)
      continue
    }
    if (remaining.startsWith('  \n') || remaining.startsWith('\n')) {
      nodes.push({ type: 'break' })
      remaining = remaining.replace(/^(\s*\n|\n)/, '')
      continue
    }
    const specialIndex = remaining.search(/[!\[*_~`\n]/)
    if (specialIndex === -1) {
      nodes.push({ type: 'text', value: remaining })
      break
    }
    if (specialIndex === 0) {
      nodes.push({ type: 'text', value: remaining[0] })
      remaining = remaining.slice(1)
    } else {
      nodes.push({ type: 'text', value: remaining.slice(0, specialIndex) })
      remaining = remaining.slice(specialIndex)
    }
  }
  return nodes
}

function parseMarkdown(markdown: string): BlockNode[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const nodes: BlockNode[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index++
      continue
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const code: string[] = []
      index++
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index])
        index++
      }
      index++
      nodes.push({ type: 'code', lang: lang || undefined, value: code.join('\n') })
      continue
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      nodes.push({
        type: 'heading',
        depth: heading[1].length,
        children: parseInline(heading[2]),
      })
      index++
      continue
    }
    if (/^[-*_]{3,}\s*$/.test(line)) {
      nodes.push({ type: 'thematicBreak' })
      index++
      continue
    }
    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (
        index < lines.length &&
        (
          lines[index].startsWith('>') ||
          (lines[index].trim() !== '' &&
            quoteLines.length > 0 &&
            !lines[index].match(/^[#\-*\d]/))
        )
      ) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''))
        index++
      }
      nodes.push({ type: 'blockquote', children: parseMarkdown(quoteLines.join('\n')) })
      continue
    }
    if (/^[-*+]\s+/.test(line)) {
      const items: BlockNode[] = []
      while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
        items.push({
          type: 'listItem',
          children: [{
            type: 'paragraph',
            children: parseInline(lines[index].replace(/^[-*+]\s+/, '')),
          }],
        })
        index++
      }
      nodes.push({ type: 'list', ordered: false, children: items })
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: BlockNode[] = []
      const startMatch = line.match(/^(\d+)\.\s+/)
      const start = startMatch ? Number.parseInt(startMatch[1], 10) : 1
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push({
          type: 'listItem',
          children: [{
            type: 'paragraph',
            children: parseInline(lines[index].replace(/^\d+\.\s+/, '')),
          }],
        })
        index++
      }
      nodes.push({ type: 'list', ordered: true, start, children: items })
      continue
    }
    if (line.includes('|') && line.trim().startsWith('|')) {
      const rows: BlockNode[] = []
      while (index < lines.length && lines[index].includes('|')) {
        const row = lines[index].trim()
        index++
        if (/^\|[\s\-:|]+\|$/.test(row)) continue
        const cells = row.split('|').slice(1, -1).map(cell => cell.trim())
        rows.push({
          type: 'tableRow',
          children: cells.map(cell => ({
            type: 'tableCell',
            children: parseInline(cell),
          })),
        })
      }
      if (rows.length) nodes.push({ type: 'table', children: rows })
      continue
    }

    const paragraph: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !lines[index].startsWith('#') &&
      !lines[index].startsWith('>') &&
      !lines[index].startsWith('```') &&
      !/^[-*+]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^[-*_]{3,}\s*$/.test(lines[index]) &&
      !(lines[index].includes('|') && lines[index].trim().startsWith('|'))
    ) {
      paragraph.push(lines[index])
      index++
    }
    if (paragraph.length) {
      nodes.push({ type: 'paragraph', children: parseInline(paragraph.join('\n')) })
    }
  }
  return nodes
}

function inlineToProseMirror(nodes: InlineNode[]): XiaohongshuProseMirrorNode[] {
  const result: XiaohongshuProseMirrorNode[] = []
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        if (node.value) result.push({ type: 'text', text: node.value })
        break
      case 'strong': {
        const children = inlineToProseMirror(node.children)
        for (const child of children) {
          if (child.type === 'text') child.marks = [...(child.marks || []), { type: 'bold' }]
        }
        result.push(...children)
        break
      }
      case 'emphasis': {
        const children = inlineToProseMirror(node.children)
        for (const child of children) {
          if (child.type === 'text') child.marks = [...(child.marks || []), { type: 'italic' }]
        }
        result.push(...children)
        break
      }
      case 'delete': {
        const children = inlineToProseMirror(node.children)
        for (const child of children) {
          if (child.type === 'text') child.marks = [...(child.marks || []), { type: 'strike' }]
        }
        result.push(...children)
        break
      }
      case 'inlineCode':
        result.push({ type: 'text', text: node.value })
        break
      case 'link':
        // 小红书不支持正文链接，保留链接文字。
        result.push(...inlineToProseMirror(node.children))
        break
      case 'image':
      case 'break':
        // 图片由块级转换处理；原版对换行节点不输出 ProseMirror 节点。
        break
    }
  }
  return result
}

function imageNode(
  image: { alt: string; url: string },
  images: Map<string, UploadedImage>
): XiaohongshuProseMirrorNode {
  const uploaded = images.get(image.url)
  const width = 410
  const height = uploaded?.width
    ? Math.round(width * uploaded.height / uploaded.width)
    : 0
  return {
    type: 'image',
    attrs: {
      imgs: [{
        src: uploaded?.url || image.url,
        desc: '',
        percent: 30,
        width,
        height,
      }],
    },
  }
}

function blocksToProseMirror(
  nodes: BlockNode[],
  images: Map<string, UploadedImage>
): XiaohongshuProseMirrorNode[] {
  const result: XiaohongshuProseMirrorNode[] = []
  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
        result.push({
          type: 'heading',
          attrs: { level: Math.min(node.depth, 3) },
          content: inlineToProseMirror(node.children),
        })
        break
      case 'paragraph': {
        let pending: InlineNode[] = []
        for (const child of node.children) {
          if (child.type === 'image') {
            if (pending.length) {
              result.push({
                type: 'paragraph',
                content: inlineToProseMirror(pending),
              })
              pending = []
            }
            result.push(imageNode(child, images))
          } else {
            pending.push(child)
          }
        }
        if (pending.length) {
          result.push({
            type: 'paragraph',
            content: inlineToProseMirror(pending),
          })
        }
        if (!node.children.length) result.push({ type: 'paragraph' })
        break
      }
      case 'blockquote':
        result.push({
          type: 'blockquote',
          content: blocksToProseMirror(node.children, images),
        })
        break
      case 'list':
        result.push({
          type: node.ordered ? 'orderedList' : 'bulletList',
          ...(node.ordered ? { attrs: { start: node.start || 1, type: null } } : {}),
          content: blocksToProseMirror(node.children, images),
        })
        break
      case 'listItem':
        result.push({
          type: 'listItem',
          content: blocksToProseMirror(node.children, images),
        })
        break
      case 'table':
        for (const row of node.children) {
          if (row.type !== 'tableRow') continue
          const text = row.children
            .filter((cell): cell is Extract<BlockNode, { type: 'tableCell' }> =>
              cell.type === 'tableCell'
            )
            .map(cell => inlineToProseMirror(cell.children).map(item => item.text || '').join(''))
            .join(' | ')
          if (text.trim()) {
            result.push({ type: 'paragraph', content: [{ type: 'text', text }] })
          }
        }
        break
      case 'code':
        result.push({
          type: 'paragraph',
          content: node.value ? [{ type: 'text', text: node.value }] : [],
        })
        break
      case 'thematicBreak':
      case 'tableRow':
      case 'tableCell':
        break
    }
  }
  return result
}

function cleanNode(node: XiaohongshuProseMirrorNode): XiaohongshuProseMirrorNode {
  const cleaned: XiaohongshuProseMirrorNode = { type: node.type }
  if (node.attrs !== undefined) cleaned.attrs = node.attrs
  if (node.marks !== undefined) {
    cleaned.marks = node.marks.map(mark => ({
      type: mark.type,
      ...(mark.attrs !== undefined ? { attrs: mark.attrs } : {}),
    }))
  }
  if (node.content !== undefined) {
    const content = node.content
      .filter(child => !(child.type === 'text' && !child.text))
      .map(cleanNode)
    if (content.length) cleaned.content = content
  }
  if (node.text !== undefined) cleaned.text = node.text
  return cleaned
}

export function markdownToXiaohongshuProseMirror(
  markdown: string,
  images: Map<string, UploadedImage>
): XiaohongshuProseMirrorNode {
  let content = blocksToProseMirror(parseMarkdown(markdown), images)
  while (
    content.length &&
    content[0].type === 'paragraph' &&
    (!content[0].content || content[0].content?.length === 0)
  ) {
    content.shift()
  }
  if (!content.length) content = [{ type: 'paragraph' }]
  return cleanNode({ type: 'doc', content })
}
