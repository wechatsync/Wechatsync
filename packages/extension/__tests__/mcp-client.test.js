import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chromeMock, mockStorage } from '../vitest.setup';
vi.mock('../src/adapters', () => ({
    checkAllPlatformsAuth: vi.fn(),
    checkPlatformAuth: vi.fn(),
    getAdapter: vi.fn(),
}));
vi.mock('../src/background/sync-service', () => ({
    performSync: vi.fn(),
}));
import { McpClient } from '../src/mcp/client';
class MockWebSocket {
    url;
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    static instances = [];
    readyState = MockWebSocket.CONNECTING;
    onopen = null;
    onmessage = null;
    onclose = null;
    onerror = null;
    sent = [];
    constructor(url) {
        this.url = url;
        MockWebSocket.instances.push(this);
    }
    open() {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.();
    }
    fail(code = 1006, reason = '') {
        this.readyState = MockWebSocket.CLOSED;
        this.onerror?.();
        this.onclose?.({ code, reason });
    }
    send(data) {
        this.sent.push(data);
    }
    close() {
        this.readyState = MockWebSocket.CLOSED;
        this.onclose?.({ code: 1000, reason: '' });
    }
}
async function flushPromises() {
    await Promise.resolve();
    await Promise.resolve();
}
describe('McpClient connection lifecycle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        MockWebSocket.instances = [];
        mockStorage.mcpEnabled = true;
        vi.stubGlobal('WebSocket', MockWebSocket);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });
    it('does not replace an in-progress connection', () => {
        const client = new McpClient();
        client.connect();
        client.connect();
        expect(MockWebSocket.instances).toHaveLength(1);
        expect(client.getStatus().connecting).toBe(true);
    });
    it('retries quickly before switching to the cold backoff', async () => {
        const client = new McpClient();
        const delays = [500, 1000, 2000, 4000, 5000, 10000];
        client.connect();
        for (const delay of delays) {
            MockWebSocket.instances.at(-1).fail();
            await flushPromises();
            const countBeforeRetry = MockWebSocket.instances.length;
            await vi.advanceTimersByTimeAsync(delay - 1);
            expect(MockWebSocket.instances).toHaveLength(countBeforeRetry);
            await vi.advanceTimersByTimeAsync(1);
            expect(MockWebSocket.instances).toHaveLength(countBeforeRetry + 1);
        }
        client.disconnect();
    });
    it('sends a keepalive every 20 seconds after connecting', async () => {
        const client = new McpClient();
        client.connect();
        const socket = MockWebSocket.instances[0];
        socket.open();
        await vi.advanceTimersByTimeAsync(20000);
        expect(socket.sent).toHaveLength(1);
        expect(JSON.parse(socket.sent[0])).toMatchObject({ type: 'keepalive' });
        client.disconnect();
    });
    it('immediately reconnects when reset while a retry is pending', async () => {
        const client = new McpClient();
        client.connect();
        MockWebSocket.instances[0].fail();
        await flushPromises();
        client.resetReconnect();
        expect(MockWebSocket.instances).toHaveLength(2);
        expect(vi.getTimerCount()).toBe(0);
        client.disconnect();
    });
    it('checks the enabled flag before scheduling a retry', async () => {
        const client = new McpClient();
        mockStorage.mcpEnabled = false;
        client.connect();
        MockWebSocket.instances[0].fail();
        await flushPromises();
        expect(chromeMock.storage.local.get).toHaveBeenCalledWith('mcpEnabled');
        expect(vi.getTimerCount()).toBe(0);
    });
});
//# sourceMappingURL=mcp-client.test.js.map