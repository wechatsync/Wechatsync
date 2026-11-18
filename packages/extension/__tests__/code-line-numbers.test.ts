// @vitest-environment happy-dom
/**
 * 代码块行号列清理测试 (#219)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// vitest.setup.ts 全局 mock 了 @wechatsync/core，这里补上 content-processor 用到的导出
vi.mock('@wechatsync/core', () => ({
  htmlToMarkdownNative: vi.fn(() => ''),
  SOURCE_LINK_REMOVE_DOMAINS: [],
  SOURCE_LINK_REDIRECT_RULES: [],
}))

import {
  preprocessForPlatform,
  backupAndSimplifyCodeBlocks,
  restoreCodeBlocks,
} from '../src/lib/content-processor'

// doocs/md 开启行号后的结构，公众号发布后 class 被去掉
const doocsNumberedPre = (withClass: boolean) => `
<pre><code><section style="display:flex">
  <section${withClass ? ' class="line-numbers"' : ''}><section>1</section><section>2</section><section>3</section></section>
  <section${withClass ? ' class="code-scroll"' : ''}><span>ColorBy(display)<br>lut = GetLut()<br>cbar = GetBar(lut)</span></section>
</section></code></pre>`

function preTextOf(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.querySelector('pre')?.textContent || ''
}

describe('processCodeBlocks: inner line number column', () => {
  it.each([true, false])('removes doocs/md line numbers (class kept: %s)', (withClass) => {
    const { html } = preprocessForPlatform(doocsNumberedPre(withClass), {
      outputFormat: 'html',
      processCodeBlocks: true,
    })
    const text = preTextOf(html)

    expect(text.trim().startsWith('ColorBy')).toBe(true)
    expect(text).toContain('cbar = GetBar(lut)')
    expect(text).not.toMatch(/^\s*1\s*2\s*3/)
  })

  it('keeps a code block whose content is just 1, 2, 3', () => {
    const { html } = preprocessForPlatform(
      '<pre><code><code>1</code><code>2</code><code>3</code></code></pre>',
      { outputFormat: 'html', processCodeBlocks: true }
    )

    expect(preTextOf(html)).toBe('1\n2\n3')
  })
})

describe('backupAndSimplifyCodeBlocks: inner line number column', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(root)
  })

  it('hides doocs/md line numbers without class and restores original', () => {
    root.innerHTML = doocsNumberedPre(false)
    const pre = root.querySelector('pre')!
    const originalHTML = pre.innerHTML

    const backups = backupAndSimplifyCodeBlocks(root)
    const text = pre.textContent || ''

    expect(backups).toHaveLength(1)
    expect(text.trim().startsWith('ColorBy')).toBe(true)
    expect(text).not.toMatch(/^\s*1\s*2\s*3/)

    restoreCodeBlocks(backups)
    expect(pre.innerHTML).toBe(originalHTML)
  })
})
