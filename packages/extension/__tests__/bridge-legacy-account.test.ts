import { describe, expect, it } from 'vitest'

import { projectLegacyAccounts } from '../src/bridge/legacy-account'

describe('projectLegacyAccounts', () => {
  it('keeps stable identity and authenticated avatar out of the legacy channel', () => {
    const result = projectLegacyAccounts([
      {
        id: 'zhihu',
        name: 'Zhihu',
        isAuthenticated: true,
        username: 'Public display name',
        userId: 'stable-account-id',
        icon: 'https://static.example/platform-icon.png',
        avatar: 'https://private.example/authenticated-avatar.png',
        homepage: 'https://www.zhihu.com',
      },
    ])

    expect(result).toEqual([
      {
        type: 'zhihu',
        title: 'Public display name',
        displayName: 'Zhihu',
        icon: 'https://static.example/platform-icon.png',
        avatar: 'https://static.example/platform-icon.png',
        uid: 'Public display name',
        home: 'https://www.zhihu.com',
        supportTypes: ['html'],
      },
    ])
    expect(JSON.stringify(result)).not.toContain('stable-account-id')
    expect(JSON.stringify(result)).not.toContain('authenticated-avatar')
  })

  it('ignores logged-out and malformed candidates', () => {
    expect(
      projectLegacyAccounts([
        { id: 'zhihu', isAuthenticated: false },
        { isAuthenticated: true },
        null,
      ]),
    ).toEqual([])
  })
})
