export default class SegmentfaultAdapter {
  constructor() {
    this.name = 'segmentfault'
  }

  async getMetaData() {
    var res = await $.get('https://segmentfault.com/user/settings')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var link = htmlDoc.getElementsByClassName('user-avatar')[0]
    if (!link) {
      throw Error('not found')
    }

    var uid = link.href.split('/').pop()
    var avatar = link.style['background-image']
      .replace('url("', '')
      .replace('")', '')
    console.log(
      link.href,
      link.style['background-image'].replace('url("', '').replace('")', '')
    )

    initliazeFrame('https://segmentfault.com/write?freshman=1', 'segment')

    return {
      uid: uid,
      title: uid,
      avatar: avatar,
      type: 'segmentfault',
      displayName: 'Segmentfault',
      supportTypes: ['markdown', 'html'],
      home: 'https://segmentfault.com/user/draft',
      icon:
        'https://imgcache.iyiou.com/Company/2016-05-11/cf-segmentfault.jpg',
    }
  }

  async addPost(post) {
    // console.log('addPost', segIframe)

    var turndownService = new turndown()
    turndownService.addRule('codefor', {
      filter: ['pre'],
      replacement: function (content) {
        // content = content.replace(new RegExp("` ", "g"), "\n");
        // content = content.replace(new RegExp("`", "g"), "");
        return ['```', content, '```'].join('\n')
      },
    })

    var markdown = turndownService.turndown(post.post_content)
    post.markdown = markdown
    console.log(markdown)

    var data = await requestFrameMethod(
      {
        type: 'sendPost',
        data: {
          type: 1,
          url: '',
          blogId: 0,
          isTiming: 0,
          created: '',
          weibo: 0,
          license: 0,
          tags: '',
          title: post.post_title,
          text: post.markdown,
          articleId: '',
          draftId: '',
          id: '',
        },
      },
      'segment'
    )

    console.log('data', data)
    return {
      status: 'success',
      post_id: data.data,
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://segmentfault.com/write?draftId=' + post_id,
    }
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits])
    formdata.append('image', blob)
    var res = await axios({
      url: 'https://segmentfault.com/img/upload/image',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = 'https://image-static.segmentfault.com/' + res.data[2]
    //  return url;
    return [
      {
        id: res.data[2],
        object_key: res.data[2],
        url: url,
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
  }

  async uploadFileByForm($file) {
    var formdata = new FormData()
    formdata.append('image', $file)
    var res = await axios({
      url: 'https://segmentfault.com/img/upload/image',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = 'https://image-static.segmentfault.com/' + res.data[2]
    return url
  }
}
