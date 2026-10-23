export interface Platform {
  id: string
  name: string
  icon: string
  homepage?: string
  isAuthenticated: boolean
  username?: string
}

export interface Article {
  title: string
  content: string
  summary?: string
  cover?: string
}

export interface SyncResult {
  platform: string
  platformName?: string
  success: boolean
  postUrl?: string
  draftOnly?: boolean
  message?: string
  error?: string
}

export type SyncStage = 'starting' | 'uploading_images' | 'saving' | 'completed' | 'failed'

export interface PlatformProgress {
  platform: string
  platformName: string
  stage: SyncStage
  imageProgress?: { current: number; total: number }
  error?: string
}

export type DialogStatus = 'loading' | 'idle' | 'syncing' | 'completed' | 'failed' | 'cancelled'

export interface SyncDialogProps {
  // Data
  article: Article | null
  platforms: Platform[]
  status: DialogStatus
  selectedPlatforms: string[]
  results: SyncResult[]
  platformProgress: Map<string, PlatformProgress>
  error: string | null

  // Actions
  onTogglePlatform: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onStartSync: () => void
  onRetryFailed: () => void
  onReset: () => void
  onCancel?: () => void

  // Optional
  onEditArticle?: () => void
  onClose?: () => void
  className?: string
}
