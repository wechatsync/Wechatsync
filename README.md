# 文章同步助手 (Wechatsync)

![](https://img.shields.io/github/v/release/wechatsync/Wechatsync.svg)
![](https://img.shields.io/github/last-commit/wechatsync/Wechatsync)
![](https://img.shields.io/github/issues/wechatsync/Wechatsync)

**开源免费**的跨平台文章同步工具 | Chrome 浏览器扩展 | 自媒体内容分发神器

一键同步微信公众号文章到知乎、头条、掘金、小红书、CSDN 等 25+ 平台，支持 WordPress 等自建博客，告别重复复制粘贴。

> 🔥 支持 **Anthropic MCP 协议**，可在 Claude Desktop / Claude Code 中通过 AI 一键发布文章

## 工作原理

**文章同步助手不是爬虫，不模拟登录，不经过任何第三方服务器。**

它是一个 Chrome 浏览器扩展，工作方式与浏览器本身一致：

1. **使用你自己的登录态**：你在浏览器里正常登录各平台账号，扩展直接使用浏览器中已有的 Cookie，无需额外授权，无需输入密码
2. **调用平台官方接口**：发布文章时，扩展调用的是各平台 Web 编辑器使用的同一套官方 API，与你手动在网页上发布完全等价
3. **数据不离开你的设备**：所有请求直接从你的浏览器发往各平台，没有中间服务器，没有数据上传，源代码完全开源可审计
4. **草稿优先**：默认将文章同步为草稿，发布前由你人工确认，不会自动发布

```
你的浏览器（已登录各平台）
    ↓  扩展读取 Cookie
    ↓  调用平台官方 Web API
各平台（知乎 / 掘金 / 头条 / ...）
```

## 功能特性

- **一键批量发布**: 微信公众号文章同步到知乎、掘金、头条、CSDN、简书、微博、小红书等 25+ 自媒体平台
- **自建站支持**: WordPress、Typecho、博客园 (MetaWeblog API)
- **智能提取**: 自动从网页提取文章标题、内容、封面图（基于 Safari 阅读模式）
- **图片自动上传**: 自动转存文章图片到目标平台，无需手动处理
- **草稿模式**: 同步后保存为草稿，方便二次编辑后发布
- **MCP AI 集成**: 支持 Anthropic MCP 协议，配合 Claude Desktop / Claude Code 使用

## 安装方式

### Chrome 浏览器扩展安装

**推荐**: [Chrome 网上应用店](https://chrome.google.com/webstore/detail/%E5%BE%AE%E4%BF%A1%E5%90%8C%E6%AD%A5%E5%8A%A9%E6%89%8B/hchobocdmclopcbnibdnoafilagadion) (自动更新)

**手动安装**: 下载 [最新 Release](https://wpics.oss-cn-shanghai.aliyuncs.com/wechatsync-2.0.6.zip?date=20260225) 解压后加载到 Chrome 扩展


## 支持的平台

| 平台 | ID | 类型 | 状态 |
|-----|-----|-----|-----|
| 微信公众号 | weixin | 主流自媒体 | ✅ |
| 知乎 | zhihu | 主流自媒体 | ✅ |
| 微博 | weibo | 主流自媒体 | ✅ |
| 掘金 | juejin | 技术社区 | ✅ |
| CSDN | csdn | 技术社区 | ✅ |
| 简书 | jianshu | 通用 | ✅ |
| 头条号 | toutiao | 通用 | ✅ |
| B站专栏 | bilibili | 通用 | ✅ |
| 百家号 | baijiahao | 通用 | ✅ |
| 语雀 | yuque | 技术社区 | ✅ |
| 豆瓣 | douban | 通用 | ✅ |
| 搜狐号 | sohu | 通用 | ✅ |
| 雪球 | xueqiu | 财经 | ✅ |
| 人人都是产品经理 | woshipm | 产品 | ✅ |
| 大鱼号 | dayu | 通用 | ✅ |
| 一点号 | yidian | 通用 | ✅ |
| 51CTO | 51cto | 技术社区 | ✅ |
| 慕课网 | imooc | 技术社区 | ✅ |
| 开源中国 | oschina | 技术社区 | ✅ |
| SegmentFault | segmentfault | 技术社区 | ✅ |
| 搜狐焦点 | sohufocus | 房产 | ✅ |
| 小红书 | xiaohongshu | 主流自媒体 | ✅ |
| X (Twitter) | x | 海外 | ✅ |
| 东方财富 | eastmoney | 财经 | ✅ |
| WordPress | wordpress | 自建站 | ✅ |
| Typecho | typecho | 自建站 | ✅ |

- [提交新平台请求](https://airtable.com/shrLSJMnTC2BlmP29)

## CLI 命令行工具

最简单的使用方式，无需配置 MCP，安装即用：

```bash
npm install -g @wechatsync/cli
```

需要先安装 Chrome 扩展并在扩展设置中启用「MCP 连接」获取 Token，然后：

```bash
export WECHATSYNC_TOKEN="你的token"

# 同步文章到多个平台
wechatsync sync article.md -p zhihu,juejin,csdn

# 查看平台登录状态
wechatsync platforms --auth

# 从浏览器当前页面提取文章
wechatsync extract -o article.md
```

### Claude Code Skill 集成

安装后可在 Claude Code 中直接用自然语言操作：

```bash
/plugin marketplace add wechatsync/Wechatsync
/plugin install wechatsync
```

然后直接说"把这篇文章同步到掘金和知乎"即可。

详细文档见 [packages/cli/README.md](packages/cli/README.md)

## Claude Code / Claude Desktop 集成 (Anthropic MCP)

通过 Anthropic MCP 协议，可以在 Claude Code 或 Claude Desktop 中使用 AI 同步公众号文章到多个平台。

### 配置步骤

1. 构建项目: `pnpm build`
2. 在 Chrome 扩展设置中启用「MCP 连接」，并设置 Token
3. 在 `~/.claude/claude_desktop_config.json` 中添加配置：

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

### 使用示例

```
"帮我把这篇文章同步到知乎和掘金"
"检查下哪些平台已登录"
```

### 可用工具

| 工具 | 说明 |
|-----|------|
| `list_platforms` | 列出所有平台及登录状态 |
| `check_auth` | 检查指定平台登录状态 |
| `sync_article` | 同步文章到指定平台（草稿） |
| `extract_article` | 从当前浏览器页面提取文章 |
| `upload_image_file` | 上传本地图片到平台 |

详细文档见 [packages/mcp-server/README.md](packages/mcp-server/README.md)

## 网页发起同步

如果你是文章编辑器开发者，或有内容库需要同步多个渠道，可以使用 JS SDK：

- [article-syncjs](https://github.com/wechatsync/article-syncjs) - 网页端 SDK
- [API 文档](API.md)

```javascript
// 拉起同步任务框
window.syncPost(article)
```

## 开发

### 项目结构

```
Wechatsync/
├── packages/
│   ├── extension/     # Chrome 扩展 (MV3)
│   ├── mcp-server/    # MCP Server (stdio/SSE)
│   ├── cli/           # 命令行工具
│   └── core/          # 核心逻辑 (共享)
```

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

然后在 Chrome 中加载 `packages/extension/dist` 目录。

## 更新日志

### v2.0.6 (2026-02-25)

- 🆕 新增东方财富 (由@mayaohua贡献)
- 🆕 新增悬浮同步按钮（设置中开启，默认关闭）
- 🔧 修复 WordPress / Typecho 部分图片因扩展名错误导致上传失败

### v2.0.5 (2025-02-05)

- 📦 代码块提取兼容性提升（支持更多格式）
- 🔧 修复 OSChina
- 🆕 新增 Markdown 压缩包下载（适用于 Hexo 等博客同步）

完整日志见 [更新日志页面](https://www.wechatsync.com/changelog)

## 贡献代码

欢迎参与项目开发！

- [待支持的平台列表](https://airtable.com/shrLSJMnTC2BlmP29)
- [如何开发一个适配器](docs/adapter-spec.md)
- [API 文档](API.md)

## 使用场景

- **自媒体运营者**: 公众号文章一键同步到知乎、头条、百家号等多平台，提升内容分发效率
- **技术博主**: 技术博客同步到掘金、CSDN、SegmentFault、开源中国等技术社区
- **内容创作者**: 告别重复复制粘贴，一次编写多处发布，多平台发文不再繁琐
- **AI 写作用户**: 配合 Claude / GPT 等 AI 写作工具，AIGC 内容一键发布到多平台
- **独立博主**: WordPress、Typecho 博客文章同步到各大自媒体平台引流

## 常见问题

**Q: 这是什么工具？**

文章同步助手是一款开源免费的 Chrome 浏览器扩展，帮助自媒体作者、博主、内容创作者将文章一键同步到多个平台，避免重复复制粘贴，是自媒体运营必备的多平台发文工具。

**Q: 支持同步微信公众号文章吗？**

支持。可以直接从微信公众号编辑器提取文章，一键同步到知乎、头条、掘金等 25+ 平台。支持公众号文章同步到头条号、公众号同步到知乎、微信文章同步到掘金等各种场景。

**Q: 支持 AI 写作工具吗？**

支持 Anthropic MCP 协议，可配合 Claude Desktop、Claude Code 等 AI 工具使用，实现 AI 写作、AIGC 内容一键发布。也可以配合 ChatGPT、GPT-4 等工具生成的文章使用。

**Q: 数据安全吗？会上传我的账号信息吗？**

不会。所有操作在本地浏览器内完成，你的 Cookie、文章内容、账号信息不经过任何第三方服务器。代码完全开源，可自行审计：[查看源码](https://github.com/wechatsync/Wechatsync)

**Q: 和微小宝、新媒体管家、简媒、蚁小二有什么区别？**

文章同步助手是**开源免费**的，代码完全公开透明，无需付费订阅。作为浏览器扩展运行，数据本地存储，账号信息不上传，支持 MCP 协议可与 AI 工具集成。

**Q: 如何同步文章到多个平台？**

1. 安装 Chrome 浏览器扩展
2. 登录各平台账号（知乎、掘金、头条等）
3. 打开要同步的文章页面
4. 点击扩展图标，选择目标平台，一键同步

## License

GPL-3.0
