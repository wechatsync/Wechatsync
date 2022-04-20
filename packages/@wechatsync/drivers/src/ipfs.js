const template = `<!DOCTYPE html>
<html>
<head>
    <meta name="wechat-enable-text-zoom-em" content="true">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light dark">
    <meta name="viewport"
        content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0,viewport-fit=cover">
    <link rel="shortcut icon" type="image/x-icon" href="//res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico"
        reportloaderror>
    <link rel="mask-icon" href="//res.wx.qq.com/a/wx_fed/assets/res/MjliNWVm.svg" color="#4C4C4C" reportloaderror>
    <link rel="apple-touch-icon-precomposed" href="//res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png" reportloaderror>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="format-detection" content="telephone=no">
    <meta property="og:title" content="" />
    <meta property="og:url"
        content="http://mp.weixin.qq.com/s?__biz=MjM5OTUyMzAwOQ==&amp;mid=2654196759&amp;idx=1&amp;sn=4cffc47bf77c91baca1623fe83f12a80&amp;chksm=bcfd53b98b8adaaf642af2bf3b13b73ff8588a475bfaa405ee486ce28cccef6c670a0886cadc#rd" />
    <meta property="og:image"
        content="http://mmbiz.qpic.cn/mmbiz_jpg/EwGiczNdLt0K7TwYItPlnuia8bYGSxpGxuia1qNJ8Im9jAiakictFK7xTNGw34CfmHhyQF9OGEYDWvhnoJMicKcS9iaibg/0?wx_fmt=jpeg" />
    <meta property="og:description" content="" />
    <meta property="og:site_name" content="" />
    <meta property="og:type" content="article" />
    <meta property="og:article:author" content="" />
    <title>TITLE</title>
    <link rel="stylesheet"
        href="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/../mmbizappmsg/assets/appmsg.c9d06de2.css"
        reportloaderror>
    <link rel="stylesheet"
        href="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/../mmbizappmsg/assets/sprite.dcee1002.css"
        reportloaderror>
    <link rel="stylesheet"
        href="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/../mmbizappmsg/assets/report.5e0fdfbf.css"
        reportloaderror>
    <link rel="stylesheet"
        href="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/../mmbizappmsg/assets/wxwork_hidden.96d6e8be.css"
        reportloaderror>
    <link rel="stylesheet"
        href="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/../mmbizappmsg/assets/controller.5417a6ee.css"
        reportloaderror>
        <style type="text/css">@media (prefers-color-scheme: dark) {.js_darkmode__0{color: #191919 !important;background-color: rgb(185, 193, 189) !important;}.js_darkmode__1{color: #191919 !important;background-color: rgb(190, 190, 192) !important;}.js_darkmode__2{color: #191919 !important;color: #191919 !important;color: #191919 !important;}.js_darkmode__3{color: rgb(163, 163, 163) !important;background-color: rgba(25, 25, 25, 0) !important;}.js_darkmode__4{color: rgb(163, 163, 163) !important;}.js_darkmode__5{color: rgb(63, 142, 231) !important;}.js_darkmode__6{color: rgb(0, 104, 255) !important;}}</style>
</head>

<body id="activity-detail" class="zh_CN wx_wap_page
	mm_appmsg
	comment_feature
	discuss_tab appmsg_skin_default appmsg_style_default">
    <div id="js_article" class="rich_media">
        <div id="js_top_ad_area" class="top_banner">
        </div>
        <div class="rich_media_inner">
            <div id="page-content" class="rich_media_area_primary">
                <div class="rich_media_area_primary_inner">
                    <div id="img-content" class="rich_media_wrp">
                        <h1 class="rich_media_title " id="activity-name">
                           TITLE
                        </h1>
                        <div id="meta_content" class="rich_media_meta_list">
                            <span class="rich_media_meta rich_media_meta_nickname" id="profileBt">
                                <a href="javascript:void(0);" class="wx_tap_link js_wx_tap_highlight weui-wa-hotarea"
                                    id="js_name">
                                    AUTHOR
                                </a>
                            </span>
                            <em id="publish_time" class="rich_media_meta rich_media_meta_text">
                                PUBLISH_TIME
                            </em>
                        </div>
                        <div class="rich_media_content" id="js_content">
                            CONTENT
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>`

class IPFSAdapter {
  constructor() {
    this.version = '0.0.1'
    this.name = 'ipfs'
    this.endpoint = 'https://ipfs.infura.io:5001'
    this.gatewayList = [
      'infura-ipfs.io',
    ]
  }

  async getMetaData() {
    return {
      uid: 'ipfs',
      title: '备份到IPFS',
      avatar: 'https://ipfs.io/favicon.ico',
      supportTypes: ['html'],
      type: 'ipfs',
      displayName: '备份到IPFS',
      home: 'https://ipfs.io/',
      icon: 'https://ipfs.io/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    const content = template
      .replace('TITLE', post.post_title)
      .replace('TITLE', post.post_title)
      .replace('CONTENT', post.post_content)
    console.log(content)
    const res = await this.uploadFile({
      bits: content,
      type: 'text/html',
    })
    return {
      status: 'success',
      post_id: res[0].id,
      draftLink: res[0].url,
    }
  }

  async uploadFile(file) {
    const { src, post_id } = file
    var uploadUrl = `${this.endpoint}/api/v0/add?stream-channels=true&progress=false`
    var file = new File([file.bits], 'temp.jpg', {
      type: file.type,
    })
    var formdata = new FormData()
    formdata.append('file', file)
    var res
    try {
      res = await axios({
        url: uploadUrl,
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch (e) {
      // wait
      await wait(5000)
    }

    await wait(3000)
    if (!res.data.Hash) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    const endpoint =
      this.gatewayList.length > 1
        ? this.gatewayList[Math.round(Math.random() % this.gatewayList.length)]
        : this.gatewayList[0]
    const url = `https://${endpoint}/ipfs/${res.data.Hash}`
    return [
      {
        id: res.data.Hash,
        object_key: res.data.Hash,
        url: url,
        images: [res.data],
      },
    ]
  }
}

export default IPFSAdapter
