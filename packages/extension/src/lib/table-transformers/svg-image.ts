const DEFAULT_TABLE_WIDTH = 640
const DEFAULT_FONT_SIZE = 16
const DEFAULT_LINE_HEIGHT = 24
const DEFAULT_PADDING_X = 8
const DEFAULT_PADDING_Y = 6
const DEFAULT_BORDER_COLOR = '#c8ced8'
const DEFAULT_BACKGROUND_COLOR = '#ffffff'
const DEFAULT_TEXT_COLOR = '#111111'
const DEFAULT_FONT_FAMILY = 'Microsoft YaHei, PingFang SC, Helvetica, Arial, sans-serif'
const TABLE_SECTION_TAGS = new Set(['THEAD', 'TBODY', 'TFOOT'])
const BLOCK_CONTENT_TAGS = new Set([
  'P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI',
])
const MALFORMED_CELL_BLOCK_TAGS = [
  'p', 'div', 'section', 'article', 'header', 'footer',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
]

export interface TableSvgOptions {
  width?: number
  fontSize?: number
  lineHeight?: number
  paddingX?: number
  paddingY?: number
  borderColor?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
}

export interface TableSvgRenderResult {
  svg: string
  width: number
  height: number
}

interface ResolvedTableSvgOptions {
  width: number
  fontSize: number
  lineHeight: number
  paddingX: number
  paddingY: number
  borderColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
}

interface CellPlacement {
  cell: HTMLElement
  rowIndex: number
  columnIndex: number
  rowspan: number
  colspan: number
  lines: string[]
}

/**
 * 在 HTML 交给浏览器解析前，将非法的 tr > p / tr > div 行修复成 tr > td。
 * 浏览器的表格纠错算法会把这些块元素移到 table 外部，必须在 innerHTML 之前处理。
 */
export function repairMalformedTableHtml(html: string): string {
  return html.replace(/<table\b[\s\S]*?<\/table\s*>/gi, (tableHtml) =>
    tableHtml.replace(
      /(<tr\b[^>]*>)([\s\S]*?)(<\/tr\s*>)/gi,
      (rowHtml, openingTag: string, body: string, closingTag: string) => {
        if (/<(?:td|th)\b/i.test(body)) return rowHtml

        const blockPattern = new RegExp(
          `<(${MALFORMED_CELL_BLOCK_TAGS.join('|')})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`,
          'gi'
        )
        const blocks: string[] = []
        let cursor = 0
        let match: RegExpExecArray | null

        while ((match = blockPattern.exec(body)) !== null) {
          if (body.slice(cursor, match.index).trim()) return rowHtml
          blocks.push(match[0])
          cursor = match.index + match[0].length
        }

        if (blocks.length === 0 || body.slice(cursor).trim()) return rowHtml
        return `${openingTag}${blocks.map((block) => `<td>${block}</td>`).join('')}${closingTag}`
      }
    )
  )
}

/**
 * 将容器中的语义表格整体替换为 SVG data URI 图片。
 *
 * 该输出不依赖目标平台保留 table CSS；后续沿用已有图片上传流程，适用于会清洗
 * 表格结构或样式的平台。每张表格始终对应一张图片，避免按行、按单元格拆分。
 */
