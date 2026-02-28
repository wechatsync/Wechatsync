/**
 * 内容预处理模块 (Content Script 环境，有 DOM)
 *
 * 架构说明:
 * 1. 用户选择 N 个平台
 * 2. 读取每个平台的预处理配置
 * 3. Content Script 为每个平台分别预处理
 * 4. 每个平台收到自己定制的 html/markdown
 * 5. Service Worker 只做图片上传 + 调用 API
 */

import { htmlToMarkdownNative, type PreprocessConfig } from '@wechatsync/core'
import { createLogger } from './logger'

const logger = createLogger('ContentProcessor')

// 注意：htmlToMarkdownNative 需要 DOM 环境，只能在 Content Script 中使用

// Re-export PreprocessConfig for backward compatibility
export type { PreprocessConfig }

/**
 * 预处理结果
 */
export interface PreprocessResult {
  html: string
  markdown: string
}

/**
 * 为单个平台预处理内容
 * @param rawHtml 原始 HTML
 * @param config 平台的预处理配置
 * @returns 处理后的 html 和 markdown
 *
 * 注意：代码块应在入口处用 backupAndSimplifyCodeBlocks 在原始 DOM 上预处理，
 * 此函数中的 processCodeBlocks 会跳过已处理的代码块（有 data-code-simplified 标记）
 */
export function preprocessForPlatform(rawHtml: string, config: PreprocessConfig): PreprocessResult {
  // 创建临时 DOM 容器
  const container = document.createElement('div')
  container.innerHTML = rawHtml

  if (config.processCodeBlocks) {
    processCodeBlocks(container)
  }

  // 按配置执行预处理
  if (config.removeComments) {
    removeComments(container)
  }

  if (config.removeIframes) {
    removeElements(container, ['iframe'])
  }

  if (config.removeSpecialTags) {
    if (config.removeSpecialTagsWithParent) {
      // 知乎等平台：移除特殊标签的父元素
      removeElementsWithParent(container, ['mpprofile', 'qqmusic'])
      // 其他特殊标签只移除自身
      removeElements(container, [
        'mpvoice', 'mpcps', 'mp-miniprogram', 'mp-common-product',
      ])
    } else {
      removeElements(container, [
        'mpprofile', 'qqmusic', 'mpvoice', 'mpcps',
        'mp-miniprogram', 'mp-common-product',
      ])
    }
  }

  if (config.removeSvgImages) {
    processSvgImages(container)
  }

  // 移除 script 和 style（总是执行）
  removeElements(container, ['script', 'style', 'noscript'])

  if (config.removeLinks) {
    processLinks(container, config.keepLinkDomains)
  }

  if (config.processLazyImages) {
    processLazyImages(container)
  }

  if (config.removeEmptyElements) {
    removeEmptyElements(container)
  }

  if (config.removeEmptyImages) {
    removeEmptyImages(container)
  }

  if (config.removeDataAttributes) {
    removeDataAttributes(container)
  }

  if (config.removeSrcset || config.removeSizes) {
    removeImageAttributes(container, config)
  }

  if (config.convertSectionToDiv) {
    convertSections(container, 'div')
  } else if (config.convertSectionToP) {
    convertSections(container, 'p')
  }

  // 知乎等平台需要的额外处理
  if (config.removeTrailingBr) {
    removeTrailingBr(container)
  }

  if (config.unwrapNestedFigures) {
    unwrapNestedFigures(container)
  }

  if (config.flattenNestedBold) {
    flattenNestedBold(container)
  }

  if (config.unwrapSingleChildSpans) {
    unwrapSingleChildSpans(container)
  }

  if (config.unwrapSingleChildContainers) {
    unwrapSingleChildContainers(container)
  }

  if (config.compactHtml) {
    compactHtml(container)
  }

  // 清理空内容
  if (config.removeEmptyLines) {
    removeEmptyLines(container)
  }

  if (config.removeEmptyDivs) {
    removeEmptyDivs(container)
  }

  if (config.removeNestedEmptyContainers) {
    removeNestedEmptyContainers(container)
  }

  // 获取处理后的 HTML
  const html = container.innerHTML

  // 总是生成 markdown，确保需要 markdown 的适配器能获取到内容
  const markdown = htmlToMarkdownNative(html)
  return { html, markdown }
}

