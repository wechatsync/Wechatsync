var cacheWeiboUser = null
// var Readability = require("../reader/Readability");

// fetch("https://card.weibo.com/article/v3/aj/editor/draft/save?uid=1820387812&id=402", { "credentials": "include", "headers": { "accept": "application/json, text/plain, */*", "accept-language": "zh-CN,zh;q=0.9", "content-type": "application/x-www-form-urlencoded" }, "referrer": "https://card.weibo.com/article/v3/editor", "referrerPolicy": "no-referrer-when-downgrade", "body": "id=402&title=aaaaaaaaaaa&updated=2019-10-10%2016%3A06%3A43&subtitle=&type=&status=0&publish_at=&error_msg=&error_code=0&collection=%5B%5D&free_content=&content=%3Cp%20align%3D%22justify%22%3Eaaaaaaaaaaaaa%3C%2Fp%3E&cover=https%3A%2F%2Fwx3.sinaimg.cn%2Flarge%2F6c80e9e4ly1g7t62jq7uzj202s01kdfz.jpg&summary=aaa&writer=&extra=null&is_word=0&article_recommend=%5B%5D&follow_to_read=1&isreward=1&pay_setting=%7B%22ispay%22%3A0%2C%22isvclub%22%3A0%7D&source=0&action=1&save=1", "method": "POST", "mode": "cors" });

export default class WeiboAdapter {
  constructor() {
    this.name = 'weibo'
  }

  async getMetaData() {
    var html = await $.get('https://card.weibo.com/article/v3/editor')
    var configIndx = html.indexOf('$CONFIG')
    var lastIndex = html.indexOf('</script>', configIndx)
    var configStr = html.substring(configIndx - 12, lastIndex)

    if (configStr.indexOf('CONFIG') > -1) {
      var res = new Function(configStr + ' return $CONFIG;')()
      cacheWeiboUser = res
      return {
        uid: res.uid,
        title: res.nick,
        avatar: res.avatar_large,
        supportTypes: ['html'],
        displayName: '微博',
        type: 'weibo',
        home: 'https://card.weibo.com/article/v3/editor',
        icon: 'https://weibo.com/favicon.ico',
      }
    } else {
      throw new Error('not found')
    }
  }