export function transformTablesToSvgImages(
  container: HTMLElement,
  options: TableSvgOptions = {}
): void {
  const tables = Array.from(container.querySelectorAll('table')) as HTMLTableElement[]

  tables.forEach((table) => {
    const result = renderTableToSvg(table, options)
    const image = document.createElement('img')
    image.setAttribute(
      'src',
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`
    )
    image.setAttribute('width', String(result.width))
    image.setAttribute('height', String(result.height))
    image.setAttribute('alt', table.getAttribute('aria-label') || '表格')
    table.replaceWith(image)
  })
}

/** 将单张 HTML 表格渲染为自包含 SVG。 */
export function renderTableToSvg(
  table: HTMLTableElement,
  options: TableSvgOptions = {}
): TableSvgRenderResult {
  const resolved = resolveOptions(options)
  const rows = getDirectRows(table)
  const placements = createPlacements(rows)
  const rowCount = Math.max(
    1,
    rows.length,
    ...placements.map((placement) => placement.rowIndex + placement.rowspan)
  )
  const columnCount = Math.max(
    1,
    ...placements.map((placement) => placement.columnIndex + placement.colspan)
  )
  const columnWidths = resolveColumnWidths(table, columnCount, resolved.width)

  placements.forEach((placement) => {
    const cellWidth = sumRange(columnWidths, placement.columnIndex, placement.colspan)
    placement.lines = wrapText(
      readCellText(placement.cell),
      Math.max(1, cellWidth - resolved.paddingX * 2),
      resolved.fontSize
    )
  })

  const minimumRowHeight = resolved.lineHeight + resolved.paddingY * 2
  const rowHeights = Array.from({ length: rowCount }, () => minimumRowHeight)

  placements
    .filter((placement) => placement.rowspan === 1)
    .forEach((placement) => {
      rowHeights[placement.rowIndex] = Math.max(
        rowHeights[placement.rowIndex],
        placement.lines.length * resolved.lineHeight + resolved.paddingY * 2
      )
    })

  placements
    .filter((placement) => placement.rowspan > 1)
    .sort((left, right) => left.rowspan - right.rowspan)
    .forEach((placement) => {
      const requiredHeight = placement.lines.length * resolved.lineHeight + resolved.paddingY * 2
      const currentHeight = sumRange(rowHeights, placement.rowIndex, placement.rowspan)
      if (requiredHeight > currentHeight) {
        rowHeights[placement.rowIndex + placement.rowspan - 1] += requiredHeight - currentHeight
      }
    })

  const columnOffsets = createOffsets(columnWidths)
  const rowOffsets = createOffsets(rowHeights)
  const height = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0)
  const cells = placements.map((placement) => renderCell(
    placement,
    columnOffsets,
    rowOffsets,
    columnWidths,
    rowHeights,
    resolved
  )).join('')
  const label = table.getAttribute('aria-label') || '表格'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${resolved.width}" height="${height}" viewBox="0 0 ${resolved.width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeXml(label)}">${cells}</svg>`

  return { svg, width: resolved.width, height }
}

function resolveOptions(options: TableSvgOptions): ResolvedTableSvgOptions {
  return {
    width: positiveNumber(options.width, DEFAULT_TABLE_WIDTH),
    fontSize: positiveNumber(options.fontSize, DEFAULT_FONT_SIZE),
    lineHeight: positiveNumber(options.lineHeight, DEFAULT_LINE_HEIGHT),
    paddingX: nonNegativeNumber(options.paddingX, DEFAULT_PADDING_X),
    paddingY: nonNegativeNumber(options.paddingY, DEFAULT_PADDING_Y),
    borderColor: options.borderColor || DEFAULT_BORDER_COLOR,
    backgroundColor: options.backgroundColor || DEFAULT_BACKGROUND_COLOR,
    textColor: options.textColor || DEFAULT_TEXT_COLOR,
    fontFamily: options.fontFamily || DEFAULT_FONT_FAMILY,
  }
}

function positiveNumber(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) > 0 ? Math.round(value as number) : fallback
}

function nonNegativeNumber(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) >= 0 ? Math.round(value as number) : fallback
}

function getDirectRows(table: HTMLTableElement): HTMLTableRowElement[] {
  const rows: HTMLTableRowElement[] = []

  Array.from(table.children).forEach((child) => {
    if (child.tagName === 'TR') {
      rows.push(child as HTMLTableRowElement)
      return
    }

    if (TABLE_SECTION_TAGS.has(child.tagName)) {
      Array.from(child.children).forEach((row) => {
        if (row.tagName === 'TR') rows.push(row as HTMLTableRowElement)
      })
    }
  })

  return rows
}

function getSourceCells(row: HTMLTableRowElement): HTMLElement[] {
  const semanticCells = Array.from(row.children).filter(
    (child) => child.tagName === 'TD' || child.tagName === 'TH'
  ) as HTMLElement[]
  if (semanticCells.length > 0) return semanticCells

  // 兼容历史内容中已被错误反序列化的 tr > p / tr > div。
  return Array.from(row.children).filter(
    (child) => BLOCK_CONTENT_TAGS.has(child.tagName)
  ) as HTMLElement[]
}

function createPlacements(rows: HTMLTableRowElement[]): CellPlacement[] {
  const occupied = new Set<string>()
  const placements: CellPlacement[] = []

  rows.forEach((row, rowIndex) => {
    let columnIndex = 0
    getSourceCells(row).forEach((cell) => {
      while (occupied.has(`${rowIndex}:${columnIndex}`)) columnIndex += 1

      const rowspan = readSpan(cell, 'rowspan')
      const colspan = readSpan(cell, 'colspan')
      placements.push({ cell, rowIndex, columnIndex, rowspan, colspan, lines: [''] })

      for (let targetRow = rowIndex; targetRow < rowIndex + rowspan; targetRow += 1) {
        for (let targetColumn = columnIndex; targetColumn < columnIndex + colspan; targetColumn += 1) {
          occupied.add(`${targetRow}:${targetColumn}`)
        }
      }
      columnIndex += colspan
    })
  })

  return placements
}

function readSpan(cell: Element, attribute: 'rowspan' | 'colspan'): number {
  const value = Number.parseInt(cell.getAttribute(attribute) || '1', 10)
  return Number.isFinite(value) && value > 0 ? value : 1
}

function resolveColumnWidths(table: HTMLTableElement, columnCount: number, width: number): number[] {
  const colgroup = Array.from(table.children).find((child) => child.tagName === 'COLGROUP')
  if (colgroup) {
    const sourceWidths = Array.from(colgroup.children)
      .filter((child) => child.tagName === 'COL')
      .map(readElementWidth)
    if (sourceWidths.length === columnCount && sourceWidths.every(isPositiveWidth)) {
      return normalizeWidths(sourceWidths as number[], width)
    }
  }

  return distributeWidths(columnCount, width)
}

function readElementWidth(element: Element): number | null {
  const attributeWidth = Number.parseFloat(element.getAttribute('width') || '')
  if (Number.isFinite(attributeWidth) && attributeWidth > 0) return attributeWidth

  const styleWidth = Number.parseFloat((element as HTMLElement).style.width || '')
  return Number.isFinite(styleWidth) && styleWidth > 0 ? styleWidth : null
}

function isPositiveWidth(value: number | null): value is number {
  return value !== null && value > 0
}

function normalizeWidths(sourceWidths: number[], targetWidth: number): number[] {
  const sourceTotal = sourceWidths.reduce((sum, width) => sum + width, 0)
  const normalized: number[] = []
  let allocated = 0

  sourceWidths.forEach((sourceWidth, index) => {
    if (index === sourceWidths.length - 1) {
      normalized.push(targetWidth - allocated)
      return
    }

    const remainingColumns = sourceWidths.length - index - 1
    const currentWidth = Math.max(
      1,
      Math.min(
        targetWidth - allocated - remainingColumns,
        Math.floor(sourceWidth / sourceTotal * targetWidth)
      )
    )
    normalized.push(currentWidth)
    allocated += currentWidth
  })

  return normalized
}

function distributeWidths(columnCount: number, width: number): number[] {
  const average = Math.floor(width / columnCount)
  const widths = Array.from({ length: columnCount }, () => average)
  widths[columnCount - 1] = width - average * (columnCount - 1)
  return widths
}

function readCellText(cell: Element): string {
  const chunks: string[] = []

  const appendBreak = () => {
    if (chunks.length > 0 && chunks[chunks.length - 1] !== '\n') chunks.push('\n')
  }

  const visit = (node: Node, root = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      chunks.push(node.textContent || '')
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as Element
    if (element.tagName === 'BR') {
      appendBreak()
      return
    }

    const isBlock = !root && BLOCK_CONTENT_TAGS.has(element.tagName)
    if (isBlock) appendBreak()
    Array.from(element.childNodes).forEach((child) => visit(child))
    if (isBlock) appendBreak()
  }

  visit(cell, true)
  return chunks
    .join('')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[\t\r\f ]+/g, ' ').trim())
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
}

