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
