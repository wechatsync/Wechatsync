import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { chromeMock, mockStorage } from '../vitest.setup'

vi.mock('../src/adapters', () => ({
  checkAllPlatformsAuth: vi.fn(),
  checkPlatformAuth: vi.fn(),
  getAdapter: vi.fn(),
}))

vi.mock('../src/background/sync-service', () => ({
  performSync: vi.fn(),
}))

import { McpClient } from '../src/mcp/client'

class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  static instances: MockWebSocket[] = []

  readyState = MockWebSocket.CONNECTING
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: ((event: { code: number; reason: string }) => void) | null = null
  onerror: (() => void) | null = null
  sent: string[] = []

  constructor(readonly url: string) {
    MockWebSocket.instances.push(this)
  }

  open(): void {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  fail(code = 1006, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED
    this.onerror?.()
    this.onclose?.({ code, reason })
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({ code: 1000, reason: '' })
  }
}

async function flushPromises(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('McpClient connection lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []
    mockStorage.mcpEnabled = true
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not replace an in-progress connection', () => {
    const client = new McpClient()

    client.connect()
    client.connect()

    expect(MockWebSocket.instances).toHaveLength(1)
    expect(client.getStatus().connecting).toBe(true)
  })

  it('retries quickly before switching to the cold backoff', async () => {
    const client = new McpClient()
    const delays = [500, 1000, 2000, 4000, 5000, 10000]

    client.setServerUrl('ws://192.0.2.1:9527')
    client.connect()

    for (const delay of delays) {
      MockWebSocket.instances.at(-1)!.fail()
      await flushPromises()

      const countBeforeRetry = MockWebSocket.instances.length
      await vi.advanceTimersByTimeAsync(delay - 1)
      expect(MockWebSocket.instances).toHaveLength(countBeforeRetry)

      await vi.advanceTimersByTimeAsync(1)
      expect(MockWebSocket.instances).toHaveLength(countBeforeRetry + 1)
    }

    client.disconnect()
  })

  it('keeps localhost retries within five seconds', async () => {
    const client = new McpClient()
    const delays = [500, 1000, 2000, 4000, 5000, 5000]

    client.connect()

    for (const delay of delays) {
      MockWebSocket.instances.at(-1)!.fail()
      await flushPromises()
      await vi.advanceTimersByTimeAsync(delay)
    }

    expect(MockWebSocket.instances).toHaveLength(delays.length + 1)
    client.disconnect()
  })

  it('keeps the service worker active while waiting for the local CLI', async () => {
    const client = new McpClient()

    client.connect()

    await vi.advanceTimersByTimeAsync(20001)

    expect(globalThis.chrome.runtime.getPlatformInfo).toHaveBeenCalledTimes(1)

    client.disconnect()
  })

  it('immediately reconnects when reset while a retry is pending', async () => {
    const client = new McpClient()

    client.connect()
    MockWebSocket.instances[0].fail()
    await flushPromises()

    client.resetReconnect()

    expect(MockWebSocket.instances).toHaveLength(2)
    client.disconnect()
  })

  it('checks the enabled flag before scheduling a retry', async () => {
    const client = new McpClient()
    mockStorage.mcpEnabled = false

    client.connect()
    MockWebSocket.instances[0].fail()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(10000)

    expect(chromeMock.storage.local.get).toHaveBeenCalledWith('mcpEnabled')
    expect(MockWebSocket.instances).toHaveLength(1)
    client.disconnect()
  })
})
