# hello world
# 开发指南
## 分支管理

- `master`: 跟随已发布的最新版本号
- `version/x.x.x`：下一个版本的代码
- `feature/xxx`：新功能开发
- `fix/xxx`：bug修改
- `refactor/xxx`：代码重构

下一版本代码统一合并到 `version/x.x.x` 分支，发布后合并至 master 并删除 `version/x.x.x`


## IDE 插件配置

- Code Spell Checker
- EditorConfig for VS Code
## 开发步骤

使用 yarn workspace 分包管理，项目核心代码在 `packages` 目录下
- `@wechatsync/drivers`: 各平台发布 Driver 集合
- `web-extension`: Chrome 插件
- `markdown-editor`: 在线 Markdown 编辑器

### 初始化

yarn（必须），由于 npm workspace 功能并不成熟，请选择使用 yarn

根目录下 `yarn install` 即可安装所有依赖

### 插件开发

``` bash
# 根目录
yarn workspace web-extension start
# 或者，在 web-extension 目录下
yarn start
```

插件目录下 `dist` 文件夹拖入浏览器插件管理界面

### Markdown编辑器开发
``` bash
# 根目录
yarn workspace markdown-editor start
# 或者，在 markdown-editor 目录下
yarn start
```
跟随命令行提示在浏览器查看效果，已配置热更新，无需手动刷新

### driver-devtool 开发
``` bash
# 根目录
yarn workspace driver-devtool start
# 或者，在 driver-devtool 目录下
yarn start
```
跟随命令行提示在浏览器查看效果，已配置热更新，无需手动刷新

### Driver集合开发

`packages/@wechatsync/drivers` 目录下直接开发即可

## 依赖管理

``` bash
# 开发环境相关的依赖，比如 webpack 插件、babel配置，在根目录下维护，添加命令为
yarn add [repo-name] -DW

# 其他各包自行需要的依赖，在各自空间维护，添加命令为
yarn workspace [package-name] add [repo-name]
# 或者在包目录下
yarn add [repo-name]
```

## 代码提交

代码提交规范遵循 conventional-changelog + lerna-scope 规则

命令行使用 `git commit` 进入引导交互流程

```
<type>[scope]: <description>

[body]

[footer]
```

- type
  - feat: 一个新功能
  - fix: 一个 Bug 修复
  - perf: 性能优化相关的代码更改
  - refactor: 非修复Bug、非增加新功能的代码修改
  - test: 增加缺失的测试或修改已存在的测试
  - build: 更改相关的构建系统或额外的依赖（比如：gulp、npm、broccoli）
  - ci: 更改 CI 相关的配置文件或脚本（比如: Travis, Circle, BrowserStack, SauceLabs）
  - docs: 只修改文档
  - revert: 回滚之前的提交
  - style: 不影响代码逻辑的格式化修改（比如：white-space, formatting, missing semi-colons）
  - chore: 未修改 src 和 test 文件的其他更改，比如更换 public 下的图片
- scope: 选择修改的包
  - web-extension
  - markdown-editor
  - driver-devtool
  - @wechatsync/drivers
  - empty
- description: 简单描述该此提交，限制100个字符
