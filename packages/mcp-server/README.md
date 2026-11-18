# WechatSync MCP Server

MCP Server for WechatSync - 连接 Claude Code 和 Chrome Extension，实现 AI 辅助文章同步。

## 架构

```
┌─────────────┐      stdio       ┌─────────────────┐     WebSocket     ┌─────────────┐
│ Claude Code │ <──────────────> │ MCP Server      │ <───────────────> │  Extension  │
│             │                  │ (Node.js)       │                   │ (Background)│
└─────────────┘                  └─────────────────┘                   └─────────────┘
```

## 快速开始

### 1. 安装并构建

```bash
# 在项目根目录
yarn install
yarn build
```

### 2. 配置 Chrome 扩展

1. 点击扩展图标，进入设置
2. 启用「MCP 连接」开关
3. 设置一个安全 Token（记住这个值）

### 3. 配置 Claude Code

在 `~/.claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "sync-assistant": {
      "command": "node",
      "args": ["/path/to/Wechatsync/packages/mcp-server/dist/index.js"],
      "env": {
        "MCP_TOKEN": "your-secret-token-here"
      }
    }
  }
}
```

**重要**: `MCP_TOKEN` 必须与 Chrome 扩展中设置的 Token 一致。

### 4. 使用

在 Claude Code 中直接对话即可：

```
"帮我把这篇文章同步到知乎和掘金"
"检查下哪些平台已登录"
"上传这张图片到微博图床"
```

## 可用 Tools

### list_platforms

列出所有支持的平台及其登录状态。

```
参数:
- forceRefresh: boolean (可选) - 是否强制刷新登录状态
```

### check_auth

检查指定平台的登录状态。

```
参数:
- platform: string (必需) - 平台 ID，如 zhihu, juejin, toutiao
```

### sync_article

同步文章到指定平台（保存为草稿）。

```
参数:
- platforms: string[] (必需) - 目标平台 ID 列表
- title: string (必需) - 文章标题（纯文本，不含 # 号）
- markdown: string (必需) - 文章正文内容（Markdown 格式，推荐）
- content: string (可选) - 文章内容（HTML 格式，如提供 markdown 则可忽略）
- cover: string (可选) - 封面图 URL 或 base64 data URI
```

### extract_article

从当前浏览器页面提取文章内容。

### upload_image_file

从本地文件上传图片到图床平台，返回公开访问的 URL。

```
参数:
- filePath: string (必需) - 本地图片文件的绝对路径
- platform: string (可选) - 图床平台，默认 weibo
  可选值: weibo, zhihu, juejin, jianshu, woshipm
```

## 支持的平台

| 平台 | ID | 图片上传 |
|-----|-----|---------|
| 知乎 | zhihu | ✅ |
| 掘金 | juejin | ✅ |
| 头条号 | toutiao | ✅ |
| CSDN | csdn | ✅ |
| 简书 | jianshu | ✅ |
| 微博 | weibo | ✅ |
| B站专栏 | bilibili | ✅ |
| 百家号 | baijiahao | ✅ |
| 人人都是产品经理 | woshipm | ✅ |
| 大鱼号 | dayu | ✅ |

## 环境变量

- `MCP_TOKEN`: 安全验证 Token（必需）
- `SYNC_WS_PORT`: WebSocket 端口（默认 9527）
- `WECHATSYNC_UPLOAD_TIMEOUT`: 单张图片上传超时，单位毫秒（默认 60000）
- `SYNC_HTTP_PORT`: HTTP 端口（默认 9528，仅 SSE 模式）

## 开发

```bash
# 监听模式
yarn workspace @wechatsync/mcp-server dev

# 构建
yarn build:mcp

# 运行
yarn mcp
```

## 远程桥接

MCP Server 支持在远程服务器上运行，连接本地电脑上的 Chrome 扩展。适用于在远程开发机使用 Claude Code，同时利用本地浏览器的登录态同步文章。

### 架构

```
┌─────────────┐    stdio    ┌─────────────────┐   WebSocket    ┌─────────────────────┐
│ Claude Code │ <─────────> │ MCP Server      │ <────────────> │  本地 Chrome 扩展    │
│ (远程服务器) │             │ (远程服务器)     │   port 9527    │  (本地浏览器登录态)   │
└─────────────┘             └─────────────────┘                └─────────────────────┘
```

### 配置

**服务器端** MCP Server 默认监听 `0.0.0.0:9527`，无需额外配置。

**本地浏览器** Chrome 扩展设置中：
1. 开启「同步桥接」
2. 「服务器地址」填入远程地址，如 `ws://192.168.1.100:9527`
3. Token 与 MCP Server 的 `MCP_TOKEN` 保持一致

### 安全建议

- Token 以明文传输，生产环境建议配合 SSH 隧道：
  ```bash
  # 在本地建立 SSH 隧道，将远程 9527 映射到本地
  ssh -R 9527:localhost:9527 user@remote-server
  ```
- 或使用 VPN 保证网络安全
- 确保服务器防火墙按需放行端口

## 故障排除

### Extension 未连接

确保：
1. Chrome 扩展已安装并启用
2. 扩展设置中「MCP 连接」已开启
3. Token 设置正确且与 MCP Server 一致

### 图片上传失败

1. 检查目标平台是否已登录
2. 尝试换一个图床平台（如从 weibo 换到 juejin）
3. 检查图片格式是否支持（png, jpg, gif, webp）