/**
 * 为多个平台预处理内容
 * @param rawHtml 原始 HTML
 * @param configs 各平台的预处理配置 { platformId: config }
 * @returns 各平台的预处理结果 { platformId: { html, markdown } }
 */
export function preprocessForMultiplePlatforms(
  rawHtml: string,
  configs: Record<string, PreprocessConfig>
): Record<string, PreprocessResult> {
  const results: Record<string, PreprocessResult> = {}

  for (const [platformId, config] of Object.entries(configs)) {
    results[platformId] = preprocessForPlatform(rawHtml, config)
  }

  return results
}

// ============ 预处理函数 ============

/**
 * 移除 HTML 注释
 */
function removeComments(container: HTMLElement): void {
  const iterator = document.createNodeIterator(
    container,
    NodeFilter.SHOW_COMMENT,
    null
  )
  const comments: Comment[] = []
  let node: Comment | null
  while ((node = iterator.nextNode() as Comment | null)) {
    comments.push(node)
  }
  comments.forEach((comment) => comment.remove())
}

/**
 * 移除匹配选择器的元素
 */
function removeElements(container: HTMLElement, selectors: string[]): void {
  const selector = selectors.join(', ')
  container.querySelectorAll(selector).forEach((el) => el.remove())
}

/**
 * 移除匹配选择器的元素及其父元素
 * 用于处理 mpprofile, qqmusic 等微信特殊标签
 */
function removeElementsWithParent(container: HTMLElement, selectors: string[]): void {
  const selector = selectors.join(', ')
  container.querySelectorAll(selector).forEach((el) => {
    // 移除父元素（如果存在且不是 container 本身）
    const parent = el.parentElement
    if (parent && parent !== container) {
      parent.remove()
    } else {
      el.remove()
    }
  })
}

/**
 * 处理 SVG 占位图片
 */
function processSvgImages(container: HTMLElement): void {
  const svgImages = container.querySelectorAll('img[src^="data:image/svg"]')
  svgImages.forEach((img) => {
    const dataSrc = img.getAttribute('data-src')
    if (dataSrc) {
      img.setAttribute('src', dataSrc)
    } else {
      img.remove()
    }
  })
}

/**
 * 处理链接
 */
function processLinks(container: HTMLElement, keepDomains?: string[]): void {
  const links = container.querySelectorAll('a')

  links.forEach((link) => {
    const href = link.getAttribute('href')

    if (href && keepDomains?.length) {
      const shouldKeep = keepDomains.some(domain => href.includes(domain))
      if (shouldKeep) return
    }

    // 用 span 替换 a 标签
    const span = document.createElement('span')
    span.innerHTML = link.innerHTML
    link.parentNode?.replaceChild(span, link)
  })
}

/**
 * 处理懒加载图片
 */
function processLazyImages(container: HTMLElement): void {
  const imgs = container.querySelectorAll('img')
  const lazySrcAttrs = ['data-src', 'data-original', 'data-actualsrc', '_src']

  imgs.forEach((img) => {
    for (const attr of lazySrcAttrs) {
      const lazySrc = img.getAttribute(attr)
      if (lazySrc && !lazySrc.startsWith('data:image/svg')) {
        if (!img.src || img.src.startsWith('data:image/svg')) {
          img.src = lazySrc
        }
        break
      }
    }
    lazySrcAttrs.forEach(attr => img.removeAttribute(attr))
  })
}

/**
 * 检测元素是否是行号容器（包含连续数字 1, 2, 3...）
 */
