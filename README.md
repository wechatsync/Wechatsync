# 文章同步助手

![](https://img.shields.io/github/v/release/lljxx1/WechatSync.svg)
![](https://img.shields.io/github/last-commit/lljxx1/WechatSync)
![](https://img.shields.io/github/issues/lljxx1/WechatSync)

还在为一次编辑，N 个平台需多次排版上传脑壳疼吧？
为广大自媒体朋友撸了个提高生产力的小工具、可以做到的在多个内容平台无缝同步。

## 预览

#### 公众号文章同步

![](snapshots/wechatsync.png)

<!-- #### 正文提取

![](snapshots/raw.png)

![](snapshots/reader.png)

![](snapshots/sample.png) -->

<!-- #### 同步详情

![](snapshots/detail.png) -->

#### Markdown 编辑器

![](snapshots/markdown.png)

#### 多渠道选择

![](snapshots/pub.png)

## 安装方式

#### Chrome 商店

[传送门](https://chrome.google.com/webstore/detail/%E5%BE%AE%E4%BF%A1%E5%90%8C%E6%AD%A5%E5%8A%A9%E6%89%8B/hchobocdmclopcbnibdnoafilagadion)

#### 开发者模式安装

1. [下载](http://wpics.oss-cn-shanghai.aliyuncs.com/WechatSync.zip?date=0625) 并解压
2. 打开 chrome://extensions
3. 右上角“开启开发者模式”
4. 拖入解压后的文件夹到浏览器插件页

## 发布渠道

#### HTML

- [x] WordPress
- [x] Typecho
- [x] 知乎
- [x] 简书
- [x] 微博
- [x] 头条

#### Markdown

- [x] CSDN
- [x] 掘金
- [x] Segmentfault
- [x] Cnblog

## 特性

- [x] 公众号文章
- [x] Markdown 编辑器
- [x] 网页正文提取（基于 Safari 阅读模式） 可实现多平台互同步

### Markdown 编辑器

- [x] 图片上传图床

## 背景

早在几年前，同事就在为 WordPress 和微信公众号之间不同排版而烦恼，每次都是两边重复排版一遍。
2016 年的时候给他写了个爬虫，基于搜狗+打码平台+抓取内容，自动上传图片到 WordPress 博客。
最后他只需要专注于公众号这边的内容发布即可！

但是最近这个方案有点问题了，修起来也麻烦。

于是便有了这个基于浏览器插件的方案，所有信息都存储在本地。
不同于简媒、OpenWrite 之类基于云端的一键发布方案，免去了 Cookie 可能被盗用的安全风险。
相比 artipub 需要自己部署安装的方案，也要方便很多

https://www.v2ex.com/t/573320

## 更新日志

### 0.0.9

- 今日头条同步失败更明确的提示
- 修复今日头条不因为要手机号验证不能直接发布的问题，改为同步过去是草稿
- 解决了微信如果有外链及视频会无法同步到今日头条情况

### 0.0.6

- 新增 CSDN、掘金、博客园、思否等多个渠道
- 新增 Markdown 编辑器

### 0.0.5 - 2019.06.25

- 修复 typecho 同步 bug
- 修复简书同步 bug
- 修复代码块同步 bug

### 0.0.4 - 2019.06.16

- 修复头条 bug、微信标题被遮挡
- 修复代码块到知乎不换行的问题
- 新增 typecho
- 新增头条号

### 0.0.3 - 2019.06.12

- 新增简书，知乎

### 0.0.2 - 2019.06.09

- 新增同步详情
