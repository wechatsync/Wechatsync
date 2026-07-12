import assert from 'node:assert/strict'
import { test } from 'node:test'
import { WebSocket } from 'ws'
import { ExtensionBridge } from '../dist/exports.js'

const TEST_PORT = 19527

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.once('open', resolve)
    ws.once('error', reject)
  })
}

test('status exposes primary diagnostics', async () => {
  const bridge = new ExtensionBridge(TEST_PORT, { silent: true })
  await bridge.start()

  try {
    const response = await fetch(`http://localhost:${TEST_PORT + 1}/status`)
    const status = await response.json()

    assert.equal(status.mode, 'primary')
    assert.equal(status.connected, false)
    assert.equal(status.pid, process.pid)
    assert.equal(typeof status.startedAt, 'number')
    assert.equal(typeof status.uptimeMs, 'number')
  } finally {
    bridge.stop()
  }
})

test('image upload requests use the bounded upload timeout', async () => {
  process.env.WECHATSYNC_UPLOAD_TIMEOUT = '50'
  const bridge = new ExtensionBridge(TEST_PORT + 2, { silent: true })
  await bridge.start()
  const ws = new WebSocket(`ws://localhost:${TEST_PORT + 2}`)
  await waitForOpen(ws)

  try {
    await assert.rejects(
      bridge.request('uploadImage', { imageData: 'AA==', mimeType: 'image/png' }),
      /Request timeout: uploadImage/
    )
  } finally {
    bridge.stop()
    delete process.env.WECHATSYNC_UPLOAD_TIMEOUT
  }
})

test('stopping the bridge rejects pending requests', async () => {
  const bridge = new ExtensionBridge(TEST_PORT + 4, { silent: true })
  await bridge.start()
  const ws = new WebSocket(`ws://localhost:${TEST_PORT + 4}`)
  await waitForOpen(ws)

  const pending = bridge.request('syncArticle', { article: { title: 'test' } })
  bridge.stop()

  await assert.rejects(pending, /Bridge stopped before the request completed/)
})