  async addPost(post) {
    var res = await $.post(
      'https://card.weibo.com/article/v3/aj/editor/draft/create?uid=' +
        cacheWeiboUser.uid
    )
    if (res.code != 100000) {
      throw new Error(res.msg)
      return
    }

    console.log(res)
    var post_id = res.data.id

    var res = await $.ajax({
      url:
        'https://card.weibo.com/article/v3/aj/editor/draft/save?uid=' +
        cacheWeiboUser.uid +
        '&id=' +
        post_id,
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        id: post_id,
        title: post.post_title,
        subtitle: '',
        type: '',
        status: '0',
        publish_at: '',
        error_msg: '',
        error_code: '0',
        collection: '[]',
        free_content: '',
        content: post.post_content,
        cover: '',
        summary: '',
        writer: '',
        extra: 'null',
        is_word: '0',
        article_recommend: '[]',
        follow_to_read: '1',
        isreward: '1',
        pay_setting: '{"ispay":0,"isvclub":0}',
        source: '0',
        action: '1',
        content_type: '0',
        save: '1',
      },
      // data: {
      //   id: post_id,
      //   title: post.post_title,
      //   status: 0,
      //   error_code: 0,
      //   content: post.post_content,
      //   cover: "",
      //   // summary: 'aaaab',
      //   writer: "",
      //   is_word: 0,
      //   article_recommend: [],
      //   follow_to_read: 1,
      //   isreward: 1,
      //   pay_setting: JSON.stringify({ ispay: 0, isvclub: 0 }),
      //   source: 0,
      //   action: 1,
      //   save: 1
      // }
    })
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
    }
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    try {
      div.html(post.content)
      var doc = div
      tools.processDocCode(div)
      tools.makeImgVisible(div)

      var tempDoc = $('<div>').append(doc.clone())
      post.content =
        tempDoc.children('div').length == 1
          ? tempDoc.children('div').html()
          : tempDoc.html()

      console.log('after.predEdit', post.content)
    } catch (e) {
      console.log('preEdit.error', e)
    }

    var rexp = new RegExp('>[\ts ]*<', 'g')
    var result = post.content.replace(rexp, '><')

    post.content = result
  }


  async editPost(post_id, post) {
    var res = await $.ajax({
      url:
        'https://card.weibo.com/article/v3/aj/editor/draft/save?uid=' +
        cacheWeiboUser.uid +
        '&id=' +
        post_id,
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        id: post_id,
        title: post.post_title,
        subtitle: '',
        type: '',
        status: '0',
        publish_at: '',
        error_msg: '',
        error_code: '0',
        collection: '[]',
        free_content: '',
        content: post.post_content,
        cover: post.post_thumbnail_raw ? post.post_thumbnail_raw.url : '',
        summary: '',
        writer: '',
        extra: 'null',
        is_word: '0',
        article_recommend: '[]',
        follow_to_read: '1',
        isreward: '1',
        pay_setting: '{"ispay":0,"isvclub":0}',
        source: '0',
        action: '1',
        content_type: '0',
        save: '1',
      },
      // data: {
      //   id: post_id,
      //   title: post.post_title,
      //   status: 0,
      //   error_code: 0,
      //   content: post.post_content,
      //   cover: post.post_thumbnail_raw ? post.post_thumbnail_raw.url : "",
      //   // summary: 'aaaab',
      //   writer: "",
      //   is_word: 0,
      //   article_recommend: [],
      //   follow_to_read: 1,
      //   isreward: 1,
      //   pay_setting: JSON.stringify({ ispay: 0, isvclub: 0 }),
      //   source: 0,
      //   action: 1,
      //   save: 1
      // }
    })

    if(res.code == '111006') {
      throw new Error(res.msg)
    }
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://card.weibo.com/article/v3/editor#/draft/' + post_id,
    }
  }

  untiImageDone(src) {
    return new Promise((resolve, reject) => {
      ;(async function loop() {
        var res = await $.ajax({
          url:
            'https://card.weibo.com/article/v3/aj/editor/plugins/asyncimginfo?uid=' +
            cacheWeiboUser.uid,
          type: 'POST',
          headers: {
            accept: '*/*',
            'x-requested-with': 'fetch',
          },
          data: {
            'urls[0]': src,
          },
        })

        var done = res.data[0].task_status_code == 1
        if (done) {
          resolve(res.data[0])
        } else {
          setTimeout(loop, 1000)
        }
      })()
    })
  }

  async uploadFileByUrl(file) {
    var src = file.src
    var res = await $.ajax({
      url:
        'https://card.weibo.com/article/v3/aj/editor/plugins/asyncuploadimg?uid=' +
        cacheWeiboUser.uid,
      type: 'POST',
      headers: {
        accept: '*/*',
        'x-requested-with': 'fetch',
      },
      data: {
        'urls[0]': src,
      },
    })

    // https://card.weibo.com/article/v3/aj/editor/plugins/asyncuploadimg?uid=1820387812
    var imgDetail = await this.untiImageDone(src)
    return [
      {
        id: imgDetail.pid,
        object_key: imgDetail.pid,
        url: imgDetail.url,
      },
    ]
  }

  async uploadFile(file) {
    var blob = new Blob([file.bits])
    console.log('uploadFile', file, blob)
    var uploadurl1 = `https://picupload.weibo.com/interface/pic_upload.php?app=miniblog&s=json&p=1&data=1&url=&markpos=1&logo=0&nick=&file_source=4`
    var uploadurl2 = 'https://picupload.weibo.com/interface/pic_upload.php?app=miniblog&s=json&p=1&data=1&url=&markpos=1&logo=0&nick='
    var fileResp = await $.ajax({
      url:
      uploadurl1,
      type: 'POST',
      processData: false,
      data: new Blob([file.bits]),
    })
    console.log(file, fileResp)
    return [
      {
        id: fileResp.data.pics.pic_1.pid,
        object_key: fileResp.data.pics.pic_1.pid,
        url:
          'https://wx3.sinaimg.cn/large/' +
          fileResp.data.pics.pic_1.pid +
          '.jpg',
      },
    ]
  }


  addPromotion(post) {
    var sharcode = `<blockquote>本文使用 <a href="https://zhuanlan.zhihu.com/p/358098152" class="internal">文章同步助手</a> 同步</blockquote>`
    post.content = post.content.trim() + `${sharcode}`
  }
}
