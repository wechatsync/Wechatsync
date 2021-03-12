# 开发步骤

使用 yarn workspace 分包管理，项目核心代码在 `packages` 目录下
- `@wechatsync/drivers`: 各平台发布 Driver 集合
- `web-extension`: Chrome 插件
- `markdown-editor`: 在线 Markdown 编辑器
## 环境要求

- yarn（必须），由于 npm workspace 功能并不成熟，请选择使用 yarn

## 插件开发

``` bash
yarn workspace web-extension start
```

插件目录下 `dist` 文件夹拖入浏览器插件管理界面

## Markdown编辑器开发
``` bash
yarn workspace markdown-editor start
```

跟随命令行提示在浏览器查看效果，已配置热更新，无需手动刷新

## Driver集合开发

`packages/@wechatsync/drivers` 目录下直接开发即可

# 依赖管理

``` bash
# 开发环境相关的依赖，比如 webpack 插件、babel配置，在根目录下维护，添加命令为
yarn add [repo-name] -DW

# 其他各包自行需要的依赖，在各自空间维护，添加命令为
yarn workspace [package-name] add [repo-name]
```