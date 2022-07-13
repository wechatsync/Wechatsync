# API 文档
文章同步助手是运行在浏览器内的扩展程序

## 网页发起同步任务
如果你是文章编辑器开发者，或自己有内容库需要同步多个渠道，引入这个JS SDK:  
https://github.com/wechatsync/article-syncjs
- window.syncPost 拉起同步任务框

## 同步内容到网站

### 伪装协议
目前内置的WordPress和Typecho适配器都是XML-RPC协议，如果你的网站不是这两个开源程序搭建的。你也可以通过兼容xmlrpc的协议来得到支持

[详见php范例](intergrations/php/)


### 开发插件适配器
欢迎贡献代码，待支持的[平台列表](https://airtable.com/shrLSJMnTC2BlmP29/tblApDW0GjKuWiLKU)

插件适配器的工作流程为：
- 调用 getMetaData 请求平台接口获取用户信息
- 调用 preEditPost 对文本内容进行预处理
- 调用 addPost 向平台添加文章
- 调用 uploadFile 向平台上传文章图片，插件进行内容替换
- 调用 editPost 向平台更新替换图片后的文章内容

有用户信息、新建文章、图片上传、更新文章几个接口，在类文件里填入上面几个方法的逻辑，调试工具会把代码提交给插件执行

``` js
export default class BaseAdapter {

  async getMetaData () {
    // 组装元数据：调用平台 api 获取用户信息和平台信息，并返回组装数据

  }

  async preEditPost(post) {
    // 内容预处理：预处理平台无法兼容的文本内容
  }

  async addPost(post) {
    // 创建文章：调用平台 api 创建草稿
  }

  async uploadFile(file) {
    // 上传图片：调用平台 api 上传图片
  }

  async editPost (postId, post) {
    // 更新文章：调用平台 api 更新文章（同步助手内部通过该接口替换文章内图片地址）
  }
}

// 注：在`developer.wechatsync.com`里不支持export default的语法，需要用export.driver = BaseAdapter的方式来导出
```

已有适配器 [参考](https://github.com/wechatsync/Wechatsync/tree/master/packages/%40wechatsync/drivers/src)，便于调试的[开发者工具](https://developer.wechatsync.com/?utm_source=doc)

### 适配器API
适配器隔离运行在JS VM里，提供了一些库和一些函数，[详见](https://github.com/wechatsync/Wechatsync/blob/master/packages/web-extension/src/runtime.js)
- `$` - jQuery库
- `axios` - axios请求库
- `turndown` - HTML转Markdown库
- `setCache` - 缓存写入
- `getCache` - 缓存读取
- `modifyRequestHeaders` - 有些网站可能做了cors，需要修改origin等
- `CryptoJS` 加密库


### 适配器开发流程
- 打开目标平台的发布内容页
- F12开发者工具 分析内容保存和图片上传的API交互
- 在适配器内部模拟API调用
- 测试是否成功调用
- 完成开发
