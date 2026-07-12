/**
 * WebSocket Bridge - 与 Chrome Extension 通讯
 *
 * 支持多实例模式：
 * - 第一个实例启动 WebSocket 服务器 + HTTP API
 * - 后续实例通过 HTTP API 转发请求
 */
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import type { RequestMessage, ResponseMessage } from './types.js'

// WebSocket 状态常量 (readyState: 1 = OPEN)
const WS_OPEN = WebSocket.OPEN

interface PrimaryStatus {
  connected: boolean
  pid?: number
  startedAt?: number
  uptimeMs?: number
  error?: string
}

export class ExtensionBridge {
  private wss: any = null
  private httpServer: http.Server | null = null
  private client: any = null
  private isServerMode = false
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>()
  private requestTimeout = 360000 // 6 minutes (图片多时需要更长时间)
  private uploadRequestTimeout = this.readPositiveTimeout(
    process.env.WECHATSYNC_UPLOAD_TIMEOUT,
    60000
  )
  private connectionResolvers: Array<() => void> = []
  private readonly startedAt = Date.now()
  private primaryStatus: PrimaryStatus | null = null

  // 安全验证 token（从环境变量读取，优先使用 WECHATSYNC_TOKEN）
  private token: string = process.env.WECHATSYNC_TOKEN || process.env.MCP_TOKEN || ''

  // 是否静默模式（CLI 使用时不输出日志）
  private silent: boolean = false

  constructor(private port: number = 9527, options?: { silent?: boolean }) {
    this.silent = options?.silent ?? false
    if (!this.silent) {
      if (this.token) {
        console.error('[Bridge] Token authentication enabled')
      } else {
        console.error('[Bridge] Warning: MCP_TOKEN not set, requests may be rejected by extension')
      }
    }
  }

