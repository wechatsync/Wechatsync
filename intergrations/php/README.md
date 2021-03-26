# dedecms thinkphp等php后端伪装wordpress xmlrpc支持文章同步助手同步

### 启动server

```
php -S localhost:8082

```
- PHP-IXR库 `IXR_Library.php`
- 接口实现`xmlrpc.php`
- 代码测试`test.php`


### 测试
```
php test.php
```

### 主要RPC方法
```
$api = array(
    'wp.getUsersBlogs' => 'getUsersBlogs',
    'wp.newPost' => 'newPost',
    'wp.editPost' => 'editPost',
    'wp.uploadFile' => 'uploadFile'
);
```
- `wp.getUsersBlogs` 获取用户博客信息
- `wp.newPost` 创建新文章
- `wp.editPost` 编辑文章
- `wp.uploadFile` 上传文件
