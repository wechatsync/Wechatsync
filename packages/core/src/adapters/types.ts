import type { Article, AuthResult, SyncResult, PlatformMeta } from '../types'
import type { RuntimeInterface } from '../runtime/interface'

/**
 * 输出格式类型
 */
export type OutputFormat = 'html' | 'markdown'

/**
 * 预处理配置
 * 每个平台在 adapter 中定义自己需要的预处理选项
 * Content Script 根据这些配置在发送到 Service Worker 前进行预处理
 */
export interface PreprocessConfig {
  /** 输出格式: html 或 markdown */
  outputFormat: OutputFormat

  /** 移除链接标签，保留文字 */
  removeLinks?: boolean
  /** 保留的链接域名 */
  keepLinkDomains?: string[]

  /** 移除 iframe */
  removeIframes?: boolean
  /** 移除 HTML 注释 */
  removeComments?: boolean
  /** 移除微信特殊标签 (mpprofile, qqmusic 等) */
  removeSpecialTags?: boolean
  /** 移除特殊标签时同时移除其父元素（知乎等需要） */
  removeSpecialTagsWithParent?: boolean
  /** 移除 SVG 占位图片 */
  removeSvgImages?: boolean

  /** 处理代码块 */
  processCodeBlocks?: boolean
  /** 处理懒加载图片 (data-src → src) */
  processLazyImages?: boolean

  /** 移除空元素 (空 p, div, section 等) */
  removeEmptyElements?: boolean
  /** 移除没有有效 src 的 img 标签（src 为空或缺失） */
  removeEmptyImages?: boolean
  /** 移除 data-* 属性 */
  removeDataAttributes?: boolean
  /** 移除 srcset 属性 */
  removeSrcset?: boolean
  /** 移除 sizes 属性 */
  removeSizes?: boolean

  /** 将 section 转换为 div */
  convertSectionToDiv?: boolean
  /** 将 section 转换为 p */
  convertSectionToP?: boolean

  // 知乎等平台需要的额外处理
  /** 移除段落尾部的 br 标签 */
  removeTrailingBr?: boolean
  /** 解包单一子元素容器 */
  unwrapSingleChildContainers?: boolean
  /** 解包只含单个子 span 的 span（减少过深嵌套） */
  unwrapSingleChildSpans?: boolean
  /** 解包嵌套的 figure 标签 */
  unwrapNestedFigures?: boolean
  /** 展平嵌套的 b/strong 标签（移除内层，保留内容） */
  flattenNestedBold?: boolean
  /** 压缩 HTML（移除标签间空白） */
  compactHtml?: boolean

  // 清理空内容
  /** 移除空行（只含 br 或空白的段落） */
  removeEmptyLines?: boolean
  /** 移除空 div（只含 br 或空白，但保留含图片的） */
  removeEmptyDivs?: boolean
  /** 移除嵌套的空容器 */
  removeNestedEmptyContainers?: boolean
}

/**
 * 默认预处理配置
 */
export const DEFAULT_PREPROCESS_CONFIG: PreprocessConfig = {
  outputFormat: 'html',
  removeIframes: true,
  removeComments: true,
  removeSpecialTags: true,
  removeSvgImages: true,
  processCodeBlocks: true,
  processLazyImages: true,
  removeEmptyElements: true,
  removeDataAttributes: true,
  removeSrcset: true,
  removeSizes: true,
}

/**
 * 图片上传进度回调
 */
export type ImageProgressCallback = (current: number, total: number) => void

/**
 * 发布选项
 */
export interface PublishOptions {
  /** 只保存草稿，不发布 */
  draftOnly?: boolean
  /** 图片上传进度回调 */
  onImageProgress?: ImageProgressCallback
}

/**
 * 平台适配器接口
 */
export interface PlatformAdapter {
  /** 平台元信息 */
  readonly meta: PlatformMeta

  /** 预处理配置 (Content Script 根据此配置预处理内容) */
  readonly preprocessConfig?: Partial<PreprocessConfig>

  /** 初始化适配器 */
  init(runtime: RuntimeInterface): Promise<void>

  /** 检查认证状态 */
  checkAuth(): Promise<AuthResult>

  /** 发布文章 */
  publish(article: Article, options?: PublishOptions): Promise<SyncResult>

  /** 上传图片 (如果支持) */
  uploadImage?(file: Blob, filename?: string): Promise<string>

  /** 获取分类列表 (如果支持) */
  getCategories?(): Promise<Category[]>

  /** 获取草稿列表 (如果支持) */
  getDrafts?(): Promise<Draft[]>

  /** 更新文章 (如果支持) */
  update?(postId: string, article: Article): Promise<SyncResult>

  /** 删除文章 (如果支持) */
  delete?(postId: string): Promise<void>
}

/**
 * 分类
 */
export interface Category {
  id: string
  name: string
  parentId?: string
}

/**
 * 草稿
 */
export interface Draft {
  id: string
  title: string
  updatedAt: number
}

/**
 * 适配器注册项
 */
export interface AdapterRegistryEntry {
  meta: PlatformMeta
  factory: (runtime: RuntimeInterface) => PlatformAdapter
  /** 预处理配置 (Content Script 根据此配置预处理内容) */
  preprocessConfig?: Partial<PreprocessConfig>
}
