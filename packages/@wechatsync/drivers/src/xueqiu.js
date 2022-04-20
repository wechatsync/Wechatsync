
export default class XueQiuAdapter {
  constructor() {
    this.name = 'xueqiu'
    modifyRequestHeaders('mp.xueqiu.com/xq/statuses', {
      Origin: 'https://mp.xueqiu.com',
      Referer: 'https://mp.xueqiu.com'
    }, [
      '*://mp.xueqiu.com/xq/*',
    ], function (details) {
    })
  }

  async getMetaData() {
    const res = await axios.get('https://mp.xueqiu.com/write/')
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(res.data, 'text/html')
    const link = htmlDoc.querySelector('#currentUser')
    if (!link) {
      throw Error('not found')
    }
    const state = new Function("return " + link.innerHTML.replace('window.UOM_CURRENTUSER = ', ''))()
    const { currentUser } = state
    if (currentUser.id == "")  throw Error('not found')
    return {
      uid: currentUser.id,
      title: currentUser.screen_name,
      avatar:
        `https:${currentUser.photo_domain}` +
        currentUser.profile_image_url.split(',')[0],
      supportTypes: ['html'],
      type: 'xueqiu',
      displayName: '雪球',
      home: 'https://mp.xueqiu.com/write',
      icon: 'https://xqdoc.imedao.com/17aebcfb84a145d33fc18679.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    const content = `${post.post_content}`
    try {
      var res = await $.ajax({
        url: 'https://mp.xueqiu.com/xq/statuses/draft/save.json',
        type: 'POST',
        dataType: 'JSON',
        data: {
          text: post.post_content,
          title: post.post_title,
          cover_pic: null,
          flags: false,
          original_event: null,
          status_id: null,
          legal_user_visible: false,
          is_private: false,
        },
      })

      const post_id = res.id
      return {
        status: 'success',
        post_id: post_id,
        draftLink: `https://mp.xueqiu.com/write/draft/${post_id}`
      }
    } catch (e) {
      throw new Error(e.toString())
    }
  }

  async uploadFile(file) {
    const { src, post_id } = file
    var uploadUrl = "https://mp.xueqiu.com/xq/photo/upload.json"
    var file = new File([file.bits], 'temp.jpg', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('file', file)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (!res.data.url) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    const url = `https:${res.data.url}/${res.data.filename}`;
    return [{
      id: res.data.filename,
      object_key: res.data.filename,
      url: url,
      images: [
        res.data
      ]
    }]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    div.html(post.content)
    var doc = div

    tools.doPreFilter(div)
    tools.processDocCode(div)

    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) { }
    }

    var pres = doc.find('iframe')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.remove()
      } catch (e) { }
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
    } catch (e) { }

    post.content = $('<div>').append(doc.clone()).html()
    console.log('post', post)
  }
}
