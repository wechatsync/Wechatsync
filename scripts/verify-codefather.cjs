/* 真实公开编辑器的匿名缓存恢复烟测；不测试登录，不允许任何网络写入。 */
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { CodefatherAdapter } = require('../packages/core/dist/index.js')

async function main() {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('请设置独立安装的 PLAYWRIGHT_MODULE 路径')
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE)
  const output = path.resolve('codefather-smoke-output')
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  let page
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' })
    // 在创建页面前保护整个 context，覆盖弹窗；阻止 service worker 绕过拦截。
    // 只允许 GET/HEAD，真实上传、发文等网络写入一律中止。
    await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort())
    page = await context.newPage()
    const runtime = {
      type: 'extension',
      // 显式测试夹具：仅让适配器进入缓存流程，不伪装为真实登录验证。
      fetch: async url => {
        assert.equal(url, 'https://api.codefather.cn/api/user/get/login')
        return Response.json({ code: 0, data: { id: 'anonymous-cache-test-fixture' } })
      },
      tabs: {
        query: async () => [],
        create: async url => { await page.goto(url, { waitUntil: 'domcontentloaded' }); return { id: 1 } },
        waitForLoad: async () => { await page.waitForLoadState('domcontentloaded') },
        executeScript: async (_id, fn, args) => {
          assert.equal(args.length, 1)
          return page.evaluate(fn, args[0])
        },
      },
    }
    const adapter = new CodefatherAdapter()
    await adapter.init(runtime)
    const article = { title: 'Wechatsync 本地草稿恢复验证', markdown: '# 仅供本地验证\n\nwechatsync-cache-smoke-marker' }
    const result = await adapter.publish(article)
    assert.equal(result.success, true, result.error)
    assert.equal(result.draftOnly, true)
    await page.waitForURL('https://www.codefather.cn/add/passage', { timeout: 60000 })
    const title = page.locator('input.add-passage-title-input')
    await title.waitFor({ state: 'attached', timeout: 60000 })
    // React 在挂载后从站点缓存恢复，等待实际 input 值，不只检查 localStorage。
    await page.waitForFunction(expected => document.querySelector('input.add-passage-title-input')?.value === expected, article.title, { timeout: 30000 })
    assert.equal(await title.inputValue(), article.title)
    const cache = await page.evaluate(() => JSON.parse(localStorage.getItem('add_post')))
    assert.equal(cache.value.content, article.markdown)
    await fs.writeFile(path.join(output, 'result.json'), JSON.stringify({
      url: page.url(), titleRestored: true, cachedMarkdownVerified: true,
      realAccountAuthTested: false, serverWritesAllowed: false,
    }, null, 2))
    await page.screenshot({ path: path.join(output, 'editor.png'), fullPage: true })
    console.log('PASS: 真实公开编辑器恢复本地草稿标题，Markdown 缓存完整；未验证真实登录，禁止网络写入。')
  } finally {
    if (page) {
      await fs.writeFile(path.join(output, 'page.html'), await page.content()).catch(() => {})
      await page.screenshot({ path: path.join(output, 'last-page.png') }).catch(() => {})
    }
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