function isLineNumberContainer(el: Element, codeLineCount: number): boolean {
  // 检查 ul/ol 的 li 子元素
  if (el.tagName === 'UL' || el.tagName === 'OL') {
    const items = el.querySelectorAll('li')
    // 情况1: li 数量与代码行数匹配（空 li，用 CSS 生成行号）
    if (items.length >= 2 && items.length === codeLineCount) {
      const allEmpty = Array.from(items).every(li => !li.textContent?.trim())
      if (allEmpty) return true
    }
    // 情况2: li 包含连续数字 1, 2, 3...
    if (items.length >= 2) {
      let isSequential = true
      items.forEach((li, i) => {
        const num = parseInt(li.textContent?.trim() || '', 10)
        if (num !== i + 1) isSequential = false
      })
      if (isSequential) return true
    }
  }

  // 检查元素内容是否是换行分隔的连续数字
  const text = el.textContent?.trim() || ''
  const lines = text.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean)
  if (lines.length >= 2) {
    const allSequential = lines.every((line, i) => parseInt(line, 10) === i + 1)
    if (allSequential) return true
  }

  return false
}

/**
 * 移除 pre 元素相关的行号容器
 * 使用结构检测而非硬编码 class 名
 */
function removeLineNumberSiblings(pre: Element): void {
  const parent = pre.parentElement
  if (!parent) return

  // 计算代码行数（code 元素数量或文本行数）
  const codeElements = pre.querySelectorAll('code')
  const codeLineCount = codeElements.length > 1
    ? codeElements.length
    : (pre.textContent?.split('\n').length || 0)

  // 检查同级兄弟元素
  Array.from(parent.children).forEach(sibling => {
    if (sibling !== pre && isLineNumberContainer(sibling, codeLineCount)) {
      sibling.remove()
    }
  })
}

/**
 * 可作为代码行容器的标签
 * 这些标签通常用于包裹单行代码
 */
const LINE_CONTAINER_TAGS = new Set(['CODE', 'DIV', 'SPAN', 'P', 'LI'])

/**
 * 检查子元素是否构成有效的"多行结构"
 *
 * 有效多行结构的特征：
 * 1. 至少2个子元素
 * 2. 全是同一类型的标签（CODE/DIV/SPAN/P/LI）
 * 3. 或者全是 display:block 的元素
 *
 * 无效情况（应使用 innerText）：
 * - 混合类型（如 br + span + text）
 * - 少于2个子元素
 * - 子元素是 BR 等非容器标签
 */
function isValidLineStructure(children: Element[]): boolean {
  if (children.length < 2) return false

  const firstTag = children[0].tagName

  // BR 不是有效的行容器
  if (firstTag === 'BR') return false

  // 检查是否全是同一类型的行容器标签
  if (LINE_CONTAINER_TAGS.has(firstTag)) {
    return children.every(child => child.tagName === firstTag)
  }

  // 检查是否全是 display:block 的元素（某些高亮库用自定义标签）
  const allBlock = children.every(child => {
    const style = child.getAttribute('style') || ''
    return style.includes('display:block') || style.includes('display: block')
  })

  return allBlock
}

/**
 * 递归查找包含代码行的容器
 *
 * 支持的格式：
 * - <pre><code>L1</code><code>L2</code></pre> (微信公众号)
 * - <pre><code><code>L1</code><code>L2</code></code></pre> (嵌套code)
 * - <pre><code><div>L1</div><div>L2</div></code></pre> (expressive-code)
 * - <pre><code><span style="display:block">L1</span>...</code></pre> (某些高亮库)
 *
 * 不匹配的格式（返回 null，使用 innerText）：
 * - <pre><code>text<br>text</code></pre> (br换行)
 * - <pre><code>text\ntext</code></pre> (纯文本)
 * - <pre><code>text<span>...</span>text</code></pre> (混合内联)
 *
 * @param el 起始元素
 * @param depth 当前递归深度
 * @returns 包含多行子元素的容器，或 null
 */
function findLinesContainer(el: Element, depth: number): Element | null {
  if (depth > 4) return null

  const children = Array.from(el.children)

  // 检查当前元素是否是有效的多行容器
  if (isValidLineStructure(children)) {
    return el
  }

  // 只有一个子元素，继续向下递归
  if (children.length === 1) {
    return findLinesContainer(children[0], depth + 1)
  }

  return null
}

/**
 * 查找包含代码行的容器（入口函数）
 */
function findCodeLinesContainer(pre: Element): Element | null {
  return findLinesContainer(pre, 0)
}