function wrapText(text: string, availableWidth: number, fontSize: number): string[] {
  const wrapped: string[] = []
  const hardLines = text.split('\n')

  hardLines.forEach((hardLine) => {
    if (!hardLine) {
      wrapped.push('')
      return
    }

    let currentLine = ''
    let currentWidth = 0
    Array.from(hardLine).forEach((character) => {
      const characterWidth = estimateCharacterWidth(character, fontSize)
      if (currentLine && currentWidth + characterWidth > availableWidth) {
        wrapped.push(currentLine)
        currentLine = character
        currentWidth = characterWidth
        return
      }
      currentLine += character
      currentWidth += characterWidth
    })
    wrapped.push(currentLine)
  })

  return wrapped.length > 0 ? wrapped : ['']
}

function estimateCharacterWidth(character: string, fontSize: number): number {
  if (/\s/u.test(character)) return fontSize * 0.4
  if (/[\u2e80-\u9fff\uf900-\ufaff\uff01-\uff60]/u.test(character)) {
    return fontSize * 1.03125
  }
  return fontSize * 0.46875
}

function renderCell(
  placement: CellPlacement,
  columnOffsets: number[],
  rowOffsets: number[],
  columnWidths: number[],
  rowHeights: number[],
  options: ResolvedTableSvgOptions
): string {
  const x = columnOffsets[placement.columnIndex]
  const y = rowOffsets[placement.rowIndex]
  const width = sumRange(columnWidths, placement.columnIndex, placement.colspan)
  const height = sumRange(rowHeights, placement.rowIndex, placement.rowspan)
  const cellStyle = placement.cell.style
  const fill = cellStyle.backgroundColor || options.backgroundColor
  const color = cellStyle.color || options.textColor
  const textAlign = cellStyle.textAlign
  const verticalAlign = cellStyle.verticalAlign
  const fontWeight = resolveFontWeight(placement.cell)
  const { textX, anchor } = resolveHorizontalTextPosition(
    x,
    width,
    options.paddingX,
    textAlign
  )
  const firstBaseline = resolveFirstBaseline(
    y,
    height,
    placement.lines.length,
    options,
    verticalAlign
  )
  const rect = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${escapeXml(fill)}" stroke="${escapeXml(options.borderColor)}" stroke-width="1" shape-rendering="crispEdges"/>`
  const text = placement.lines.map((line, lineIndex) => {
    if (!line) return ''
    const baseline = firstBaseline + lineIndex * options.lineHeight
    return `<text x="${textX}" y="${baseline}" text-anchor="${anchor}" font-size="${options.fontSize}" font-family="${escapeXml(options.fontFamily)}" font-weight="${fontWeight}" fill="${escapeXml(color)}">${escapeXml(line)}</text>`
  }).join('')

  return rect + text
}

