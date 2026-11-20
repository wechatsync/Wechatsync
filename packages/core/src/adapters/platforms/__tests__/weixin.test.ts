import { describe, expect, it } from 'vitest'
import type { RuntimeInterface } from '../../../runtime/interface'
import { WeixinAdapter } from '../weixin'

describe('WeixinAdapter', () => {
  it.each([{ ret: 200004 }, { base_resp: { ret: 200004 } }])(
    '微信拒绝草稿保存请求的来源时，说明原因并保留错误码（%j）',
    async (saveResponse) => {
      const adapter = new WeixinAdapter()
      await adapter.init({
        type: 'extension',
        async fetch(url, options) {
          const path = new URL(url).pathname
          if (path === '/' && options?.method === 'GET') {
            return new Response(`data: { t: 'test-token' }`)
          }
          if (path === '/cgi-bin/operate_appmsg' && options?.method === 'POST') {
            return Response.json(saveResponse)
          }
          throw new Error(`Unexpected test request: ${path}`)
        },
      } as RuntimeInterface)

      const result = await adapter.publish({ title: '测试草稿', html: '<p>正文</p>' })

      expect(result).toMatchObject({
        success: false,
        error: '微信拒绝了请求来源（错误码 200004），请在公众号后台手动保存草稿',
      })
    }
  )
})
