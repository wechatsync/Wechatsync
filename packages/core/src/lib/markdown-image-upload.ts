import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { parseHTML } from 'linkedom'

/**
 * 只替换 Markdown 中真实的图片节点，保留代码、公式和其他原文。
 * 使用源位置而非重新序列化整篇文章，避免改写技术文章格式。
 * 上传异常直接向上传递，调用方只有在全部图片成功后才能保存。
 */
export async function uploadMarkdownImages(
  markdown: string,
  uploadImage: (src: string) => Promise<string>,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const definitions = new Map<string, { url: string; title?: string | null }>()
  visit(tree, 'definition', (node) => {
    if (!definitions.has(node.identifier)) definitions.set(node.identifier, node)
  })

  const replacements: Array<{ start: number; end: number; render: () => Promise<string> }> = []
  const uploaded = new Map<string, string>()
  let total = 0
  let completed = 0
  const upload = async (src: string) => {
    let url = uploaded.get(src)
    if (!url) {
      url = await uploadImage(src)
      uploaded.set(src, url)
    }
    onProgress?.(++completed, total)
    return url
  }

  visit(tree, (node) => {
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start === undefined || end === undefined) return

    if (node.type === 'image' || node.type === 'imageReference') {
      const image = node.type === 'image' ? node : definitions.get(node.identifier)
      if (!image) return
      total++
      replacements.push({
        start,
        end,
        render: async () => {
          const url = (await upload(image.url)).replace(/[()<>\s]/g, encodeURIComponent)
          const alt = (node.alt || '').replace(/[\\[\]]/g, '\\$&')
          const title = image.title ? ` ${JSON.stringify(image.title)}` : ''
          // 引用式图片转为行内图片，避免改动与普通链接共用的定义。
          return `![${alt}](${url}${title})`
        },
      })
    } else if (node.type === 'html') {
      // HTML 解析器正确区分注释与 img，并支持单引号、无引号属性。
      const { document } = parseHTML(node.value)
      const images = Array.from(document.querySelectorAll('img'))
      if (!images.length) return
      total += images.length
      replacements.push({
        start,
        end,
        render: async () => {
          for (const image of images) {
            const src = image.getAttribute('src') || image.getAttribute('data-src')
            if (!src) throw new Error('图片上传失败：HTML 图片缺少地址')
            image.setAttribute('src', await upload(src))
            image.removeAttribute('data-src')
            image.removeAttribute('srcset')
            image.removeAttribute('sizes')
          }
          return document.toString()
        },
      })
    }
  })

  let result = ''
  let cursor = 0
  for (const { start, end, render } of replacements.sort(
    (left, right) => left.start - right.start
  )) {
    result += markdown.slice(cursor, start) + (await render())
    cursor = end
  }
  return result + markdown.slice(cursor)
}
