
# 如何开发一个适配器

在安装同步助手插件后，打开适配器开发工具页面：https://developer.wechatsync.com/

详细文档：https://github.com/wechatsync/Wechatsync/blob/master/API.md

## 开发工具使用

#### 左侧管理菜单
- 测试文章数据
- 管理适配器
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4f6ad3e782141b99324a4d12e785f4d~tplv-k3u1fbpfcp-zoom-1.image)

#### 右上角几个常用按钮

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59812e997df54b8bb977495a2f0aa558~tplv-k3u1fbpfcp-zoom-1.image)

- 部署到插件 （comand + s）
- 测试账号获取
- 测试图片上传
- 测试文章同步

#### Console右边按钮
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f15fb5f27ceb4d339f027a02ea36f7ae~tplv-k3u1fbpfcp-zoom-1.image)
- 折叠
- 只看测试日志
- 清空日志
 
 
# 以头条为例

## 新建适配器`toutiao.js`
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ecf0a9ce3b1b4216bf4087280b3640e6~tplv-k3u1fbpfcp-zoom-1.image)


不支持直接`export default class`
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12a306ce43354e98a6c4a3030e4486db~tplv-k3u1fbpfcp-zoom-1.image)

通过挂载exports来暴露适配器
```js
exports.driver = ToutiaoAdapter
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a63edd03c54b46c3b45bca54e7f6f46a~tplv-k3u1fbpfcp-zoom-1.image)

### 点击按钮或Ctrl+S部署到插件
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b350138d3b674ceb8df98ad80ace0b12~tplv-k3u1fbpfcp-zoom-1.image)
```
info: 部署代码到插件...
success: toutiao.js 已部署到插件
```

## 登录状态 `getMetaData`
这个接口主要用来获取当前登录账号信息
``` js
async getMetaData() {
  var res = await $.ajax({
    url: 'https://mp.toutiao.com/mp/agw/media/get_media_info',
  })
  res = JSON.parse(res)
  return {
    uid: res.data.user.id,
    title: res.data.user.screen_name,
    avatar: res.data.user.https_avatar_url,
    supportTypes: ['html'],
    type: 'toutiao',
    displayName: '头条',
    home: 'https://mp.toutiao.com/profile_v3/graphic/publish',
    icon: 'https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png',
  }
}
```

#### 点击【测试账号】按钮
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c03a96c1c194cbf9c00705afbbf0218~tplv-k3u1fbpfcp-zoom-1.image)
console可以看到如下输出
```
info: 测试账号识别...
success: toutiao 账号识别成功
{
	"uid": 3082682164052558,
	"title": "Failarmy",
	"avatar": "https://p3.toutiaoimg.com/img/mosaic-legacy/ff5300002a0729e8e534~0x0.image",
	"supportTypes": [
		"html"
	],
	"type": "toutiao",
	"displayName": "头条",
	"home": "https://mp.toutiao.com/profile_v3/graphic/publish",
	"icon": "https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"
}
```

## 内容管理 addPost, editPost
- addPost 添加文章
- editPost 编辑文章

``` js
async addPost(post) {
  return {
    status: 'success',
    post_id: 0,
  }
}

async editPost(post_id, post) {
  var pgc_feed_covers = []
  if (post.post_thumbnail_raw && post.post_thumbnail_raw.images) {
    pgc_feed_covers.push({
      id: 0,
      url: post.post_thumbnail_raw.url,
      uri: post.post_thumbnail_raw.images[0].origin_web_uri,
      origin_uri: post.post_thumbnail_raw.images[0].origin_web_uri,
      ic_uri: '',
      thumb_width: post.post_thumbnail_raw.images[0].width,
      thumb_height: post.post_thumbnail_raw.images[0].height,
    })
  }

  await $.get('https://mp.toutiao.com/profile_v3/graphic/publish')

  var res = await $.ajax({
    url: 'https://mp.toutiao.com/mp/agw/article/publish?source=mp&type=article',
    type: 'POST',
    dataType: 'JSON',
    data: {
      title: post.post_title,
      article_ad_type: 2,
      article_type: 0,
      from_diagnosis: 0,
      origin_debut_check_pgc_normal: 0,
      tree_plan_article: 0,
      save: 0,
      pgc_id: 0,
      content: post.post_content,
      pgc_feed_covers: JSON.stringify(pgc_feed_covers),
    },
  })

  if (!res.data) {
    throw new Error(res.message)
  }

  return {
    status: 'success',
    post_id: res.data.pgc_id,
    draftLink:
      'https://mp.toutiao.com/profile_v3/graphic/publish?pgc_id=' +
      res.data.pgc_id,
  }
}

