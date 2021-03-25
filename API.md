# API 文档
文章同步助手是运行在浏览器内的扩展程序

## 同步内容到我的网站
目前内置的WordPress和Typecho都是XML-RPC协议，如果你的网站不是这两个开源程序搭建的。你也可以通过兼容xmlrpc的协议来得到支持



## 插件适配器

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
```

已有适配器 [参考](https://github.com/wechatsync/Wechatsync/tree/master/packages/%40wechatsync/drivers)，便于调试的[开发者工具](https://developer.wechatsync.com/?utm_source=doc)
