/**
 * Sync Assistant MCP Server
 *
 * 支持两种模式：
 * 1. stdio 模式（推荐）: claude mcp add sync-assistant node dist/index.js
 * 2. SSE 模式: 先启动服务，再 claude mcp add --transport sse sync-assistant http://localhost:9528/sse
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import express, { type Request, type Response } from 'express'
import fs from 'fs'
import path from 'path'
import { ExtensionBridge } from './ws-bridge.js'
import type { PlatformInfo, SyncResult } from './types.js'

const WS_PORT = parseInt(process.env.SYNC_WS_PORT || '9527', 10)
const HTTP_PORT = parseInt(process.env.SYNC_HTTP_PORT || '9528', 10)

// 检查是否是 SSE 模式
const isSSEMode = process.argv.includes('--sse')
const isHttpMode = process.argv.includes('--http')

// Extension WebSocket 桥接
const bridge = new ExtensionBridge(WS_PORT)

/**
 * 创建 MCP Server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'sync-assistant',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'list_platforms',
          description: '列出所有支持的平台及其登录状态',
          inputSchema: {
            type: 'object',
            properties: {
              forceRefresh: {
                type: 'boolean',
                description: '是否强制刷新登录状态（默认使用缓存）',
              },
            },
          },
        },
        {
          name: 'check_auth',
          description: '检查指定平台的登录状态',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                description: '平台 ID，如 zhihu, juejin, toutiao 等',
              },
            },
            required: ['platform'],
          },
        },
        {
          name: 'sync_article',
          description: '同步文章到指定平台（保存为草稿）。支持 Markdown 或 HTML 格式，优先使用 markdown 字段。重要：如果文章包含本地图片引用，必须先读取图片文件并转换为 base64 data URI 格式（如 ![img](data:image/png;base64,xxx)）。',
          inputSchema: {
            type: 'object',
            properties: {
              platforms: {
                type: 'array',
                items: { type: 'string' },
                description: '目标平台 ID 列表，如 ["zhihu", "juejin"]',
              },
              title: {
                type: 'string',
                description: '文章标题（纯文本，不含 # 号）',
              },
              markdown: {
                type: 'string',
                description: '文章正文内容（Markdown 格式，推荐）。注意：1) 不要包含标题行（# xxx），只传正文部分；2) 本地图片必须转换为 base64 data URI 格式，如 ![图片](data:image/png;base64,iVBORw0KGgo...)',
              },
              content: {
                type: 'string',
                description: '文章正文内容（HTML 格式，可选）。如果提供了 markdown 则此字段可忽略。',
              },
              cover: {
                type: 'string',
                description: '封面图 URL 或 base64 data URI（可选）',
              },
            },
            required: ['platforms', 'title', 'markdown'],
          },
        },
        {
          name: 'extract_article',
          description: '从当前浏览器页面提取文章内容',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'upload_image_file',
          description: '从本地文件路径上传图片到图床平台，返回可公开访问的 URL。推荐使用此方法，无需手动转换 base64。',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: '本地图片文件的绝对路径，如 /Users/xxx/image.png',
              },
              platform: {
                type: 'string',
                description: '上传到哪个平台作为图床，默认 weibo。可选: weibo, zhihu, juejin, jianshu, woshipm',
              },
            },
            required: ['filePath'],
          },
        },
      ],
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      // 检查 Extension 是否连接
      if (!bridge.isConnected()) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'Chrome Extension 未连接。请确保：\n1. 已安装同步助手扩展\n2. 扩展已启用 MCP 连接（点击设置图标开启）',
              }),
            },
          ],
          isError: true,
        }
      }

      let result: unknown

      switch (name) {
        case 'list_platforms':
          result = await bridge.request<PlatformInfo[]>('listPlatforms', {
            forceRefresh: (args as { forceRefresh?: boolean })?.forceRefresh,
          })
          break

        case 'check_auth':
          result = await bridge.request<PlatformInfo>('checkAuth', {
            platform: (args as { platform: string }).platform,
          })
          break

        case 'sync_article':
          result = await bridge.request<SyncResult[]>('syncArticle', {
            platforms: (args as { platforms: string[] }).platforms,
            article: {
              title: (args as { title: string }).title,
              content: (args as { content: string }).content,
              markdown: (args as { markdown?: string }).markdown,
              cover: (args as { cover?: string }).cover,
            },
          })
          break

        case 'extract_article':
          result = await bridge.request('extractArticle')
          break

        case 'upload_image_file': {
          // 从文件路径读取图片并上传
          const filePath = (args as { filePath: string }).filePath
          const platform = (args as { platform?: string }).platform || 'weibo'

          // 检查文件是否存在
          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`)
          }

          // 读取文件并转为 base64
          const fileBuffer = fs.readFileSync(filePath)
          const imageData = fileBuffer.toString('base64')

          // 根据扩展名确定 MIME 类型
          const ext = path.extname(filePath).toLowerCase()
          const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          }
          const mimeType = mimeTypes[ext] || 'image/png'

          // 使用分片上传
          result = await bridge.uploadImageChunked(imageData, mimeType, platform)
          break
        }

        default:
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: (error as Error).message }),
          },
        ],
        isError: true,
      }
    }
  })

  return server
}

/**
 * stdio 模式启动
 */