  /**
   * 启动服务 - 自动选择服务器模式或客户端模式
   */
  async start(): Promise<void> {
    try {
      await this.startServer()
      this.isServerMode = true
      if (!this.silent) console.error(`[Bridge] Running as PRIMARY (WebSocket: ${this.port}, HTTP: ${this.port + 1})`)
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        this.isServerMode = false
        if (!this.silent) console.error(`[Bridge] Running as SECONDARY (forwarding to localhost:${this.port + 1})`)
      } else {
        throw error
      }
    }
  }

  /**
   * 启动 WebSocket 服务器 + HTTP API
   */
  private startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port })

        this.wss.on('listening', () => {
          if (!this.silent) console.error(`[Bridge] WebSocket server listening on port ${this.port}`)
          // WebSocket 启动成功后，启动 HTTP API
          this.startHttpApi()
            .then(resolve)
            .catch(reject)
        })

        this.wss.on('connection', (ws: any) => {
          if (!this.silent) console.error('[Bridge] Extension connected')
          this.client = ws

          // 通知等待连接的 Promise
          for (const resolver of this.connectionResolvers) {
            resolver()
          }
          this.connectionResolvers = []

          ws.on('message', (data: any) => {
            this.handleMessage(data.toString())
          })

          ws.on('close', () => {
            if (!this.silent) console.error('[Bridge] Extension disconnected')
            this.client = null
          })

          ws.on('error', (error: Error) => {
            if (!this.silent) console.error('[Bridge] WebSocket error:', error)
          })
        })

        this.wss.on('error', (error: Error) => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 启动 HTTP API 服务器（供其他 MCP 实例调用）
   */
  private startHttpApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer(async (req, res) => {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.writeHead(200)
          res.end()
          return
        }

        if (req.method === 'GET' && req.url === '/status') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            connected: this.isConnected(),
            mode: 'primary',
            pid: process.pid,
            startedAt: this.startedAt,
            uptimeMs: Date.now() - this.startedAt,
          }))
          return
        }

        if (req.method === 'POST' && req.url === '/request') {
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', async () => {
            try {
              const { method, params } = JSON.parse(body)
              const result = await this.requestInternal(method, params)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ result }))
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: (error as Error).message }))
            }
          })
          return
        }

        res.writeHead(404)
        res.end('Not found')
      })

      const httpPort = this.port + 1
      this.httpServer.listen(httpPort, () => {
        if (!this.silent) console.error(`[Bridge] HTTP API listening on port ${httpPort}`)
        resolve()
      })

      this.httpServer.on('error', reject)
    })
  }

  /**
   * 停止服务器
   */
  stop(): void {
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('Bridge stopped before the request completed'))
    }
    this.pendingRequests.clear()

    if (this.client) {
      this.client.close()
      this.client = null
    }
    if (this.wss) {
      this.wss.close()
      this.wss = null
    }
    if (this.httpServer) {
      this.httpServer.close()
      this.httpServer = null
    }
  }

  /**
   * 检查 Extension 是否已连接
   */
  /**
   * 获取当前运行模式
   */
  getMode(): 'primary' | 'secondary' {
    return this.isServerMode ? 'primary' : 'secondary'
  }

  getPrimaryStatus(): PrimaryStatus | null {
    return this.primaryStatus
  }

  /**
   * 检查 Extension 是否已连接
   */
  isConnected(): boolean {
    if (this.isServerMode) {
      return this.client !== null && this.client.readyState === WS_OPEN
    } else {
      // SECONDARY 模式：无法同步检查，需要用 checkPrimaryHealth 异步验证
      return false
    }
  }

  /**
   * 等待 Extension 连接
   */
  waitForConnection(timeoutMs: number = 60000): Promise<void> {
    if (this.isServerMode) {
      // PRIMARY 模式：等待扩展 WebSocket 连接
      if (this.client !== null && this.client.readyState === WS_OPEN) {
        return Promise.resolve()
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const index = this.connectionResolvers.indexOf(resolve)
          if (index > -1) {
            this.connectionResolvers.splice(index, 1)
          }
          reject(new Error('timeout'))
        }, timeoutMs)

        this.connectionResolvers.push(() => {
          clearTimeout(timeout)
          resolve()
        })
      })
    } else {
      // SECONDARY 模式：轮询 PRIMARY 健康状态，PRIMARY 消失则尝试接管
      return new Promise((resolve, reject) => {
        const startTime = Date.now()
        const pollInterval = 2000
        let primaryReachable = false
        let promoting = false

        const poll = async () => {
          if (Date.now() - startTime > timeoutMs) {
            if (!primaryReachable) {
              reject(new Error('timeout:unreachable'))
            } else {
              reject(new Error('timeout:no_extension'))
            }
            return
          }

          const health = await this.checkPrimaryHealth()
          this.primaryStatus = health
          if (health.connected) {
            resolve()
            return
          }

          if (health.error?.includes('not reachable') && !promoting) {
            // PRIMARY 不可达 — 尝试接管端口
            promoting = true
            const promoted = await this.tryPromote()
            if (promoted) {
              // 成功接管，等待 Extension 直连
              const remaining = timeoutMs - (Date.now() - startTime)
              if (remaining <= 0) {
                reject(new Error('timeout:no_extension'))
                return
              }

              if (this.client && this.client.readyState === WS_OPEN) {
                resolve()
                return
              }

              const promoteTimeout = setTimeout(() => {
                const index = this.connectionResolvers.indexOf(resolve)
                if (index > -1) this.connectionResolvers.splice(index, 1)
                reject(new Error('timeout:no_extension'))
              }, remaining)

              this.connectionResolvers.push(() => {
                clearTimeout(promoteTimeout)
                resolve()
              })
              return
            }
            // 接管失败，继续轮询
            promoting = false
          } else if (!health.error?.includes('not reachable')) {
            primaryReachable = true
          }

          setTimeout(poll, pollInterval)
        }

        poll()
      })
    }
  }

  /**
   * 检查 Primary 实例健康状态（Secondary 模式用）
   */
  private async checkPrimaryHealth(): Promise<PrimaryStatus> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: this.port + 1,
        path: '/status',
        method: 'GET',
        timeout: 3000,
      }

      const req = http.request(options, (res) => {
        let body = ''
        res.on('data', chunk => body += chunk)
        res.on('end', () => {
          try {
            const status = JSON.parse(body)
            resolve({
              connected: status.connected,
              pid: status.pid,
              startedAt: status.startedAt,
              uptimeMs: status.uptimeMs,
            })
          } catch {
            resolve({ connected: false, error: 'Invalid response from primary' })
          }
        })
      })

      req.on('error', (error) => {
        resolve({ connected: false, error: `Primary not reachable: ${error.message}` })
      })

      req.on('timeout', () => {
        req.destroy()
        resolve({ connected: false, error: 'Primary health check timeout' })
      })

      req.end()
    })
  }

  /**
   * 发送请求到 Extension 并等待响应
   */
  async request<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (this.isServerMode) {
      return this.requestInternal<T>(method, params)
    } else {
      return this.requestViaSecondary<T>(method, params)
    }
  }

  /**
   * SECONDARY 模式请求（带重试 + 自动接管）
   */
  private async requestViaSecondary<T = unknown>(
    method: string,
    params?: Record<string, unknown>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // 如果已经升级为 PRIMARY，直接走 internal
      if (this.isServerMode) {
        return this.requestInternal<T>(method, params)
      }

      // 重试前等待（首次不等）
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        if (!this.silent) console.error(`[Bridge] SECONDARY retry ${attempt}/${maxRetries} in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // 检查 PRIMARY 健康状态
      const health = await this.checkPrimaryHealth()
      this.primaryStatus = health
      if (!health.connected) {
        if (health.error?.includes('not reachable')) {
          // PRIMARY 已退出，尝试接管
          if (!this.silent) console.error('[Bridge] PRIMARY gone during request, attempting takeover...')
          const promoted = await this.tryPromote()
          if (promoted) {
            // 等 Extension 重新连接（温热重连应该很快）
            if (!this.client || this.client.readyState !== WS_OPEN) {
              if (!this.silent) console.error('[Bridge] Waiting for Extension to reconnect...')
              await this.waitForConnection(30000)
            }
            return this.requestInternal<T>(method, params)
          }
        }
        lastError = new Error(health.error || 'Primary instance not available.')
        continue
      }

      // 转发请求
      try {
        return await this.requestViaHttp<T>(method, params)
      } catch (error) {
        lastError = error as Error
      }
    }

    throw lastError!
  }

  /**
   * 尝试接管端口，升级为 PRIMARY
   */
  private async tryPromote(): Promise<boolean> {
    for (let i = 0; i < 5; i++) {
      try {
        await this.startServer()
        this.isServerMode = true
        if (!this.silent) console.error(`[Bridge] Promoted to PRIMARY (WebSocket: ${this.port}, HTTP: ${this.port + 1})`)
        return true
      } catch {
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    return false
  }

  /**
   * 直接通过 WebSocket 发送请求（服务器模式）
   */
  private async requestInternal<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.client || this.client.readyState !== WS_OPEN) {
      throw new Error('Extension not connected. Please ensure the Chrome extension is running.')
    }

    const id = this.generateId()
    const message: RequestMessage = {
      id,
      method,
      token: this.token,  // 发送 token 供插件端验证
      params
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Request timeout: ${method}`))
      }, this.getRequestTimeout(method))

      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject, timeout })

      this.client!.send(JSON.stringify(message))
    })
  }

  /**
   * 通过 HTTP API 转发请求（客户端模式）
   */
  private requestViaHttp<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ method, params })
      const options = {
        hostname: 'localhost',
        port: this.port + 1,
        path: '/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }

      const req = http.request(options, (res) => {
        let body = ''
        res.on('data', chunk => body += chunk)
        res.on('end', () => {
          try {
            const response = JSON.parse(body)
            if (response.error) {
              reject(new Error(response.error))
            } else {
              resolve(response.result)
            }
          } catch (error) {
            reject(new Error('Failed to parse response'))
          }
        })
      })

      req.on('error', (error) => {
        const hint = error.message.includes('ECONNREFUSED')
          ? ' (Is the primary MCP server running?)'
          : ''
        reject(new Error(`Failed to connect to primary MCP instance: ${error.message}${hint}`))
      })

      req.setTimeout(this.getRequestTimeout(method), () => {
        req.destroy()
        reject(new Error(`Request timeout: ${method}`))
      })

      req.write(data)
      req.end()
    })
  }

  /**
   * 处理来自 Extension 的消息
   */
  private handleMessage(data: string): void {
    try {
      const message: ResponseMessage = JSON.parse(data)

      const pending = this.pendingRequests.get(message.id)
      if (!pending) {
        console.error('[Bridge] Unknown response id:', message.id)
        return
      }

      clearTimeout(pending.timeout)
      this.pendingRequests.delete(message.id)

      if (message.error) {
        pending.reject(new Error(message.error.message))
      } else {
        pending.resolve(message.result)
      }
    } catch (error) {
      console.error('[Bridge] Failed to parse message:', error)
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  private readPositiveTimeout(value: string | undefined, fallback: number): number {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
  }

  private getRequestTimeout(method: string): number {
    return method === 'uploadImage' || method === 'uploadImage:complete'
      ? this.uploadRequestTimeout
      : this.requestTimeout
  }

  // 分片上传配置
  private readonly CHUNK_SIZE = 512 * 1024  // 512KB per chunk
  private readonly CHUNK_THRESHOLD = 1024 * 1024  // 1MB threshold for chunking

  /**
   * 分片上传图片
   * 大于 1MB 的图片会自动分片上传
   */
  async uploadImageChunked(
    imageData: string,
    mimeType: string,
    platform: string = 'weibo'
  ): Promise<{ url: string; platform: string }> {
    // 小于阈值，直接上传
    if (imageData.length < this.CHUNK_THRESHOLD) {
      return this.request('uploadImage', { imageData, mimeType, platform })
    }

    // 大图片，分片上传
    const uploadId = this.generateId()
    const chunks: string[] = []

    // 分割 base64 数据
    for (let i = 0; i < imageData.length; i += this.CHUNK_SIZE) {
      chunks.push(imageData.slice(i, i + this.CHUNK_SIZE))
    }

    console.error(`[Bridge] Chunked upload: ${chunks.length} chunks, total size: ${imageData.length}`)

    // 1. 发送开始消息
    await this.request('uploadImage:start', {
      uploadId,
      totalChunks: chunks.length,
      mimeType,
      platform,
    })

    // 2. 逐个发送分片
    for (let i = 0; i < chunks.length; i++) {
      await this.request('uploadImage:chunk', {
        uploadId,
        chunkIndex: i,
        data: chunks[i],
      })
    }

    // 3. 发送完成消息并获取结果
    const result = await this.request<{ url: string; platform: string }>('uploadImage:complete', {
      uploadId,
    })

    return result
  }
}
