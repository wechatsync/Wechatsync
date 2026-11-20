import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const requireCore = createRequire(resolve(__dirname, '../../core/package.json'))
const workerEntry = resolve(requireCore.resolve('linkedom/package.json'), '../worker.js')
const { parseHTML } = await import(pathToFileURL(workerEntry).href)
const readerSource = readFileSync(resolve(__dirname, '../public/lib/Readability.js'), 'utf8')
const Readability = runInNewContext(`${readerSource}\nReadability`)

describe('Readability 正文标题清理', () => {
  it.each(['', '<header><h1>文章标题</h1></header>'])(
    '保留正文一级小节和顺序（文章标题元素 %j）',
    (articleTitleHeading) => {
      const { document } = parseHTML(`<html><body><article>
        ${articleTitleHeading}
        <h1>第一节 <strong>概览</strong></h1><p>第一节正文。</p>
        <h2>子章节</h2><p>子章节正文。</p>
        <h1>文章标题</h1><p>与文章同名的小节。</p>
        <h1>最后一节</h1><p>最后一节正文。</p>
      </article></body></html>`)
      const article = document.querySelector('article')!
      const reader = new Readability(document)
      reader._articleTitle = '文章标题'

      reader._prepArticle(article)

      expect(
        Array.from(article.querySelectorAll('h1, h2'), (heading) => heading.outerHTML)
      ).toEqual([
        '<h1>第一节 <strong>概览</strong></h1>',
        '<h2>子章节</h2>',
        '<h1>文章标题</h1>',
        '<h1>最后一节</h1>',
      ])
    }
  )
})