/**
 * 处理代码块
 * 使用 DOM 的 innerText 自动解码 HTML 实体
 * 处理微信等平台将每行代码放在单独标签的情况
 */
function processCodeBlocks(container: HTMLElement): void {
  // 1. 先用特定选择器移除已知的行号元素
  removeElements(container, [
    'ul.code-snippet__line-index',
    '.code-snippet__line-index',
    '.line-numbers-rows',  // Prism.js
    '.hljs-ln-numbers',    // highlight.js
    '.gutter',             // 通用
  ])

  // 简化 pre 标签
  const pres = container.querySelectorAll('pre')

  pres.forEach((pre) => {
    try {
      // 跳过已经被 backupAndSimplifyCodeBlocks 处理过的代码块
      if (pre.hasAttribute('data-code-simplified')) {
        return
      }

      // 2. 再用结构检测移除未知的行号元素（通用方案）
      removeLineNumberSiblings(pre)

      // 查找代码行容器
      const linesContainer = findCodeLinesContainer(pre)

      logger.debug('[processCodeBlocks] pre.innerHTML:', pre.innerHTML.slice(0, 200))
      logger.debug('[processCodeBlocks] linesContainer:', linesContainer?.tagName, 'children:', linesContainer?.children.length)

      let newHtml: string

      if (linesContainer) {
        // 多行容器：每个子元素是一行代码
        const lines: string[] = []
        Array.from(linesContainer.children).forEach((child) => {
          const text = child.textContent || ''
          lines.push(escapeHtml(text))
        })
        newHtml = lines.join('\n')
      } else {
        // 普通格式：用 innerText 提取（保留换行）
        // 注意：如果代码块未经 backupAndSimplifyCodeBlocks 预处理，
        // 在 detached DOM 上 innerText 可能无法正确处理 <br> 等
        const text = pre.innerText || pre.textContent || ''
        newHtml = `<code>${escapeHtml(text)}</code>`
      }

      // 清理：移除开头结尾空行
      newHtml = newHtml
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/^\n+/, '')
        .replace(/\n+$/, '')

      // 空代码块跳过
      if (!newHtml.trim()) {
        pre.remove()
        return
      }

      pre.innerHTML = newHtml
      pre.removeAttribute('class')
      pre.removeAttribute('style')
      pre.removeAttribute('data-lang')
    } catch (e) {
      logger.error('processCodeBlocks error:', e)
    }
  })

}

/**
 * 仅处理代码块（供 Reader 路径提前调用）
 */
export function preprocessCodeBlocks(container: HTMLElement): void {
  processCodeBlocks(container)
}

/**
 * 移除没有有效 src 的 img 标签（src 缺失或为空字符串）
 */
function removeEmptyImages(container: HTMLElement): void {
  container.querySelectorAll('img').forEach((img) => {
    if (!img.src || img.src === window.location.href) {
      img.remove()
    }
  })
}

/**
 * 移除空元素
 */
function removeEmptyElements(container: HTMLElement): void {
  for (let i = 0; i < 3; i++) {
    const emptyElements = container.querySelectorAll('p, div, section, span, figure')
    let removed = 0

    emptyElements.forEach((el) => {
      const hasText = el.textContent?.trim()
      const hasMedia = el.querySelector('img, video, audio, iframe, canvas, svg')

      if (!hasText && !hasMedia) {
        el.remove()
        removed++
      }
    })

    if (removed === 0) break
  }
}

/**
 * 移除 data-* 属性
 */
function removeDataAttributes(container: HTMLElement): void {
  const allElements = container.querySelectorAll('*')

  allElements.forEach((el) => {
    const attrs = Array.from(el.attributes)
    attrs.forEach((attr) => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-src') {
        el.removeAttribute(attr.name)
      }
    })
  })
}

/**
 * 移除图片的 srcset/sizes 属性
 */
function removeImageAttributes(container: HTMLElement, config: PreprocessConfig): void {
  const images = container.querySelectorAll('img')
  images.forEach((img) => {
    if (config.removeSrcset) img.removeAttribute('srcset')
    if (config.removeSizes) img.removeAttribute('sizes')
    img.removeAttribute('loading')
    img.removeAttribute('decoding')
  })
}

