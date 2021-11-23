
export default class ToutiaoAdapter {
  constructor() {
    // this.skipReadImage = true
    this.name = 'toutiao'
  }

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
      // url:'https://mp.toutiao.com/core/article/edit_article_post/?source=mp&type=article',
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

  async uploadFileBySrc(file) {
    var src = file.src
    var res = await $.ajax({
      url: 'https://mp.toutiao.com/tools/catch_picture/',
      type: 'POST',
      headers: {
        accept: '*/*',
      },
      data: {
        upfile: src,
        version: 2,
      },
    })

    // throw new Error('fuck');
    if (res.images && !res.images.length) {
      throw new Error('图片上传失败 ' + src)
    }

    // http only
    console.log('uploadFile', res)
    return [res]
  }

  async uploadFile(file) {
    var src = file.src
    var uploadUrl = 'https://mp.toutiao.com/mp/agw/article_material/photo/upload_picture?type=ueditor&pgc_watermark=1&action=uploadimage&encode=utf-8'
    // var blob = new Blob([file.bits], {
    //   type: file.type
    // });
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

  editImg(img, source) {
    img.attr('web_uri', source.images[0].origin_web_uri)
  }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
