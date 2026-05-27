import { cn } from '@/lib/utils'
import { ArticleCard } from './ArticleCard'
import { PlatformList } from './PlatformList'
import { PromoBanner } from './PromoBanner'
import { SharePrompt } from './SharePrompt'
import { TipBar } from './TipBar'
import type { SyncDialogProps } from './types'

/**
 * Unified sync dialog component.
 *
 * Single continuous view — platforms transition in-place from selection → progress → results.
 * Prop-driven — can be used in popup, editor overlay, or content script iframe.
 */
export function SyncDialog({
  article,
  platforms,
  status,
  selectedPlatforms,
  results,
  platformProgress,
  error,
  onTogglePlatform,
  onSelectAll,
  onDeselectAll,
  onStartSync,
  onRetryFailed,
  onReset,
  onCancel,
  onEditArticle,
  onClose,
  className,
}: SyncDialogProps) {
  const selectedSet = new Set(selectedPlatforms)
  const authenticatedPlatforms = platforms.filter(p => p.isAuthenticated)
  const failedCount = results.filter(r => !r.success).length

  const isIdle = status === 'idle' || status === 'loading'
  const isSyncing = status === 'syncing'
  const isCompleted = status === 'completed'
  const isFinished = isCompleted || status === 'failed' || status === 'cancelled'

  const handleSelectAll = () => {
    if (selectedPlatforms.length === authenticatedPlatforms.length) {
      onDeselectAll()
    } else {
      onSelectAll()
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Scrollable content — single continuous layout */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Promo banner — idle, show before article when no article */}
        {isIdle && !article && <PromoBanner />}

        {/* Article card — compact during sync/complete */}
        <ArticleCard
          article={article}
          compact={isSyncing || isFinished}
          onEdit={isIdle ? onEditArticle : undefined}
        />

        {/* Promo banner — idle, show after article when article exists */}
        {isIdle && article && <PromoBanner />}

        {/* Unified platform list — transitions in-place */}
        {article && (
          <PlatformList
            platforms={platforms}
            selected={selectedSet}
            status={status}
            results={results}
            platformProgress={platformProgress}
            selectedPlatforms={selectedPlatforms}
            onToggle={onTogglePlatform}
            onSelectAll={handleSelectAll}
          />
        )}

        {/* Share/review prompt — after sync completed */}
        {isCompleted && <SharePrompt />}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
            {error}
          </div>
        )}

        {/* No article hint */}
        {!article && authenticatedPlatforms.length > 0 && (
          <div className="text-xs text-muted-foreground text-center py-1">
            已登录 {authenticatedPlatforms.length} 个平台
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t p-4 space-y-3">
        {(isSyncing || isFinished) && <TipBar />}
        {isFinished ? (
          <div className="flex gap-2">
            {failedCount > 0 && (
              <button
                onClick={onRetryFailed}
                className="flex-1 py-2.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                重试失败项 ({failedCount})
              </button>
            )}
            <button
              onClick={onReset}
              className={cn(
                'py-2.5 rounded-lg font-medium transition-colors',
                failedCount > 0
                  ? 'flex-1 bg-muted text-foreground hover:bg-muted/80'
                  : 'w-full bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              完成
            </button>
          </div>
        ) : isSyncing ? (
          <button
            onClick={onCancel || onReset}
            className="w-full py-2.5 rounded-lg font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            取消
          </button>
        ) : (
          <button
            onClick={onStartSync}
            disabled={!article || selectedPlatforms.length === 0 || status === 'loading'}
            className={cn(
              'w-full py-2.5 rounded-lg font-medium transition-colors',
              !article || selectedPlatforms.length === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {!article
              ? '请先打开文章页面'
              : selectedPlatforms.length === 0
                ? '请选择同步平台'
                : `同步到 ${selectedPlatforms.length} 个平台`
            }
          </button>
        )}
      </div>
    </div>
  )
}