```


#### 点击【文章同步】按钮

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc5f713d57cd40e28dd5630bbf005d96~tplv-k3u1fbpfcp-zoom-1.image)

console可以看到如下输出
```
info: 测试文章同步...
info: 正在同步文章 默认文章
{
	"title": "Markdown",
	"content": "<h1 id=\"-precibus-terrarum-confecta-misero\"># Precibus terrarum confecta misero</h1>\n<h2 id=\"oras-iuppiter-lernaeae-est-quoque-pectora\">Oras Iuppiter Lernaeae est quoque pectora</h2>\n<p>Lorem markdownum, cum crimina agrestes: e tolle iungere remolliat melior, Minos\npariter quos sociis mors. Dominum dis falsam, cum omnis potenti <strong>aetas</strong>;\nmansit modo meritam.</p>\n<ol>\n<li>His sorores per solet inseris Herculeos</li>\n<li>Desertaque metuendus mihi terrae hanc sive vento</li>\n<li>Matrumque iam latumque medius quin artes nocent</li>\n<li>Quique quod memorque toto iam amara enixa</li>\n</ol>\n<h2 id=\"est-clipeo-arcade-alter\">Est clipeo Arcade alter</h2>\n<p>Voce summum Saturnia est quae si latissima nunc damnarat; <a href=\"http://precibus.com/\">et nate\ngaudet</a> vicinia corripit levius: flebile sum herba. Amante\nCalydonia tetigit, dictaque pondere properant deum centum totiens deus dolusque\ndata fert, torquere da! Neque et messis <strong>Palatinae</strong>; restabat interea coniunx!</p>\n<blockquote>\n<p>Phoebus nec; magno verbis; face tamen. Post terras novantur omnia, est nato\nsumptaque hanc, vos. Cruentato parcere aliis pectora conata destrinxit quid,\nintellegat celsior Aeoliden. In esse talia, concursibus armis dixere carina.</p>\n</blockquote>\n<h2 id=\"exaudi-gravis-materia-voto\">Exaudi gravis materia voto</h2>\n<p>Deae continet ut demisit vipereos iugales curasque arces resumit alligat elusam\nmollibus Salmacis, fratremque. Voce suo vincla regaliter morientibus feret,\ncaeleste torque tumultus navis. In quaeque, tenues ab currebam <strong>piosque\nsenumque</strong> visus sanguis motis primos est obnoxia, tectus tecumque munus.</p>\n<pre><code>menu.blobHeaderAnd(wirelessHoverInterface, twitterProgram,\n        latency_troll.schema(binary_blacklist));\ndrag += cableHyperFlops(model_third, ccd);\nif (bitmap_drive + definition) {\n    server(sector_graymail + 5, dot_day);\n    pci /= nameOfficeMenu;\n} else {\n    shell_technology += handle - display_interface(337227);\n    server += copyright_cable;\n}\n</code></pre>\n<h2 id=\"segnis-alto\">Segnis alto</h2>\n<p>Invasit neci intra homines lapsa ad fidem colloque longior illo, illa, virgine!\nTotumque et matre; utile quod pauca alite haec: aequoreas benefacta. Et tumulo\n<em>florentis</em> adfectu, luctus, tenebrasque <a href=\"http://non-spectatae.io/\">monimenta\ncorpus</a> mendacia non telum erat: nec. Pectora\nvelamenta male est latrantes pace: ferus hunc festa crines veniente, iam quoque,\nmonte mulcet floribus occidit. Orbis nepotis merguntque vidit.</p>\n<pre><code>userNewsgroupLan = batchLeakWidget(hoc_web_header * scroll_text +\n        dialSystemMail);\nvar importUddi = ping_scsi + midi_active;\nfolder -= matrix * desktop + publishing_app_windows;\n</code></pre>\n<p>Perque una propter miscet nisi aut pudorem locavit sperne a. Patetis cornicis\nrequiris gratata datis qua. Recentes <em>me</em> agmina bella miscet haeserunt aequoris\n<strong>habes penetralia limine</strong>, vana matrem ille qui erit, parere facilem. Cum\nrenarro, longe in serpens cessere novo, hoc accessi.</p>\n",
	"markdown": "# # Precibus terrarum confecta misero\n\n## Oras Iuppiter Lernaeae est quoque pectora\n\nLorem markdownum, cum crimina agrestes: e tolle iungere remolliat melior, Minos\npariter quos sociis mors. Dominum dis falsam, cum omnis potenti **aetas**;\nmansit modo meritam.\n\n1. His sorores per solet inseris Herculeos\n2. Desertaque metuendus mihi terrae hanc sive vento\n3. Matrumque iam latumque medius quin artes nocent\n4. Quique quod memorque toto iam amara enixa\n\n## Est clipeo Arcade alter\n\nVoce summum Saturnia est quae si latissima nunc damnarat; [et nate\ngaudet](http://precibus.com/) vicinia corripit levius: flebile sum herba. Amante\nCalydonia tetigit, dictaque pondere properant deum centum totiens deus dolusque\ndata fert, torquere da! Neque et messis **Palatinae**; restabat interea coniunx!\n\n> Phoebus nec; magno verbis; face tamen. Post terras novantur omnia, est nato\n> sumptaque hanc, vos. Cruentato parcere aliis pectora conata destrinxit quid,\n> intellegat celsior Aeoliden. In esse talia, concursibus armis dixere carina.\n\n## Exaudi gravis materia voto\n\nDeae continet ut demisit vipereos iugales curasque arces resumit alligat elusam\nmollibus Salmacis, fratremque. Voce suo vincla regaliter morientibus feret,\ncaeleste torque tumultus navis. In quaeque, tenues ab currebam **piosque\nsenumque** visus sanguis motis primos est obnoxia, tectus tecumque munus.\n\n    menu.blobHeaderAnd(wirelessHoverInterface, twitterProgram,\n            latency_troll.schema(binary_blacklist));\n    drag += cableHyperFlops(model_third, ccd);\n    if (bitmap_drive + definition) {\n        server(sector_graymail + 5, dot_day);\n        pci /= nameOfficeMenu;\n    } else {\n        shell_technology += handle - display_interface(337227);\n        server += copyright_cable;\n    }\n\n## Segnis alto\n\nInvasit neci intra homines lapsa ad fidem colloque longior illo, illa, virgine!\nTotumque et matre; utile quod pauca alite haec: aequoreas benefacta. Et tumulo\n*florentis* adfectu, luctus, tenebrasque [monimenta\ncorpus](http://non-spectatae.io/) mendacia non telum erat: nec. Pectora\nvelamenta male est latrantes pace: ferus hunc festa crines veniente, iam quoque,\nmonte mulcet floribus occidit. Orbis nepotis merguntque vidit.\n\n    userNewsgroupLan = batchLeakWidget(hoc_web_header * scroll_text +\n            dialSystemMail);\n    var importUddi = ping_scsi + midi_active;\n    folder -= matrix * desktop + publishing_app_windows;\n\nPerque una propter miscet nisi aut pudorem locavit sperne a. Patetis cornicis\nrequiris gratata datis qua. Recentes *me* agmina bella miscet haeserunt aequoris\n**habes penetralia limine**, vana matrem ille qui erit, parere facilem. Cum\nrenarro, longe in serpens cessere novo, hoc accessi."
}
success: 同步文章 默认文章 成功
https://mp.toutiao.com/profile_v3/graphic/publish?pgc_id=7031386221209256455
```


## 文件上传 uploadFile
文章中用到的图片都会通过调用这个文件上传接口后返回的url替换
``` js
async uploadFile(file) {
  var src = file.src
  var uploadUrl = 'https://mp.toutiao.com/mp/agw/article_material/photo/upload_picture?type=ueditor&pgc_watermark=1&action=uploadimage&encode=utf-8'
  var file = new File([file.bits], 'temp', {
    type: file.type
  });
  var formdata = new FormData()
  formdata.append('upfile', file)
  var res = await axios({
    url: uploadUrl,
    method: 'post',
    data: formdata,
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (res.data.state != 'SUCCESS') {
    throw new Error('图片上传失败 ' + src)
  }
  // http only
  console.log('uploadFile', res)
  return [{
    id: res.data.original,
    object_key: res.data.original,
    url: res.data.url,
    images: [
      res.data
    ]
  }]
}
```

#### 点击右上角【图片上传】按钮

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a66bfa1ceb34ef1a1f6fc1c9685dd39~tplv-k3u1fbpfcp-zoom-1.image)

console可以看到如下输出
```
info: 测试图片上传...
success: 第1张图片上传成功。图片源：http://placekitten.com/g/300/300
{
	"id": "tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e",
	"object_key": "tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e",
	"url": "https://image-tt-private.toutiao.com/tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e~tplv-obj.image?policy=eyJ2bSI6MywidWlkIjoiMzA4MjY4MjE2NDA1MjU1OCJ9&traceid=2021111712153001015115202556084895&x-orig-authkey=5a21e4afda5945d9a206a695e4c78a63&x-orig-expires=2147483647&x-orig-sign=6IUAnjmPEX3p4kbFeKs30oD%2FdaE%3D",
	"images": [
		{
			"code": 0,
			"height": 300,
			"image_type": 1,
			"message": "success",
			"mime_type": "image/jpeg",
			"origin_web_uri": "tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e",
			"origin_web_url": "https://image-tt-private.toutiao.com/tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e~tplv-obj.image?policy=eyJ2bSI6MywidWlkIjoiMzA4MjY4MjE2NDA1MjU1OCJ9&traceid=2021111712153001015115202556084895&x-orig-authkey=5a21e4afda5945d9a206a695e4c78a63&x-orig-expires=2147483647&x-orig-sign=6IUAnjmPEX3p4kbFeKs30oD%2FdaE%3D",
			"original": "tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e",
			"state": "SUCCESS",
			"title": "",
			"url": "https://image-tt-private.toutiao.com/tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e~tplv-obj.image?policy=eyJ2bSI6MywidWlkIjoiMzA4MjY4MjE2NDA1MjU1OCJ9&traceid=2021111712153001015115202556084895&x-orig-authkey=5a21e4afda5945d9a206a695e4c78a63&x-orig-expires=2147483647&x-orig-sign=6IUAnjmPEX3p4kbFeKs30oD%2FdaE%3D",
			"web_uri": "tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e",
			"web_url": "https://image-tt-private.toutiao.com/tos-cn-i-3003/9ae21678f7ae4f67a82d9976e288fd0e~tplv-obj.image?policy=eyJ2bSI6MywidWlkIjoiMzA4MjY4MjE2NDA1MjU1OCJ9&traceid=2021111712153001015115202556084895&x-orig-authkey=5a21e4afda5945d9a206a695e4c78a63&x-orig-expires=2147483647&x-orig-sign=6IUAnjmPEX3p4kbFeKs30oD%2FdaE%3D",
			"width": 300
		}
	]
}
```


## 预处理 preEditPost
移除一些无意义的内容，针对特定的平台进行排版修复等
``` js
async preEditPost(post) {
  var div = $('<div>')
  $('body').append(div)
  div.html(post.content)
  var doc = div
  var pres = doc.find('a')
  for (let mindex = 0; mindex < pres.length; mindex++) {
    const pre = pres.eq(mindex)
    try {
      pre.after(pre.html()).remove()
    } catch (e) {}
  }

  var pres = doc.find('iframe')
  for (let mindex = 0; mindex < pres.length; mindex++) {
    const pre = pres.eq(mindex)
    try {
      pre.remove()
    } catch (e) {}
  }

  try {
    const images = doc.find('img')
    for (let index = 0; index < images.length; index++) {
      const image = images.eq(index)
      const imgSrc = image.attr('src')
      if (imgSrc && imgSrc.indexOf('.svg') > -1) {
        console.log('remove svg Image')
        image.remove()
      }
    }
    const qqm = doc.find('qqmusic')
    qqm.next().remove()
    qqm.remove()
  } catch (e) {}

  post.content = $('<div>').append(doc.clone()).html()
  console.log('post', post)
}
```

## 图片替换 editImg
头条针对某些属性不是src的图片可以增加这个方法来处理
``` js
editImg(img, source) {
  img.attr('web_uri', source.images[0].origin_web_uri)
}
```


详细文档请看：https://github.com/wechatsync/Wechatsync/blob/master/API.md



