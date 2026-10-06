import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/adapters', () => ({
  getAllPlatformMetas: () => [{ id: 'weixin', name: '微信' }],
  getPlatformPreprocessConfigs: () => ({ weixin: {} }),
  syncToMultiplePlatforms: vi.fn(async (_platforms, _article, callbacks) => {
    callbacks.onResult({ platform: 'weixin', success: true })
  }),

}))
vi.mock('../src/adapters/cms/wordpress', () => ({}))
vi.mock('../src/adapters/cms/metaweblog', () => ({}))

import { performSync } from '../src/background/sync-service'
import { syncToMultiplePlatforms } from '../src/adapters'

const contents = { weixin: { html: '<p>processed</p>', markdown: 'processed' } }
const neverReplies = () => new Promise(() => {})
const browser = {
  runtime: { getURL: (path: string) => 'chrome-extension://test/' + path },
  storage: { local: { get: vi.fn(async () => ({})), set: vi.fn(async () => {}) } },
  action: { setBadgeText: vi.fn(async () => {}), setBadgeBackgroundColor: vi.fn(async () => {}) },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    onUpdated: {
      addListener: vi.fn((listener) => queueMicrotask(() => listener(50, { status: 'complete' }))),
      removeListener: vi.fn(),
    },
  },
  windows: { create: vi.fn(async () => ({ id: 10, tabs: [{ id: 50 }] })), remove: vi.fn(async () => {}) },
}

describe('CLI/MCP DOM preprocessing', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('chrome', browser)
    browser.tabs.query.mockImplementation(async (options) => options.active
      ? [{ id: 1, url: 'https://example.com' }]
      : Array.from({ length: 8 }, (_, index) => ({ id: index + 1 })))
    browser.tabs.sendMessage.mockReset()
    browser.windows.create.mockClear()
    browser.windows.remove.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('continues to another tab when the active tab keeps the message channel open', async () => {
    browser.tabs.sendMessage.mockImplementation((id) => id === 1
      ? neverReplies() : Promise.resolve({ platformContents: contents }))
    const sync = performSync({ title: 'Test', html: '<p>raw</p>' }, ['weixin'], { skipHistory: true })
    await vi.advanceTimersByTimeAsync(3000)
    await sync
    expect(browser.tabs.sendMessage.mock.calls.map(call => call[0])).toEqual([1, 2])
    expect(browser.windows.create).not.toHaveBeenCalled()
    expect(syncToMultiplePlatforms).toHaveBeenCalledWith(
      ['weixin'], expect.objectContaining({ platformContents: contents }), expect.anything(), 'mcp')
  })

  it('bounds candidate attempts and uses the temporary preprocessing window', async () => {
    browser.tabs.sendMessage.mockImplementation((id) => id === 50
      ? Promise.resolve({ platformContents: contents }) : neverReplies())
    const sync = performSync({ title: 'Test', html: '<p>raw</p>' }, ['weixin'], { skipHistory: true })
    await vi.advanceTimersByTimeAsync(12000)
    await sync
    expect(browser.tabs.sendMessage.mock.calls.map(call => call[0])).toEqual([1, 2, 3, 4, 50])
    expect(browser.windows.remove).toHaveBeenCalledWith(10)
  })

  it('closes the temporary window and finishes even when its message also stalls', async () => {
    browser.tabs.query.mockResolvedValue([])
    browser.tabs.sendMessage.mockImplementation(neverReplies)
    const sync = performSync({ title: 'Test', html: '<p>raw</p>' }, ['weixin'], { skipHistory: true })
    await vi.advanceTimersByTimeAsync(3000)
    await sync
    expect(browser.windows.remove).toHaveBeenCalledWith(10)
    expect(syncToMultiplePlatforms).toHaveBeenCalledWith(
      ['weixin'], expect.objectContaining({ html: '<p>raw</p>' }), expect.anything(), 'mcp')
  })
})
