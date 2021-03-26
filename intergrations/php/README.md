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

### 主要RPC和参数
```
$username = 'test';
$password = '123456';
$post_id = 0;
$content_struct = array('post_title' => '', 'post_cotent' => '')
$file = array(
    'name' => 'save.png',
    'type' => 'image/png',
    'bits' => $localFile
);

$api = array(
    'wp.getUsersBlogs' => 'getUsersBlogs',
    'wp.newPost' => 'newPost',
    'wp.editPost' => 'editPost',
    'wp.uploadFile' => 'uploadFile'
);
```
- `wp.getUsersBlogs([$username, $password])` 获取用户博客信息
- `wp.newPost([$blogid, $username, $password, $content_struct])` 创建新文章
- `wp.editPost([$blogid, $username, $password, $post_id, $content_struct])` 编辑文章
- `wp.uploadFile([$blogid, $username, $password, $file])` 上传文件