/**
 * 转换 section 标签
 */
function convertSections(container: HTMLElement, targetTag: 'div' | 'p'): void {
  const sections = container.querySelectorAll('section')
  sections.forEach((section) => {
    const newEl = document.createElement(targetTag)
    newEl.innerHTML = section.innerHTML
    // 复制属性
    Array.from(section.attributes).forEach((attr) => {
      newEl.setAttribute(attr.name, attr.value)
    })
    section.parentNode?.replaceChild(newEl, section)
  })
}

/**
 * 移除段落尾部的 <br> 标签
 */
function removeTrailingBr(container: HTMLElement): void {
  // 查找所有 p, div, section 元素
  const elements = container.querySelectorAll('p, div, section')
  elements.forEach((el) => {
    // 移除末尾的 br 标签
    while (el.lastElementChild?.tagName === 'BR') {
      el.lastElementChild.remove()
    }
  })
}

/**
 * 解包嵌套的 figure 标签
 * <figure><figure><img></figure></figure> → <figure><img></figure>
 */
/**
 * 展平嵌套的 b/strong 标签
 * 移除作为容器使用的内层 b/strong，保留内容（微信编辑器常见问题）
 */
function flattenNestedBold(container: HTMLElement): void {
  // b b / b strong / strong b / strong strong —— 任意后代关系都算嵌套
  const selectors = ['b b', 'b strong', 'strong b', 'strong strong']
  for (let i = 0; i < 5; i++) {
    let removed = 0
    for (const sel of selectors) {
      container.querySelectorAll(sel).forEach((inner) => {
        const parent = inner.parentNode
        if (!parent) return
        while (inner.firstChild) {
          parent.insertBefore(inner.firstChild, inner)
        }
        parent.removeChild(inner)
        removed++
      })
    }
    if (removed === 0) break
  }
}

/**
 * 解包纯容器 span（减少过深嵌套）
 * 微信编辑器常见：span→span→span→span→text，Toutiao 可能有嵌套深度限制
 * 策略：只要 span 本身没有直接文本内容（内容全在子元素里），就解包，
 * 不限子元素数量和类型。保留含直接文本的 span（混合内容）。
 */
function unwrapSingleChildSpans(container: HTMLElement): void {
  for (let i = 0; i < 10; i++) {
    let unwrapped = 0

    const allSpans = Array.from(container.querySelectorAll('span'))

    for (const span of allSpans) {
      if (!span.parentNode) continue // already detached

      // Skip empty spans (no children at all)
      if (span.childNodes.length === 0) continue

      // If span has any direct non-whitespace text, keep it (mixed content)
      const hasDirectText = Array.from(span.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim()
      )
      if (hasDirectText) continue

      // Pure container span: lift all children up and remove the wrapper
      const parent = span.parentNode
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span)
      }
      parent.removeChild(span)
      unwrapped++
    }

    if (unwrapped === 0) break
  }
}

function unwrapNestedFigures(container: HTMLElement): void {
  // 多次迭代处理多层嵌套
  for (let i = 0; i < 5; i++) {
    const nestedFigures = container.querySelectorAll('figure > figure')
    if (nestedFigures.length === 0) break

    nestedFigures.forEach((innerFigure) => {
      const outerFigure = innerFigure.parentElement
      if (outerFigure?.tagName === 'FIGURE') {
        // 用内层 figure 替换外层
        outerFigure.parentNode?.replaceChild(innerFigure, outerFigure)
      }
    })
  }
}

/**
 * 解包单一子元素容器
 * 移除只包含单个子元素的无意义包装 div
 */
function unwrapSingleChildContainers(container: HTMLElement): void {
  // 多次迭代处理嵌套
  for (let i = 0; i < 5; i++) {
    let unwrapped = 0

    // 查找只有单个子元素的 div
    const divs = container.querySelectorAll('div')
    divs.forEach((div) => {
      // 检查是否只有单个元素子节点（忽略空白文本节点）
      const children = Array.from(div.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
      )

      if (children.length === 1 && children[0].nodeType === Node.ELEMENT_NODE) {
        const child = children[0] as HTMLElement
        // 只解包特定标签
        if (['DIV', 'ARTICLE', 'P', 'SECTION'].includes(child.tagName)) {
          div.parentNode?.replaceChild(child, div)
          unwrapped++
        }
      }
    })

    if (unwrapped === 0) break
  }
}

