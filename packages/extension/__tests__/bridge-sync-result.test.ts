import { describe, expect, it } from 'vitest'

import { toLegacyEditResponse } from '../src/bridge/sync-result'

describe('toLegacyEditResponse', () => {
  it('keeps the WeChat post ID without exposing its token URL', () => {
    const result = toLegacyEditResponse({
      platform: 'weixin',
      success: true,
      postId: '9001',
      postUrl:
        'https://mp.weixin.qq.com/cgi-bin/appmsg?appmsgid=9001&token=secret',
    })

    expect(result).toEqual({ postId: '9001' })
    expect(JSON.stringify(result)).not.toContain('secret')
  })

  it('sanitizes another platform URL and preserves its post ID', () => {
    expect(
      toLegacyEditResponse({
        platform: 'zhihu',
        success: true,
        postId: '42',
        postUrl:
          'https://zhuanlan.zhihu.com/p/42/edit?token=secret&source=sync#draft',
      }),
    ).toEqual({
      draftLink: 'https://zhuanlan.zhihu.com/p/42/edit?source=sync',
      postId: '42',
    })
  })

  it('returns null for failures and rejects malformed post IDs', () => {
    expect(toLegacyEditResponse({ success: false, postId: '42' })).toBeNull()
    expect(
      toLegacyEditResponse({
        platform: 'sohu',
        success: true,
        postId: 'x'.repeat(501),
      }),
    ).toEqual({})
  })
})
