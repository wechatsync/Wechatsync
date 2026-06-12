import { useState, useEffect, useRef } from 'react'
import { X, Plug, PlugZap, Plus, Trash2, ChevronRight, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackFeatureDiscovery } from '../../lib/analytics'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

interface McpStatus {
  enabled: boolean
  connected: boolean
  connecting?: boolean
  token?: string
  serverUrl?: string
  lastError?: string | null
  nextReconnectAt?: number | null
}

interface CMSAccount {
  id: string
  name: string
  type: string
  url: string
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const [mcpStatus, setMcpStatus] = useState<McpStatus>({ enabled: false, connected: false })
  const [cmsAccounts, setCmsAccounts] = useState<CMSAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [floatingButtonEnabled, setFloatingButtonEnabled] = useState(false)
  const [serverUrlInput, setServerUrlInput] = useState('')
  const serverUrlTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 获取状态
  useEffect(() => {
    if (!open) return

    // MCP 状态
    chrome.runtime.sendMessage({ type: 'MCP_STATUS' }, (response) => {
      if (response && !response.error) {
        setMcpStatus({
          enabled: response.enabled ?? false,
          connected: response.connected ?? false,
          connecting: response.connecting ?? false,
          token: response.token,
          serverUrl: response.serverUrl,
          lastError: response.lastError,
          nextReconnectAt: response.nextReconnectAt,
        })
        setServerUrlInput(response.serverUrl || '')
      }
    })

    // CMS 账户
    chrome.storage.local.get('cmsAccounts', (result) => {
      setCmsAccounts(result.cmsAccounts || [])
    })

    // 悬浮按钮设置
    chrome.storage.local.get('floatingButtonEnabled', (result) => {
      setFloatingButtonEnabled(result.floatingButtonEnabled ?? false)
    })
  }, [open])

  // MCP 状态轮询 + 通知 background 加速重连
  useEffect(() => {
    if (!open || !mcpStatus.enabled) return

    // 通知 background：用户正在关注，加速重连
    chrome.runtime.sendMessage({ type: 'MCP_WATCH_START' })

    const interval = setInterval(() => {
      chrome.runtime.sendMessage({ type: 'MCP_STATUS' }, (response) => {
        if (response && !response.error) {
          setMcpStatus(prev => ({
            ...prev,
            connected: response.connected ?? false,
            connecting: response.connecting ?? false,
            lastError: response.lastError,
            nextReconnectAt: response.nextReconnectAt,
          }))
        }
      })
    }, 3000)

    return () => {
      clearInterval(interval)
      // 设置页关闭，恢复正常重连策略
      chrome.runtime.sendMessage({ type: 'MCP_WATCH_STOP' })
    }
  }, [open, mcpStatus.enabled])

  // 切换 MCP
  const toggleMcp = async () => {
    setLoading(true)
    const action = mcpStatus.enabled ? 'MCP_DISABLE' : 'MCP_ENABLE'

    // 追踪 MCP 功能发现
    if (!mcpStatus.enabled) {
      trackFeatureDiscovery('mcp', 'settings').catch(() => {})
    }

    chrome.runtime.sendMessage({ type: action }, (response) => {
      setLoading(false)
      if (response?.success) {
        setMcpStatus(prev => ({
          ...prev,
          enabled: !prev.enabled,
          connected: false,
          token: response.token,  // 保存返回的 token
        }))
      }
    })
  }

  const reconnectMcp = () => {
    setMcpStatus(prev => ({ ...prev, connecting: true, lastError: null }))
    chrome.runtime.sendMessage({ type: 'MCP_RECONNECT' })
  }