/**
 * 压缩 HTML（移除标签间的空白）
 * 适用于 Draft.js 等编辑器
 */
function compactHtml(container: HTMLElement): void {
  // 递归处理文本节点，移除标签间的空白
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  )

  const nodesToRemove: Text[] = []
  let node: Text | null

  while ((node = walker.nextNode() as Text | null)) {
    // 如果文本节点只包含空白，且前后都是元素节点，则标记为移除
    if (node.textContent && /^\s+$/.test(node.textContent)) {
      const prev = node.previousSibling
      const next = node.nextSibling
      const parent = node.parentNode

      // 在块级元素之间的空白可以移除
      if (parent && parent.nodeName !== 'PRE' && parent.nodeName !== 'CODE') {
        if ((!prev || prev.nodeType === Node.ELEMENT_NODE) &&
            (!next || next.nodeType === Node.ELEMENT_NODE)) {
          nodesToRemove.push(node)
        }
      }
    }
  }

  nodesToRemove.forEach((n) => n.remove())
}

/**
 * 移除空行（只含 br 或空白的段落）
 */
function removeEmptyLines(container: HTMLElement): void {
  const elements = container.querySelectorAll('p, section')
  elements.forEach((el) => {
    // 检查是否只包含空白或 br
    const hasOnlyBrOrWhitespace = Array.from(el.childNodes).every((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return !node.textContent?.trim()
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return (node as Element).tagName === 'BR'
      }
      return true
    })

    if (hasOnlyBrOrWhitespace) {
      el.remove()
    }
  })
}

/**
 * 移除空 div（只含 br 或空白，但保留含图片的）
 */
function removeEmptyDivs(container: HTMLElement): void {
  const divs = container.querySelectorAll('div')
  divs.forEach((div) => {
    // 如果包含图片/视频等媒体元素，保留
    if (div.querySelector('img, video, audio, canvas, svg, iframe')) {
      return
    }

    // 检查是否只包含空白或 br
    const hasOnlyBrOrWhitespace = Array.from(div.childNodes).every((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return !node.textContent?.trim()
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return (node as Element).tagName === 'BR'
      }
      return true
    })

    if (hasOnlyBrOrWhitespace) {
      div.remove()
    }
  })
}

/**
 * 移除嵌套的空容器
 */
