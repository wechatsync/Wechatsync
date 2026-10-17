import { Check, X, Loader2, ExternalLink, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Platform, SyncResult, PlatformProgress, DialogStatus } from './types'

interface PlatformListProps {
  platforms: Platform[]
  selected: Set<string>
  status: DialogStatus
  results: SyncResult[]
  platformProgress: Map<string, PlatformProgress>
  selectedPlatforms: string[]
  onToggle: (id: string) => void
  onSelectAll: () => void
}

export function PlatformList({
  platforms,
  selected,
  status,
  results,
  platformProgress,
  selectedPlatforms,
  onToggle,
  onSelectAll,
}: PlatformListProps) {
  const isIdle = status === 'idle' || status === 'loading'
  const isSyncing = status === 'syncing'
  // 完成/失败/取消都是终态，共用完成态的汇总头部和结果行渲染
  const isFinished = status === 'completed' || status === 'failed' || status === 'cancelled'

  const authenticatedPlatforms = platforms.filter(p => p.isAuthenticated)
  const unauthenticatedPlatforms = platforms.filter(p => !p.isAuthenticated)
  const selectedCount = selected.size
  const successCount = results.filter(r => r.success).length
  const failedCount = results.filter(r => !r.success).length

  // 按阶段加权计算进度：只同步一个平台时，完成前也能看到在推进，而不是一直停在 0%
  const stageWeight = (id: string) => {
    if (results.some(r => r.platform === id)) return 1
    const p = platformProgress.get(id)
    if (!p) return 0
    if (p.stage === 'uploading_images') {
      const { current = 0, total = 0 } = p.imageProgress || {}
      return 0.1 + (total > 0 ? 0.6 * (current / total) : 0)
    }
    return { starting: 0.1, saving: 0.85, completed: 1, failed: 1 }[p.stage]
  }
  const progressPercent = selectedPlatforms.length > 0
    ? (selectedPlatforms.reduce((sum, id) => sum + stageWeight(id), 0) / selectedPlatforms.length) * 100
    : 0

  // Idle: only authenticated platforms; syncing/completed: only selected
  const visiblePlatforms = isIdle
    ? authenticatedPlatforms
    : selectedPlatforms
        .map(id => platforms.find(p => p.id === id))
        .filter(Boolean) as Platform[]

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        {isIdle && (
          <>
            <span className="text-sm font-medium text-foreground">
              选择平台
              <span className="ml-1.5 text-muted-foreground font-normal">
                {selectedCount}/{authenticatedPlatforms.length}
              </span>
            </span>
            {authenticatedPlatforms.length > 0 && (
              <button
                onClick={onSelectAll}
                className="text-xs text-primary hover:underline"
              >
                {selectedCount === authenticatedPlatforms.length ? '取消全选' : '全选'}
              </button>
            )}
          </>
        )}
        {isSyncing && (
          <>
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-sm font-medium">同步中</span>
            </div>
            <span className="text-sm tabular-nums text-muted-foreground">
              {results.length}/{selectedPlatforms.length}
            </span>
          </>
        )}
        {isFinished && (
          <>
            <span className="text-sm font-medium">
              {status === 'completed' ? '同步完成' : status === 'failed' ? '同步失败' : '已取消'}
            </span>
            <div className="flex items-center gap-2">
              {successCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                  <Check className="w-3 h-3" />{successCount}
                </span>
              )}
              {failedCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
                  <X className="w-3 h-3" />{failedCount}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Progress bar (syncing only) */}
      {isSyncing && selectedPlatforms.length > 0 && (
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Platform rows */}
      <div className="space-y-0.5">
        {visiblePlatforms.map(platform => {
          const result = results.find(r => r.platform === platform.id)
          const progress = platformProgress.get(platform.id)
          const isSelected = selected.has(platform.id)

          return (
            <PlatformRow
              key={platform.id}
              platform={platform}
              isSelected={isSelected}
              isIdle={isIdle}
              isWaiting={isSyncing && !result && !progress}
              isInProgress={isSyncing && !result && !!progress}
              isSkipped={isFinished && !result}
              result={result || null}
              progress={progress || null}
              onToggle={() => onToggle(platform.id)}
            />
          )
        })}
      </div>

      {/* No platforms logged in */}
      {isIdle && platforms.length > 0 && authenticatedPlatforms.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">还没有登录任何平台</p>
          <p className="text-xs text-muted-foreground mt-1">请先在浏览器中登录平台账号</p>
        </div>
      )}
    </div>
  )
}

// ── Single platform row ──

