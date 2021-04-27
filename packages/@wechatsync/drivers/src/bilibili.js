export default class BilibiliAdapter {
  constructor(config) {
    // this.skipReadImage = true
    this.config = config
    this.name = 'bilibili'
  }

  async getMetaData() {
    var res = await $.ajax({
      url: 'https://api.bilibili.com/x/web-interface/nav?build=0&mobi_app=web',
    })
    if(!res.data.isLogin) {
      throw new Error('not login')
    }
    // console.log(res);
    return {
      uid: res.data.mid,
      title: res.data.uname,
      avatar: res.data.face,
      supportTypes: ['html'],
      type: 'bilibili',
      displayName: '哔哩哔哩',
      home: 'https://member.bilibili.com/platform/upload/text',
      icon: 'https://www.bilibili.com/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    // var pgc_feed_covers = []
    // if (post.post_thumbnail_raw && post.post_thumbnail_raw.images) {
    //   pgc_feed_covers.push({
    //     id: 0,
    //     url: post.post_thumbnail_raw.url,
    //     uri: post.post_thumbnail_raw.images[0].origin_web_uri,
    //     origin_uri: post.post_thumbnail_raw.images[0].origin_web_uri,
    //     ic_uri: '',
    //     thumb_width: post.post_thumbnail_raw.images[0].width,
    //     thumb_height: post.post_thumbnail_raw.images[0].height,
    //   })
    // }

    var csrf = this.config.state.csrf;
    var res = await $.ajax({
      url: 'https://api.bilibili.com/x/article/creative/draft/addupdate',
      type: 'POST',
      dataType: 'JSON',
      data: {
        tid: 4,
        title: post.post_title,
        save: 0,
        pgc_id: 0,
        content: post.post_content,
        csrf: csrf,
        // pgc_feed_covers: JSON.stringify(pgc_feed_covers),
      },
    })

    if (!res.data) {
      throw new Error(res.message)
    }

    return {
      status: 'success',
      post_id: res.data.aid,
      draftLink:
        'https://member.bilibili.com/platform/upload/text/edit?aid=' +
        res.data.aid,
    }
  }

  async uploadFile(file) {
    var src = file.src
    var csrf = this.config.state.csrf

    var uploadUrl ='https://api.bilibili.com/x/article/creative/article/upcover'
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()
    formdata.append('binary', file)
    formdata.append('csrf', csrf)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.code != 0) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    var id = Math.floor(Math.random() * 100000)
    return [
      {
        id: id,
        object_key: id,
        url: res.data.data.url,
        size: res.data.data.size,
        // images: [res.data],
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    div.html(post.content)
    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    tools.processDocCode(div)
    tools.makeImgVisible(div)

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

    post.content = $('<div>')
      .append(doc.clone())
      .html()
    console.log('post', post)
  }

  editImg(img, source) {
    img.attr('size', source.size)
  }

  addPromotion(post) {
    var sharcode = `<blockquote><p>本文使用 <a href="https://www.bilibili.com/read/cv10352009" class="internal">文章同步助手</a> 同步</p></blockquote>`
    post.content = post.content.trim() + `${sharcode}`
  }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
