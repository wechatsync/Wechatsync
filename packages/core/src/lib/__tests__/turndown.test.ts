/**
 * Turndown HTML→Markdown 转换测试
 */
import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from '../turndown'

describe('htmlToMarkdown', () => {
  describe('Table conversion', () => {
    it('should convert table with thead to markdown', () => {
      const html = `<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>`
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('| Header 1 |')
      expect(markdown).toContain('| Header 2 |')
      expect(markdown).toContain('| --- |')
      expect(markdown).toContain('| Cell 1 |')
      expect(markdown).toContain('| Cell 2 |')
    })

    it('should convert table with th in first row to markdown', () => {
      const html = `
        <table>
          <tr>
            <th>Header A</th>
            <th>Header B</th>
          </tr>
          <tr>
            <td>Data A</td>
            <td>Data B</td>
          </tr>
        </table>
      `
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('| Header A |')
      expect(markdown).toContain('| Header B |')
      expect(markdown).toContain('| --- |')
      expect(markdown).toContain('| Data A |')
    })

    it('should convert table without th using first row as header (fallback)', () => {
      // 没有表头的表格使用第一行作为表头（降级处理）
      const html = `
        <table>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <tr>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </tr>
        </table>
      `
      const markdown = htmlToMarkdown(html)
      // 第一行作为表头，后续行作为数据
      expect(markdown).toContain('| Cell 1 |')
      expect(markdown).toContain('| Cell 2 |')
      expect(markdown).toContain('| --- |')
      expect(markdown).toContain('| Cell 3 |')
      expect(markdown).toContain('| Cell 4 |')
    })

    it('should preserve table alignment markers', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th align="left">Left</th>
              <th align="center">Center</th>
              <th align="right">Right</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
            </tr>
          </tbody>
        </table>
      `
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('| Left |')
      expect(markdown).toContain('| Center |')
      expect(markdown).toContain('| Right |')
      // 验证对齐标记
      expect(markdown).toContain(':---')   // left
      expect(markdown).toContain(':---:')  // center
      expect(markdown).toContain('---:')   // right
    })

    it('should escape pipe characters in table cells', () => {
      const html = `
        <table>
          <thead>
            <tr><th>Command</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td>a | b</td><td>OR operation</td></tr>
          </tbody>
        </table>
      `
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('a \\| b')  // 管道符被转义
    })

    it('should convert table wrapped in figure element', () => {
      // WeChat articles often wrap tables in <figure>
      const html = `
        <figure>
          <table>
            <thead>
              <tr>
                <th>指标</th>
                <th>2025</th>
                <th>2024</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>总损失</td>
                <td>$8385万</td>
                <td>$4.42亿</td>
              </tr>
            </tbody>
          </table>
        </figure>
      `
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('| 指标 |')
      expect(markdown).toContain('| 2025 |')
      expect(markdown).toContain('| 2024 |')
      expect(markdown).toContain('| --- |')
      expect(markdown).toContain('| 总损失 |')
    })

    it('should convert table wrapped in figure with figcaption', () => {
      const html = `
        <figure>
          <table>
            <thead>
              <tr><th>Name</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>A</td><td>1</td></tr>
            </tbody>
          </table>
          <figcaption>Table 1: Sample data</figcaption>
        </figure>
      `
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('| Name |')
      expect(markdown).toContain('| Value |')
      expect(markdown).toContain('| --- |')
      expect(markdown).toContain('*Table 1: Sample data*')
    })
  })

  describe('Code blocks', () => {
    it('should convert pre to fenced code block', () => {
      const html = '<pre>const x = 1;</pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```')
      expect(markdown).toContain('const x = 1;')
    })

    it('should detect language from language-xxx class', () => {
      const html = '<pre><code class="language-javascript">const x = 1;</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```javascript')
    })

    it('should detect language from lang-xxx class', () => {
      const html = '<pre><code class="lang-python">print("hello")</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```python')
    })

    it('should detect language from hljs class', () => {
      const html = '<pre><code class="hljs typescript">const x: number = 1;</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```typescript')
    })

    it('should detect language from data-lang attribute', () => {
      const html = '<pre data-lang="go"><code>func main() {}</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```go')
    })

    it('should detect language from pre class', () => {
      const html = '<pre class="language-typescript"><code>const x: number = 1;</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```typescript')
    })

    it('should not default unknown code blocks to bash', () => {
      const html = '<pre><code>const x = 1;</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('```\nconst x = 1;')
      expect(markdown).not.toContain('```bash')
    })

    it('should preserve multiline code', () => {
      const html = '<pre><code>line1\nline2\nline3</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('line1')
      expect(markdown).toContain('line2')
      expect(markdown).toContain('line3')
    })
  })

  describe('LaTeX formulas', () => {
    it('should convert block formula script tag', () => {
      const html = '<script type="math/tex; mode=display">E = mc^2</script>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('$$')
      expect(markdown).toContain('E = mc^2')
    })

    it('should convert inline formula script tag', () => {
      const html = '<script type="math/tex">x^2 + y^2 = z^2</script>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('$')
      expect(markdown).toContain('x^2 + y^2 = z^2')
    })
  })

  describe('Basic elements', () => {
    it('should convert headings', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('# Title')
      expect(markdown).toContain('## Subtitle')
      expect(markdown).toContain('### Section')
    })

    it('should convert bold and italic', () => {
      const html = '<p><strong>bold</strong> and <em>italic</em></p>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('**bold**')
      expect(markdown).toContain('*italic*')
    })

    it('should convert links', () => {
      const html = '<a href="https://example.com">Example</a>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('[Example](https://example.com)')
    })

    it('should convert images', () => {
      const html = '<img src="https://example.com/img.png" alt="Image">'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('![Image](https://example.com/img.png)')
    })

    it('should convert unordered lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const markdown = htmlToMarkdown(html)
      // turndown 使用标准格式：- 后可能有多个空格
      expect(markdown).toMatch(/-\s+Item 1/)
      expect(markdown).toMatch(/-\s+Item 2/)
    })

    it('should convert blockquotes', () => {
      const html = '<blockquote>Quote text</blockquote>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('> Quote text')
    })
  })

  describe('Real-world HTML from web pages', () => {
    it('should handle complex nested structure', () => {
      const html = `
        <div class="article">
          <h1>Article Title</h1>
          <p>This is a <strong>bold</strong> paragraph.</p>
          <ul>
            <li>First item</li>
            <li>Second item with <em>emphasis</em></li>
          </ul>
          <table>
            <thead>
              <tr><th>Name</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>A</td><td>1</td></tr>
            </tbody>
          </table>
        </div>
      `
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain('# Article Title')
      expect(markdown).toContain('**bold**')
      expect(markdown).toContain('- First item')
      expect(markdown).toContain('*emphasis*')
      expect(markdown).toContain('| Name |')
    })
  })
})