function PlatformRow({
  platform,
  isSelected,
  isIdle,
  isWaiting,
  isInProgress,
  isSkipped,
  result,
  progress,
  onToggle,
}: {
  platform: Platform
  isSelected: boolean
  isIdle: boolean
  isWaiting: boolean
  isInProgress: boolean
  isSkipped: boolean
  result: SyncResult | null
  progress: PlatformProgress | null
  onToggle: () => void
}) {
  const isDone = !!result

  const handleClick = () => {
    if (!isIdle) return
    if (platform.isAuthenticated) {
      onToggle()
    } else if (platform.homepage) {
      chrome.tabs.create({ url: platform.homepage })
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200',
        isIdle && platform.isAuthenticated && 'cursor-pointer hover:bg-muted/60',
        isIdle && !platform.isAuthenticated && 'cursor-pointer opacity-50 hover:opacity-70',
        isIdle && isSelected && 'bg-primary/5',
        isDone && result?.success && 'bg-green-50 dark:bg-green-950/20',
        isDone && result && !result.success && 'bg-red-50 dark:bg-red-950/20',
      )}
    >
      {/* Status indicator */}
      <RowIndicator
        isIdle={isIdle}
        isSelected={isSelected}
        isAuthenticated={platform.isAuthenticated}
        isWaiting={isWaiting || isSkipped}
        isInProgress={isInProgress}
        result={result}
      />

      {/* Platform icon */}
      <img
        src={platform.icon}
        alt={platform.name}
        className="w-5 h-5 rounded flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/icon-48.png'
        }}
      />

      {/* Platform name */}
      <span className="text-sm flex-1 truncate">{platform.name}</span>

      {/* Right side info */}
      <RowInfo
        platform={platform}
        isIdle={isIdle}
        isWaiting={isWaiting}
        isInProgress={isInProgress}
        isSkipped={isSkipped}
        result={result}
        progress={progress}
      />
    </div>
  )
}

// ── Left indicator (checkbox / spinner / check / x) ──

function RowIndicator({
  isIdle,
  isSelected,
  isAuthenticated,
  isWaiting,
  isInProgress,
  result,
}: {
  isIdle: boolean
  isSelected: boolean
  isAuthenticated: boolean
  isWaiting: boolean
  isInProgress: boolean
  result: SyncResult | null
}) {
  if (result) {
    return result.success ? (
      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
      </div>
    ) : (
      <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
        <X className="w-3 h-3 text-red-600 dark:text-red-400" />
      </div>
    )
  }
  if (isInProgress) {
    return <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
  }
  if (isWaiting) {
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
  }
  // Idle
  if (!isAuthenticated) {
    return <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-700 flex-shrink-0" />
  }
  return (
    <div className={cn(
      'w-[18px] h-[18px] rounded border-2 transition-colors flex items-center justify-center flex-shrink-0',
      isSelected
        ? 'bg-primary border-primary'
        : 'border-gray-300 dark:border-gray-500'
    )}>
      {isSelected && <Check className="w-3 h-3 text-white" />}
    </div>
  )
}

// ── Right side info (username / stage / link / error) ──

function RowInfo({
  platform,
  isIdle,
  isWaiting,
  isInProgress,
  isSkipped,
  result,
  progress,
}: {
  platform: Platform
  isIdle: boolean
  isWaiting: boolean
  isInProgress: boolean
  isSkipped: boolean
  result: SyncResult | null
  progress: PlatformProgress | null
}) {
  // Done
  if (result) {
    if (result.success && result.postUrl) {
      return (
        <span className="flex items-center gap-1 flex-shrink-0">
          {result.message && (
            <span className="relative group">
              <span className="text-[10px] text-gray-400 truncate block" style={{ maxWidth: '140px' }}>
                {result.message}
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[11px] text-white bg-gray-800 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                {result.message}
              </span>
            </span>
          )}
          <a
            href={result.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-0.5 whitespace-nowrap"
            onClick={e => e.stopPropagation()}
          >
            {result.draftOnly ? '草稿' : '查看'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </span>
      )
    }
    if (!result.success) {
      return (
        <span
          className="text-xs text-red-500 dark:text-red-400 truncate max-w-[120px] flex-shrink-0"
          title={result.error}
        >
          {result.error || '失败'}
        </span>
      )
    }
    return <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">完成</span>
  }

  // In progress
  if (isInProgress && progress) {
    const stageText = {
      starting: '准备中',
      uploading_images: progress.imageProgress
        ? `图片 ${progress.imageProgress.current}/${progress.imageProgress.total}`
        : '上传图片',
      saving: '保存中',
      completed: '完成',
      failed: '失败',
    }[progress.stage]

    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs text-primary">{stageText}</span>
        {progress.stage === 'uploading_images' && progress.imageProgress && (
          <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(progress.imageProgress.current / progress.imageProgress.total) * 100}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  // 终态但未执行（取消/失败时未跑到的平台）
  if (isSkipped) {
    return <span className="text-xs text-muted-foreground flex-shrink-0">未执行</span>
  }

  // Waiting
  if (isWaiting) {
    return <span className="text-xs text-muted-foreground flex-shrink-0">等待中</span>
  }

  // Idle
  if (!platform.isAuthenticated) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
        去登录 <ChevronRight className="w-3 h-3" />
      </span>
    )
  }
  return (
    <span className="text-xs text-muted-foreground truncate max-w-[80px] flex-shrink-0">
      {platform.username || '已登录'}
    </span>
  )
}
