/**
 * DOM 预处理页面
 *
 * 当没有可用的 http/https tab 时，Service Worker 创建此页面的临时 tab 做 DOM 预处理。
 * 处理完后 tab 自动关闭。
 *
 * 另外也承担 Mermaid 渲染：mermaid 库没有打进常驻的 content script
 * （content script 会在所有页面注入，体积敏感），只有真正遇到 Mermaid 时
 * 才由后台把预处理路由到这个扩展页面来渲染。
 */
import { preprocessForPlatform, preprocessContentDOM, type PreprocessResult } from '../lib/content-processor'
import { htmlToMarkdownNative, type PreprocessConfig } from '@wechatsync/core'
import { renderMermaidInHtml } from '../lib/mermaid-renderer'
import { rasterizeSvgContentInHtml } from '../lib/svg-rasterizer'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PREPROCESS_FOR_PLATFORMS') {
    const { rawHtml, platforms, configs, renderMermaid, rasterizeSvg } = message.payload as {
      rawHtml: string
      platforms: string[]
      configs: Record<string, PreprocessConfig>
      renderMermaid?: boolean
      rasterizeSvg?: boolean
    }

    // Mermaid 渲染 + 矢量图光栅化都只做一次，所有目标平台共用处理后的 HTML
    const prepare = (async () => {
      let html = rawHtml
      const summary = { rendered: 0, failed: 0, errors: [] as string[] }

      if (renderMermaid) {
        const result = await renderMermaidInHtml(html)
        html = result.html
        summary.rendered += result.summary.rendered
        summary.failed += result.summary.failed
        summary.errors.push(...result.summary.errors)
      }

      // 兜底：页面里已经渲染好的矢量图（Mermaid 流程图等）
      // 转成 PNG，否则微信会把 SVG 直接丢掉，留下空白缺口
      if (rasterizeSvg) {
        const result = await rasterizeSvgContentInHtml(html)
        html = result.html
        summary.rendered += result.summary.rendered
        summary.failed += result.summary.failed
        summary.errors.push(...result.summary.errors)
      }

      return { html, summary }
    })()

    prepare
      .then(({ html: preparedHtml, summary: mermaidSummary }) => {
        const platformContents: Record<string, PreprocessResult> = {}

        for (const platformId of platforms) {
          const config = configs[platformId]
          if (config) {
            platformContents[platformId] = preprocessForPlatform(preparedHtml, config)
          } else {
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = preparedHtml
            preprocessContentDOM(tempDiv)
            const html = tempDiv.innerHTML
            platformContents[platformId] = {
              html,
              markdown: htmlToMarkdownNative(html),
            }
          }
        }

        sendResponse({ platformContents, mermaid: mermaidSummary })
      })
      .catch((error) => {
        sendResponse({ error: (error as Error).message })
      })

    // 保持消息通道，等待异步渲染完成后再响应
    return true
  }
  return false
})
