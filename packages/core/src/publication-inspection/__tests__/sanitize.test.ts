import { describe, expect, it } from 'vitest'

import { sanitizeBoundaryUrl, sanitizeSyncResultForBoundary } from '../sanitize'

describe('sanitizeBoundaryUrl', () => {
  it('never exposes a WeChat URL', () => {
    expect(
      sanitizeBoundaryUrl(
        'weixin',
        'https://mp.weixin.qq.com/cgi-bin/appmsg?appmsgid=9001&token=secret',
      ),
    ).toBeUndefined()
    expect(
      sanitizeBoundaryUrl(
        ' WEIXIN ',
        'https://mp.weixin.qq.com/s?__biz=public&mid=9001',
      ),
    ).toBeUndefined()
  })

  it('removes sensitive query parameters and the complete fragment', () => {
    expect(
      sanitizeBoundaryUrl(
        'zhihu',
        'https://example.com/draft/42?mid=42&TOKEN=one&access_token=two' +
          '&ticket=three&session_id=four&authKey=five' +
          '&X-Amz-Signature=six&clientSecret=seven&safe=ok#token=fragment',
      ),
    ).toBe('https://example.com/draft/42?mid=42&safe=ok')
  })

  it('recognizes encoded, camelCase, and compact sensitive keys', () => {
    expect(
      sanitizeBoundaryUrl(
        'sohu',
        'https://example.com/article?access%5Ftoken=one&refreshToken=two' +
          '&sessionid=three&apiKey=four&article_id=42',
      ),
    ).toBe('https://example.com/article?article_id=42')
  })

  it.each([
    'javascript:alert(1)',
    'data:text/plain,secret',
    'https://user@example.com/article',
    'https://user:password@example.com/article',
    '/relative/article',
  ])('rejects a non-http, credentialed, or relative URL: %s', (value) => {
    expect(sanitizeBoundaryUrl('zhihu', value)).toBeUndefined()
  })

  it('allows both HTTP and HTTPS URLs with non-sensitive query parameters', () => {
    expect(
      sanitizeBoundaryUrl(
        'sohu',
        'http://mp.sohu.com/editor?id=42&accountId=7#draft',
      ),
    ).toBe('http://mp.sohu.com/editor?id=42&accountId=7')
    expect(
      sanitizeBoundaryUrl('zhihu', 'https://zhuanlan.zhihu.com/p/42/edit'),
    ).toBe('https://zhuanlan.zhihu.com/p/42/edit')
  })
})

describe('sanitizeSyncResultForBoundary', () => {
  it('preserves postId while removing both WeChat URL aliases', () => {
    const input = {
      platform: 'weixin',
      success: true,
      postId: '900000001',
      postUrl:
        'https://mp.weixin.qq.com/cgi-bin/appmsg?appmsgid=900000001&token=secret',
      url: 'https://mp.weixin.qq.com/s?__biz=public&mid=900000001',
      draftOnly: true,
      timestamp: 1,
    }

    expect(sanitizeSyncResultForBoundary(input)).toEqual({
      platform: 'weixin',
      success: true,
      postId: '900000001',
      draftOnly: true,
      timestamp: 1,
    })
    expect(input.postUrl).toContain('token=secret')
    expect(input.postId).toBe('900000001')
  })

  it('sanitizes both URL aliases without dropping other result fields', () => {
    expect(
      sanitizeSyncResultForBoundary({
        platform: 'zhihu',
        success: true,
        postId: '42',
        postUrl:
          'https://zhuanlan.zhihu.com/p/42/edit?token=secret&source=sync#draft',
        url: 'https://zhuanlan.zhihu.com/p/42?signature=secret&from=sync',
        message: 'saved',
      }),
    ).toEqual({
      platform: 'zhihu',
      success: true,
      postId: '42',
      postUrl: 'https://zhuanlan.zhihu.com/p/42/edit?source=sync',
      url: 'https://zhuanlan.zhihu.com/p/42?from=sync',
      message: 'saved',
    })
  })

  it('removes invalid and non-string URL fields', () => {
    expect(
      sanitizeSyncResultForBoundary({
        platform: 'sohu',
        success: false,
        postId: 'draft-1',
        postUrl: 'https://user@example.com/draft/1',
        url: { href: 'https://example.com' },
        error: 'failed',
      }),
    ).toEqual({
      platform: 'sohu',
      success: false,
      postId: 'draft-1',
      error: 'failed',
    })
  })
})
