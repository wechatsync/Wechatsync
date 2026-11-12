import { describe, it, expect } from 'vitest'
import { build, loadConfigFromFile } from 'vite'
import { resolve } from 'node:path'

/** Node 直接导入会选到非 browser 入口，必须检查浏览器构建产物。 */
describe('AliyunAdapter Service Worker compatibility', () => {
  it('浏览器产物在没有 document/window 的环境中可加载并同步 Markdown', async () => {
    const config = await loadConfigFromFile(
      { command: 'build', mode: 'production' },
      resolve(__dirname, '../vite.config.ts')
    )
    if (!config) throw new Error('Vite config not found')
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      resolve: config.config.resolve,
      // 使用扩展实际的依赖解析规则；这个测试入口不需要 CRX/UI 插件。
      plugins: config.config.plugins?.filter(
        (plugin) => plugin && 'name' in plugin && plugin.name === 'worker-markdown-entities'
      ),
      define: config.config.define,
      build: {
        write: false,
        minify: false,
        lib: {
          entry: resolve(__dirname, '../../core/src/adapters/platforms/aliyun.ts'),
          name: 'AliyunWorkerTest',
          formats: ['es'],
        },
      },
    })
    const output = Array.isArray(result) ? result[0] : result
    if (!('output' in output)) throw new Error('Unexpected build output')
    const chunk = output.output.find((item) => item.type === 'chunk')
    if (!chunk || chunk.type !== 'chunk') throw new Error('Worker bundle not found')
    expect(typeof document).toBe('undefined')
    expect(typeof window).toBe('undefined')
    // 使用原生 ESM 加载已构建的浏览器代码，避免 Vitest 再解析源码的 Node 入口。
    const bundleUrl = `data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`
    const { AliyunAdapter } = await import(/* @vite-ignore */ bundleUrl).catch((error) => {
      // 避免加载异常的堆栈展开整段 base64 构建产物。
      throw new Error(`浏览器构建产物加载失败：${error.message}`)
    })
    const adapter = new AliyunAdapter()
    const markdown =
      '# 标题 &amp; 公式\n\n<span>HTML &amp; 内容</span>\n\n$x^2$\n\n`![代码](https://example.invalid/image.png)`'
    let savedBody: Record<string, unknown> | undefined
    await adapter.init({
      type: 'extension',
      fetch: async (url: string, options?: RequestInit) => {
        if (url.endsWith('/getUser'))
          return Response.json({ success: true, data: { uccId: 'test-user' } })
        if (url.endsWith('/article/new'))
          return new Response("var GLOBAL_CONFIG = {'csrf_key':'p_csrf','csrf_val':'test-csrf'};")
        if (url.includes('/putDraft')) {
          savedBody = JSON.parse(options?.body as string)
          return Response.json({ success: true, data: { aid: 123 } })
        }
        throw new Error('Unexpected request')
      },
    })
    expect(await adapter.publish({ title: '测试', markdown })).toMatchObject({
      success: true,
      draftOnly: true,
    })
    expect(savedBody?.content).toBe(markdown)
  }, 20000)
})
