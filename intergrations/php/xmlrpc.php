<?php
require_once('./IXR_Library.php');


function login($username, $password) {
    // 登录

    return array(

    );
}

// 根据用户名密码获取站点信息
function getUsersBlogs($args) {

    $username = $args[0];
    $password = $args[1];

    // $user = login( $username, $password );

    $struct = array(
        'isAdmin'  => true,
        'url'      => 'https://xxx.com/',
        'blogid'   => '1',
        'blogName' => 'test',
        'xmlrpc'   => 'https://xxx.com/xmlrpc.php',
    );
    return array( $struct );
}


// 上传文件接口
function uploadFile($args) {

    $username = $args[1];
    $password = $args[2];
    $data     = $args[3];

    // $user = login( $username, $password );

    $name = $data['name'];
    $type = $data['type'];
    $bits = $data['bits'];

    $localFile = './upload/'. $name;
    // 写入本地
    file_put_contents($localFile, $bits);

    $webUrl = '';
    // $struct = array();
    // $struct['id']   =  1;
    // $struct['file'] = $localFile;
    // $struct['url']  = $localFile;

    return array(
        'id' => 2,
        'file' => 'file path',
        'url' => 'file url'
    );
}



// 创建新文章
function newPost($args) {

    $username       = $args[1];
    $password       = $args[2];
    $content_struct = $args[3];

    // $user = login( $username, $password );

    return $post_id;
}

// 根据文章ID更新文章
function editPost($args) {

    $username       = $args[1];
    $password       = $args[2];
    $post_id        = (int) $args[3];
    $content_struct = $args[4];

    $user = login( $username, $password );

    return $post_id;
}

// rpc映射
$api = array(
    'wp.getUsersBlogs' => 'getUsersBlogs',
    'wp.newPost' => 'newPost',
    'wp.editPost' => 'editPost',
    'wp.uploadFile' => 'uploadFile'
);

new IXR_Server($api);