function resolveFontWeight(cell: HTMLElement): string {
  const explicit = cell.style.fontWeight
  if (explicit) return escapeXml(explicit)
  if (cell.tagName === 'TH' || cell.querySelector('strong, b')) return '600'
  return '400'
}

function resolveHorizontalTextPosition(
  x: number,
  width: number,
  paddingX: number,
  textAlign: string
): { textX: number; anchor: 'start' | 'middle' | 'end' } {
  if (textAlign === 'center') return { textX: x + width / 2, anchor: 'middle' }
  if (textAlign === 'right' || textAlign === 'end') {
    return { textX: x + width - paddingX, anchor: 'end' }
  }
  return { textX: x + paddingX, anchor: 'start' }
}

function resolveFirstBaseline(
  y: number,
  height: number,
  lineCount: number,
  options: ResolvedTableSvgOptions,
  verticalAlign: string
): number {
  const textHeight = lineCount * options.lineHeight
  if (verticalAlign === 'top') return y + options.paddingY + options.fontSize
  if (verticalAlign === 'bottom') {
    return y + height - options.paddingY - textHeight + options.fontSize
  }
  return y + (height - textHeight) / 2 + options.fontSize
}

function createOffsets(values: number[]): number[] {
  const offsets: number[] = []
  let current = 0
  values.forEach((value) => {
    offsets.push(current)
    current += value
  })
  return offsets
}

function sumRange(values: number[], start: number, count: number): number {
  return values.slice(start, start + count).reduce((sum, value) => sum + value, 0)
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
