import { afterEach, describe, expect, it, vi } from 'vitest'

import { ExtensionRuntime } from '../src/runtime/extension'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ExtensionRuntime.fetch credentials', () => {
  it('preserves an explicit anonymous request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await new ExtensionRuntime().fetch('https://example.com/public', {
      credentials: 'omit',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/public',
      expect.objectContaining({ credentials: 'omit' }),
    )
  })

  it('defaults to authenticated requests when credentials are absent', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await new ExtensionRuntime().fetch('https://example.com/account')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/account',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('keeps an explicit authenticated draft request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await new ExtensionRuntime().fetch('https://example.com/draft', {
      credentials: 'include',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/draft',
      expect.objectContaining({ credentials: 'include' }),
    )
  })
})
