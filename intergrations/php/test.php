<?php
require_once('IXR_Library.php');

$client = new IXR_Client('http://localhost:8082/xmlrpc.php');

$username = 'test';
$password = '123456';
$blogId = 0;



$queryBlog = $client->query('wp.getUsersBlogs', array($username, $password));
if (!$queryBlog) {
    die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage());
}

print_r($client->getResponse());



// test upload
$localFile = file_get_contents('./test.png');
$callResult = $client->query('wp.uploadFile', array($blogId, $username, $password, array(
    'name' => 'save.png',
    'type' => 'image/png',
    'bits' => $localFile
)));

if (!$callResult) {
    die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage());
}
// print_r($client);
print_r($client->getResponse());