  // 服务器地址变更（防抖 800ms）
  const handleServerUrlChange = (value: string) => {
    setServerUrlInput(value)
    if (serverUrlTimer.current) {
      clearTimeout(serverUrlTimer.current)
    }
    serverUrlTimer.current = setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'MCP_SET_SERVER_URL',
        payload: { url: value.trim() },
      })
      setMcpStatus(prev => ({ ...prev, serverUrl: value.trim() }))
    }, 800)
  }

  // 切换悬浮按钮
  const toggleFloatingButton = () => {
    const next = !floatingButtonEnabled
    setFloatingButtonEnabled(next)
    chrome.storage.local.set({ floatingButtonEnabled: next })
  }

  // 删除 CMS 账户
  const deleteCmsAccount = async (id: string) => {
    // 直接从 storage 读取最新数据，避免多窗口操作时覆盖
    const storage = await chrome.storage.local.get('cmsAccounts')
    const accounts: CMSAccount[] = storage.cmsAccounts || []
    const updated = accounts.filter(a => a.id !== id)
    await chrome.storage.local.set({ cmsAccounts: updated })
    await chrome.storage.local.remove(`cms_pwd_${id}`)
    setCmsAccounts(updated)
  }

  if (!open) return null

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 抽屉 */}
      <div className={cn(
        'fixed inset-y-0 right-0 w-80 bg-background z-50 shadow-xl',
        'transform transition-transform duration-200',
        open ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">设置</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-57px)]">
          {/* 同步桥接设置 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">同步桥接</h3>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                {mcpStatus.connected ? (
                  <PlugZap className="w-5 h-5 text-green-500" />
                ) : (
                  <Plug className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">CLI / MCP 连接</p>
                  <p className="text-xs text-muted-foreground">
                    {mcpStatus.enabled
                      ? mcpStatus.connected
                        ? '已连接'
                        : mcpStatus.connecting
                          ? '连接中...'
                          : '等待连接...'
                      : '未启用'}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleMcp}
                disabled={loading}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  mcpStatus.enabled ? 'bg-primary' : 'bg-muted-foreground/30',
                  loading && 'opacity-50'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    mcpStatus.enabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {mcpStatus.enabled && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  供 CLI 和 MCP Server 通过 WebSocket 桥接同步文章
                </p>
                {!mcpStatus.connected && (
                  <button
                    onClick={reconnectMcp}
                    className="flex items-center justify-center gap-1.5 w-full p-2 rounded border border-border text-xs hover:bg-muted"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', mcpStatus.connecting && 'animate-spin')} />
                    立即重连
                  </button>
                )}
                {mcpStatus.lastError && !mcpStatus.connecting && (
                  <p className="text-xs text-destructive break-all">
                    {mcpStatus.lastError}
                  </p>
                )}
                {mcpStatus.token && (
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <p className="text-muted-foreground mb-1">Token:</p>
                    <code className="block bg-background p-1.5 rounded break-all select-all">
                      {mcpStatus.token}
                    </code>
                  </div>
                )}
                <div className="p-2 bg-muted/50 rounded text-xs">
                  <p className="text-muted-foreground mb-1">服务器地址 (留空使用本地默认):</p>
                  <input
                    type="text"
                    value={serverUrlInput}
                    onChange={(e) => handleServerUrlChange(e.target.value)}
                    placeholder="ws://localhost:9527"
                    className="w-full bg-background p-1.5 rounded border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 悬浮同步按钮 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">网页功能</h3>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">悬浮同步按钮</p>
                <p className="text-xs text-muted-foreground">在网页右下角显示快捷同步按钮</p>
              </div>
              <button
                onClick={toggleFloatingButton}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  floatingButtonEnabled ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    floatingButtonEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* CMS 账户 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">自建站点</h3>
              <button
                onClick={() => {
                  onClose()
                  window.location.hash = '/add-cms'
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="w-3 h-3" />
                添加
              </button>
            </div>

            {cmsAccounts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                暂无自建站点
              </p>
            ) : (
              <div className="space-y-2">
                {cmsAccounts.map(account => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{account.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{account.url}</p>
                    </div>
                    <button
                      onClick={() => deleteCmsAccount(account.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 历史记录 */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose()
                window.location.hash = '/history'
              }}
              className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted"
            >
              <span className="text-sm font-medium">查看全部历史</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
