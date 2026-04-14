import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Loader2, Plus, Trash2, Check, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useCMSStore, type CMSType } from '../stores/cms'
import { trackPageView, trackPlatformExpansion } from '../../lib/analytics'

interface PlatformStatus {
  id: string
  name: string
  icon: string
  homepage: string
  isAuthenticated: boolean
  username?: string
}

interface CMSAccount {
  id: string
  name: string
  type: string
  url: string
}

const cmsOptions: { id: CMSType; name: string; description: string; icon: string }[] = [
  { id: 'wordpress', name: 'WordPress', description: '支持 XML-RPC 或 REST API', icon: 'https://s.w.org/style/images/about/WordPress-logotype-simplified.png' },
  { id: 'typecho', name: 'Typecho', description: '支持 XML-RPC 接口', icon: '/assets/typecho.ico' },
  { id: 'metaweblog', name: 'MetaWeblog API', description: '通用博客接口协议（博客园等）', icon: 'https://www.cnblogs.com/favicon.ico' },
]

// ── Shared sub-page header ──
function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b">
      <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h1 className="font-semibold">{title}</h1>
    </header>
  )
}

// ── Platform row ──
function PlatformRow({ platform, isLast }: { platform: PlatformStatus; isLast: boolean }) {
  return (
    <>
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 transition-colors cursor-pointer hover:bg-muted/50"
        onClick={() => platform.homepage && chrome.tabs.create({ url: platform.homepage })}
      >
        <img
          src={platform.icon}
          alt={platform.name}
          className="w-5 h-5 rounded flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/icon-48.png' }}
        />
        <span className="text-sm flex-1 truncate">{platform.name}</span>
        {platform.isAuthenticated ? (
          <span className="text-xs text-green-600 dark:text-green-400 truncate max-w-[80px] flex-shrink-0">
            {platform.username || '已登录'}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
            去登录 <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
      {!isLast && <div className="mx-4 border-b border-border/40" />}
    </>
  )
}

export function AccountsPage() {
  const navigate = useNavigate()
  const { addAccount } = useCMSStore()

  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [platformsLoading, setPlatformsLoading] = useState(true)
  const [cmsAccounts, setCmsAccounts] = useState<CMSAccount[]>([])

  // CMS form state
  const [step, setStep] = useState<'list' | 'add-cms-select' | 'add-cms-config'>('list')
  const [selectedCMS, setSelectedCMS] = useState<CMSType | null>(null)
  const [config, setConfig] = useState({ url: '', username: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mapPlatforms = (list: any[]): PlatformStatus[] =>
    list.map((p: any) => ({
      id: p.id, name: p.name, icon: p.icon,
      homepage: p.homepage, isAuthenticated: p.isAuthenticated,
      username: p.username,
    }))

  useEffect(() => {
    trackPageView('accounts').catch(() => {})

    // Cache first, then live refresh
    chrome.storage.local.get(['platformListCache', 'cmsAccounts'], (result) => {
      if (result.platformListCache?.length) {
        setPlatforms(mapPlatforms(result.platformListCache))
        setPlatformsLoading(false)
      }
      setCmsAccounts(result.cmsAccounts || [])
    })

    chrome.runtime.sendMessage({ type: 'CHECK_ALL_AUTH', payload: { forceRefresh: false } }).then((response) => {
      if (response?.platforms) setPlatforms(mapPlatforms(response.platforms))
      setPlatformsLoading(false)
    }).catch(() => setPlatformsLoading(false))
  }, [])

  const deleteCmsAccount = async (id: string) => {
    const storage = await chrome.storage.local.get('cmsAccounts')
    const updated = (storage.cmsAccounts || []).filter((a: CMSAccount) => a.id !== id)
    await chrome.storage.local.set({ cmsAccounts: updated })
    await chrome.storage.local.remove(`cms_pwd_${id}`)
    setCmsAccounts(updated)
  }

  const handleSubmitCMS = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await addAccount({ type: selectedCMS!, name: config.name, url: config.url, username: config.username, password: config.password })
      if (result.success) {
        trackPlatformExpansion(`cms_${selectedCMS}`, cmsAccounts.length + 1).catch(() => {})
        const storage = await chrome.storage.local.get('cmsAccounts')
        setCmsAccounts(storage.cmsAccounts || [])
        setStep('list')
        setConfig({ url: '', username: '', password: '', name: '' })
        setSelectedCMS(null)
      } else {
        setError(result.error || '添加失败')
      }
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  const authed = platforms.filter(p => p.isAuthenticated)
  const unauthed = platforms.filter(p => !p.isAuthenticated)

  // ── CMS config form ──
  if (step === 'add-cms-config' && selectedCMS) {
    return (
      <div className="flex flex-col h-[500px]">
        <PageHeader
          title={`配置 ${cmsOptions.find(c => c.id === selectedCMS)?.name}`}
          onBack={() => setStep('add-cms-select')}
        />
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-muted-foreground mb-4">输入站点信息以连接</p>
          <form onSubmit={handleSubmitCMS} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">站点名称</label>
              <input type="text" value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} placeholder="我的博客" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">站点地址</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="url" value={config.url} onChange={e => setConfig({ ...config, url: e.target.value })} placeholder="https://example.com" className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">用户名</label>
              <input type="text" value={config.username} onChange={e => setConfig({ ...config, username: e.target.value })} placeholder="admin" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">密码</label>
              <input type="password" value={config.password} onChange={e => setConfig({ ...config, password: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" required />
              <p className="text-xs text-muted-foreground mt-1">密码仅存储在本地，不会上传到任何服务器</p>
            </div>
            {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '连接中...' : '添加站点'}</Button>
          </form>
        </div>
      </div>
    )
  }

  // ── CMS type selection ──
  if (step === 'add-cms-select') {
    return (
      <div className="flex flex-col h-[500px]">
        <PageHeader title="添加自建站点" onBack={() => setStep('list')} />
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-muted-foreground mb-3">选择博客系统类型</p>
          <div className="space-y-2">
            {cmsOptions.map(cms => (
              <button
                key={cms.id}
                onClick={() => { setSelectedCMS(cms.id); setStep('add-cms-config') }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors text-left"
              >
                <img src={cms.icon} alt={cms.name} className="w-8 h-8 rounded" onError={e => { (e.target as HTMLImageElement).src = '/assets/icon-48.png' }} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{cms.name}</div>
                  <div className="text-xs text-muted-foreground">{cms.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main list ──
  return (
    <div className="flex flex-col h-[500px]">
      <header className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-semibold">账号</h1>
        {!platformsLoading && (
          <span className="text-xs text-muted-foreground ml-auto">
            {authed.length}/{platforms.length} 已登录
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Loading */}
        {platformsLoading && platforms.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Authenticated platforms */}
        {authed.length > 0 && (
          <div className="pt-3 pb-1">
            <h3 className="text-xs font-medium text-muted-foreground px-4 mb-1">已登录</h3>
            {authed.map((p, i) => <PlatformRow key={p.id} platform={p} isLast={i === authed.length - 1} />)}
          </div>
        )}

        {/* Unauthenticated platforms */}
        {unauthed.length > 0 && (
          <div className="pt-3 pb-1">
            <h3 className="text-xs font-medium text-muted-foreground px-4 mb-1">未登录</h3>
            {unauthed.map((p, i) => <PlatformRow key={p.id} platform={p} isLast={i === unauthed.length - 1} />)}
          </div>
        )}

        {/* Divider */}
        {platforms.length > 0 && <div className="mx-4 my-1 border-t" />}

        {/* CMS accounts */}
        <div className="px-4 pt-2 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">自建站点</h3>
            <button
              onClick={() => setStep('add-cms-select')}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="w-3 h-3" />
              添加
            </button>
          </div>

          {cmsAccounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">暂无自建站点</p>
              <button
                onClick={() => setStep('add-cms-select')}
                className="mt-2 text-xs text-primary hover:underline"
              >
                添加 WordPress / Typecho 等
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {cmsAccounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card"
                >
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{account.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{account.url}</p>
                  </div>
                  <button
                    onClick={() => deleteCmsAccount(account.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
