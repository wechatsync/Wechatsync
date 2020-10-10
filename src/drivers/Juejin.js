const { processDocCode, makeImgVisible } = require('./tools/code')
import TurndownService from 'turndown'

export default class Juejin {
  constructor(ac) {
    this.version = '0.0.1'
    this.name = 'juejin'
    this.account = ac
    this.skipUpload = true
    console.log('Juejin', 'initliaze', ac, this)
  }

  async getMetaData() {
    var data = await $.get('https://juejin.im/auth')
    console.log(data)
    return {
      uid: data.userId,
      title: data.user.username,
      avatar: data.user.avatarLarge,
      type: 'juejin',
      displayName: '掘金',
      raw: data,
      supportTypes: ['markdown', 'html'],
      home: 'https://juejin.im/editor/drafts',
      icon: 'https://gold-cdn.xitu.io/favicons/favicon.ico',
    }
  }

  async addPost(post, _instance) {
    // https://post-storage-api-ms.juejin.im/v1/draftStorage
    console.log('addPost', _instance)
    console.log(_instance.account, post.markdown)
    // var post_id = res.data.id;
    console.log('TurndownService', TurndownService)
    var turndownService = new TurndownService()
    turndownService.addRule('codefor', {
      filter: ['pre'],
      replacement: function (content) {
        // content = content.replace(new RegExp("` ", "g"), "\n");
        // content = content.replace(new RegExp("`", "g"), "");
        return ['```', content, '```'].join('\n')
      },
    })

    var markdown = turndownService.turndown(post.post_content)
    console.log(markdown)
    var res = await $.ajax({
      url: 'https://post-storage-api-ms.juejin.im/v1/draftStorage',
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        uid: _instance.account.uid,
        device_id: _instance.account.raw.clientId,
        token: _instance.account.raw.token,
        src: 'web',
        category: '5562b428e4b00c57d9b94b9d',
        content: '',
        // html: post.post_content,
        html: ``,
        markdown: markdown,
        screenshot: '',
        isTitleImageFullscreen: 0,
        tags: '',
        title: post.post_title,
        type: 'markdown',
      },
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.d[0],
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://juejin.im/editor/drafts/' + post_id,
    }
  }

  async uploadFile(file) {
    var src = file.src
    var res = await $.ajax({
      url: 'https://cdn-ms.juejin.im/v1/fetch',
      type: 'POST',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: true,
      },
      headers: {
        accept: 'application/json',
      },
      data: JSON.stringify({
        bucket: 'gold-user-assets',
        url: src,
      }),
    })

    console.log(res)
    return [
      {
        id: res.dkey,
        object_key: res.dkey,
        url: res.d.url.https,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      // post.content = post.content.replace(/\>\s+\</g,'');
      console.log('zihu.Juejin')
      div.html(post.content)

      // var org = $(post.content);
      // var doc = $('<div>').append(org.clone());
      var doc = div
      // var pres = doc.find("pre");
      processDocCode(div)
      makeImgVisible(div)

      var tempDoc = $('<div>').append(doc.clone())
      post.content =
        tempDoc.children('div').length == 1
          ? tempDoc.children('div').html()
          : tempDoc.html()

      console.log('after.predEdit', post.content)
    } catch (e) {
      console.log('preEdit.error', e)
    }
  }

  async uploadFileByForm($file) {
    var formdata = new FormData()
    formdata.append('file', $file)
    var res = await axios({
      url: 'https://cdn-ms.juejin.im/v1/upload?bucket=gold-user-assets',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return res.data.d.url.http
  }
}