function removeNestedEmptyContainers(container: HTMLElement): void {
  // 多次迭代处理嵌套
  for (let i = 0; i < 5; i++) {
    let removed = 0

    const elements = container.querySelectorAll('div, section, article, span')
    elements.forEach((el) => {
      // 如果包含媒体元素，保留
      if (el.querySelector('img, video, audio, canvas, svg, iframe')) {
        return
      }

      // 检查是否为空或只包含空白
      const text = el.textContent?.trim() || ''
      const hasChildren = el.children.length > 0

      // 完全空的容器
      if (!text && !hasChildren) {
        el.remove()
        removed++
        return
      }

      // 只包含 br 的容器
      if (!text && hasChildren) {
        const allBr = Array.from(el.children).every(
          (child) => child.tagName === 'BR'
        )
        if (allBr) {
          el.remove()
          removed++
        }
      }
    })

    if (removed === 0) break
  }
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

// ============ 兼容旧 API ============

/**
 * @deprecated 使用 preprocessForPlatform 代替
 *
 * 注意：此函数是全局预处理，不使用平台特定配置。
 * 如需使用平台配置（如知乎的 removeEmptyLines），应使用 preprocessForPlatform。
 */
export function preprocessContentDOM(container: HTMLElement): void {
  // 执行默认的全部预处理（不包含平台特定处理）
  removeComments(container)
  removeElements(container, ['iframe', 'script', 'style', 'noscript'])
  removeElements(container, ['mpprofile', 'qqmusic', 'mpvoice', 'mpcps', 'mp-miniprogram', 'mp-common-product'])
  processSvgImages(container)
  processLazyImages(container)
  processCodeBlocks(container)
  removeEmptyElements(container)
  removeDataAttributes(container)
  removeImageAttributes(container, { outputFormat: 'html', removeSrcset: true, removeSizes: true })
}

/**
 * @deprecated 使用 preprocessForPlatform 代替
 */
export function preprocessContentString(html: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  preprocessContentDOM(tempDiv)
  return tempDiv.innerHTML
}

// ============ 代码块 Backup/Restore (用于原始 DOM 处理) ============

/**
 * 元素备份信息
 */
export interface ElementBackup {
  element: Element
  originalHTML: string
}

/**
 * 在原始 DOM 上简化代码块，返回备份以便恢复
 * 必须在克隆之前调用，因为 innerText 只在真实 DOM 上正确工作
 *
 * 使用与 processCodeBlocks 相同的逻辑，确保一致性
 *
 * @param root 要处理的根元素（默认为 document.body）
 */
export function backupAndSimplifyCodeBlocks(root: Element = document.body): ElementBackup[] {
  const backups: ElementBackup[] = []

  // 行号元素选择器（用于临时隐藏）
  const GUTTER_SELECTORS = [
    '.gutter',
    '.line-numbers-rows',
    '.hljs-ln-numbers',
    '.code-snippet__line-index',
    'ul.code-snippet__line-index',
    '[class*="line-number"]',
    '[class*="lineNumber"]',
  ].join(', ')

  root.querySelectorAll('pre').forEach((pre) => {
    try {
      // 保存原始 HTML
      const originalHTML = pre.innerHTML

      // 临时隐藏行号元素（不删除，因为要恢复）
      const gutterEls = pre.querySelectorAll(GUTTER_SELECTORS)
      const gutterDisplays: string[] = []
      gutterEls.forEach((el, i) => {
        gutterDisplays[i] = (el as HTMLElement).style.display
        ;(el as HTMLElement).style.display = 'none'
      })

      // 使用结构检测移除未知的行号元素（临时）
      // 注意：这里不能调用 removeLineNumberSiblings 因为会修改 DOM
      // 我们只是临时隐藏，所以跳过这步

      // 查找代码行容器（与 processCodeBlocks 相同的逻辑）
      const linesContainer = findCodeLinesContainer(pre)

      let cleanedText: string

      if (linesContainer) {
        // 多行容器：每个子元素是一行代码
        const lines: string[] = []
        Array.from(linesContainer.children).forEach((child) => {
          const text = child.textContent || ''
          lines.push(text)
        })
        cleanedText = lines.join('\n')
      } else {
        // 普通格式：用 innerText 提取（在真实 DOM 上能正确处理 br 等）
        const code = pre.querySelector('code')
        const targetEl = (code || pre) as HTMLElement
        cleanedText = targetEl.innerText || ''
      }

      // 恢复行号显示
      gutterEls.forEach((el, i) => {
        ;(el as HTMLElement).style.display = gutterDisplays[i]
      })

      // 清理首尾空白
      cleanedText = cleanedText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/^\n+/, '')
        .replace(/\n+$/, '')

      // 跳过空代码块
      if (!cleanedText.trim()) return

      logger.debug('[backupAndSimplifyCodeBlocks] original:', originalHTML.slice(0, 100))
      logger.debug('[backupAndSimplifyCodeBlocks] cleaned text:', cleanedText.slice(0, 100))

      backups.push({
        element: pre,
        originalHTML: originalHTML,
      })

      // 替换为纯文本，添加标记表示已处理
      pre.innerHTML = `<code>${escapeHtml(cleanedText)}</code>`
      pre.setAttribute('data-code-simplified', 'true')
    } catch (e) {
      logger.error('[backupAndSimplifyCodeBlocks] error:', e)
    }
  })

  return backups
}

/**
 * 恢复被简化的代码块
 */
export function restoreCodeBlocks(backups: ElementBackup[]): void {
  backups.forEach(({ element, originalHTML }) => {
    element.innerHTML = originalHTML
  })
}
