# 新增小黑盒平台：上游变更说明

## 来源与提交目标

- 原始项目：[`wechatsync/Wechatsync`](https://github.com/wechatsync/Wechatsync)
- 开发分支仓库：[`moyvting/Wechatsync`](https://github.com/moyvting/Wechatsync)
- 基于分支：`v2`
- 平台名称：小黑盒
- 平台 ID：`xiaoheihe`
- 平台入口：<https://www.xiaoheihe.cn/creator>

本变更基于原始项目的适配器体系开发，目的是将“小黑盒”补充到 WechatSync
支持的平台列表中。代码继续遵循项目现有的本地处理、使用浏览器登录态和草稿优先原则。

## 变更摘要

### 1. 新增小黑盒适配器

新增 `packages/extension/src/adapters/xiaoheihe.ts`，并在扩展适配器注册表中注册：

- 检测小黑盒网页编辑器登录状态。
- 在后台打开小黑盒官方文章编辑器。
- 将文章标题和 HTML 正文写入 ProseMirror 编辑器。
- 标题按小黑盒限制截取到 30 个字符。
- 仅保存为草稿，不自动发布。
- 保存成功后返回草稿 ID 和编辑链接。
- 完成或失败后自动关闭后台编辑器标签页。

### 2. 图片改为站内上传

小黑盒不接受正文直接引用部分外部图片链接，因此适配器不会将这些链接原样保存：

1. 扩展先通过现有运行时下载原图。
2. 将图片转换为浏览器 `File`。
3. 按图片在正文中的原始位置，触发小黑盒编辑器原生粘贴上传。
4. 等待编辑器将临时图片替换为小黑盒站内 CDN 地址。
5. 所有图片处理完成后再保存草稿。

已经属于小黑盒或其 CDN 域名的图片不会重复上传。适配器同时实现了
`uploadImage()`，并声明 `image_upload` 能力。

### 3. 增加本地打包脚本

新增 `scripts/package-extension.ps1` 和根目录命令：

```powershell
npm run package:extension
```

脚本会构建扩展并在 `artifacts/` 中生成带扩展版本号和时间戳的 ZIP。也支持：

```powershell
.\scripts\package-extension.ps1 -SkipBuild
.\scripts\package-extension.ps1 -OutputDirectory C:\Builds
```

### 4. 文档更新

- README 支持平台数量由 `29+` 更新为 `30+`。
- 平台表新增“小黑盒 / `xiaoheihe` / 游戏社区”。
- CHANGELOG 增加未发布变更记录。

## 主要文件

- `packages/extension/src/adapters/xiaoheihe.ts`
- `packages/extension/src/adapters/index.ts`
- `scripts/package-extension.ps1`
- `package.json`
- `README.md`
- `CHANGELOG.md`

## 验证结果

已执行：

```powershell
corepack yarn workspace @wechatsync/extension typecheck
corepack yarn workspace @wechatsync/extension build
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\package-extension.ps1 -SkipBuild
git diff --check
```

结果：

- TypeScript 类型检查通过。
- Chrome 扩展生产构建通过。
- ZIP 打包成功，确认 `manifest.json` 位于压缩包根目录。
- 浏览器手动验证纯文本文章可成功保存为小黑盒草稿，未触发发布。
- 后续图片上传复测期间小黑盒网站返回 `ERR_CONNECTION_CLOSED`；图片上传代码已完成
  类型检查和生产构建，建议上游评审时在网络正常环境补充一次真实图片端到端验证。

## 建议的 Pull Request 标题

```text
feat: 新增小黑盒文章草稿同步平台
```

## 建议的 Pull Request 说明

```markdown
## 变更内容

- 新增小黑盒（`xiaoheihe`）文章草稿适配器
- 使用小黑盒官方网页编辑器和浏览器现有登录态
- 支持标题、HTML 正文和站内图片上传
- 外部图片先下载，再通过编辑器原生上传流程保存到小黑盒 CDN
- 默认仅保存草稿，不自动发布
- 新增 Windows PowerShell 扩展打包脚本
- 更新 README 平台列表和 CHANGELOG

## 原因

小黑盒是游戏内容创作者常用平台，目前 WechatSync 尚未支持。小黑盒编辑器会拒绝
部分外部图片链接，因此需要在保存草稿前将正文图片上传到平台站内存储。

## 验证

- `corepack yarn workspace @wechatsync/extension typecheck`
- `corepack yarn workspace @wechatsync/extension build`
- PowerShell ZIP 打包脚本验证
- 浏览器手动验证纯文本草稿保存

## 注意事项

图片上传依赖小黑盒网页编辑器当前的 ProseMirror 结构和原生粘贴上传行为。建议合并前
使用包含多张外部图片的文章进行一次端到端验证。
```
