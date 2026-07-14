import type { HeadingLevel } from '@wechatsync/core'

/**
 * 为指定级别的 HTML 标题增加显式粗体语义。
 * 已经完全由 strong 或 b 包裹的标题保持不变。
 */
export function ensureBoldHeadings(container: HTMLElement, levels: HeadingLevel[]): void {
  const uniqueLevels = Array.from(new Set(levels))
  if (uniqueLevels.length === 0) return

  const selector = uniqueLevels.map((level) => `h${level}`).join(', ')
  container.querySelectorAll(selector).forEach((heading) => {
    if (hasFullBoldWrapper(heading)) return

    const strong = document.createElement('strong')
    while (heading.firstChild) {
      strong.appendChild(heading.firstChild)
    }
    heading.appendChild(strong)
  })
}

function hasFullBoldWrapper(heading: Element): boolean {
  const meaningfulNodes = Array.from(heading.childNodes).filter(
    (node) => node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim())
  )

  if (meaningfulNodes.length !== 1) return false
  const wrapper = meaningfulNodes[0]
  return wrapper.nodeType === Node.ELEMENT_NODE
    && ['STRONG', 'B'].includes((wrapper as Element).tagName)
}