async function startStdioMode() {
  // 启动 WebSocket 服务器（Extension 连接）
  await bridge.start()

  const server = createServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)

  // 日志输出到 stderr（不影响 stdio 通信）
  console.error('[MCP] Sync Assistant started (stdio mode)')
  console.error(`[MCP] Extension WebSocket: ws://localhost:${WS_PORT}`)
}


/**
 * Streamable HTTP 模式启动（兼容 QwenPaw / MCP 新规范）
 */
async function startHttpMode() {
  await bridge.start()
  const app = express()
  app.use(express.json())
  // 多会话支持：每个 sessionId 独立的 Server(Protocol) + Transport
  const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: ReturnType<typeof createServer> }>()

  app.post('/mcp', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined
      if (sessionId && sessions.has(sessionId)) {
        const s = sessions.get(sessionId)!
        await s.transport.handleRequest(req, res, req.body)
        return
      }
      const server = createServer()
      let newSid: string | null = null
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => {
          newSid = crypto.randomUUID()
          return newSid
        },
      })
      transport.onclose = () => {
        if (newSid) sessions.delete(newSid)
      }
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
      if (newSid) sessions.set(newSid, { transport, server })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  })

  app.get('/mcp', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined
      const s = sessionId ? sessions.get(sessionId) : undefined
      if (!s) {
        res.status(400).json({ error: 'No active session' })
        return
      }
      await s.transport.handleRequest(req, res, req.body)
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  })

  app.delete('/mcp', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined
      const s = sessionId ? sessions.get(sessionId) : undefined
      if (!s) {
        res.status(400).json({ error: 'No active session' })
        return
      }
      await s.transport.handleRequest(req, res, req.body)
      if (sessionId) sessions.delete(sessionId)
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  })

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', extensionConnected: bridge.isConnected() })
  })

  app.get('/', (_req: Request, res: Response) => {
    res.json({ name: 'Sync Assistant MCP Server', version: '1.0.0', extensionConnected: bridge.isConnected() })
  })

  app.listen(HTTP_PORT, () => {
    console.error('[MCP] Sync Assistant started (Streamable HTTP mode, multi-session)')
    console.error(`[MCP] HTTP Server: http://localhost:${HTTP_PORT}/mcp`)
    console.error(`[MCP] Extension WebSocket: ws://localhost:${WS_PORT}`)
  })
}

/**
 * SSE 模式启动
 */
async function startSSEMode() {
  // 启动 WebSocket 服务器（Extension 连接）
  await bridge.start()

  const server = createServer()
  const app = express()
  let transport: SSEServerTransport | null = null

  // SSE 端点
  app.get('/sse', async (req: Request, res: Response) => {
    console.error('[MCP] New SSE connection from Claude Code')
    transport = new SSEServerTransport('/message', res)

    res.on('close', () => {
      console.error('[MCP] SSE connection closed')
      transport = null
    })

    await server.connect(transport)
  })

  // 消息端点
  app.post('/message', express.json(), async (req: Request, res: Response) => {
    if (transport) {
      await transport.handlePostMessage(req, res)
    } else {
      res.status(400).json({ error: 'No active SSE connection' })
    }
  })

  // 健康检查
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      extensionConnected: bridge.isConnected(),
    })
  })

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Sync Assistant MCP Server',
      version: '1.0.0',
      extensionConnected: bridge.isConnected(),
    })
  })

  app.listen(HTTP_PORT, () => {
    console.error('[MCP] Sync Assistant started (SSE mode)')
    console.error(`[MCP] HTTP Server: http://localhost:${HTTP_PORT}`)
    console.error(`[MCP] Claude Code: http://localhost:${HTTP_PORT}/sse`)
    console.error(`[MCP] Extension WebSocket: ws://localhost:${WS_PORT}`)
  })
}

// 启动
if (isHttpMode) {
  startHttpMode().catch((error) => {
    console.error('[MCP] Failed to start:', error)
    process.exit(1)
  })
} else if (isSSEMode) {
  startSSEMode().catch((error) => {
    console.error('[MCP] Failed to start:', error)
    process.exit(1)
  })
} else {
  startStdioMode().catch((error) => {
    console.error('[MCP] Failed to start:', error)
    process.exit(1)
  })
}

// 处理退出信号
process.on('SIGINT', () => {
  console.error('[MCP] Shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('[MCP] Shutting down...')
  process.exit(0)
})
