import { describe, expect, it } from 'vitest'
import samples from '../__fixtures__/url-samples.json'
import type { PublicationPlatform } from '../types'
import { parsePublicationUrl } from '../url'

describe('parsePublicationUrl', () => {
  for (const sample of samples) {
    it(sample.name, () => {
      const parsed = parsePublicationUrl(
        sample.platform as PublicationPlatform,
        sample.href,
      )

      expect(parsed).toMatchObject({
        platform: sample.platform,
        ...sample.expected,
      })
    })
  }

  it('rejects a valid-looking identity hosted on the wrong domain', () => {
    expect(
      parsePublicationUrl(
        'zhihu',
        'https://attacker.example/p/2000000000000000001',
      ),
    ).toBeNull()
  })

  it('rejects non-http protocols and URL userinfo', () => {
    expect(parsePublicationUrl('zhihu', 'javascript:alert(1)')).toBeNull()
    expect(
      parsePublicationUrl(
        'zhihu',
        'https://user:password@zhuanlan.zhihu.com/p/2000000000000000001',
      ),
    ).toBeNull()
  })

  it('does not infer identities for paused platforms', () => {
    expect(
      parsePublicationUrl(
        'sohu',
        'https://www.sohu.com/a/1000000001_120000001',
      ),
    ).toBeNull()
  })

  it('does not guess unknown Zhihu URL shapes', () => {
    expect(
      parsePublicationUrl('zhihu', 'https://www.zhihu.com/question/123'),
    ).toEqual({ platform: 'zhihu', surface: 'UNKNOWN' })
  })
})
