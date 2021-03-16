export default class YiDianAdapter {
  constructor() {
    this.skipReadImage = true
  }

  async getMetaData() {
    var res = await $.ajax({ url: 'https://mp.yidianzixun.com' })
    var innerDoc = $(res)
    var doc = $('<div>').append(innerDoc.clone())
    var code = doc.find('#__val_').text()
    console.log('YiDian', code)
    // code = code.substring(code.indexOf("window.mpuser"));
    // eval(code);
    var mpuser = new Function(code + '; return window.mpuser;')()
    var commonData = Object.assign({}, mpuser)
    console.log(commonData)
    if (!commonData.id) {
      throw new Error('未登录')
    }
    var metadata = {
      uid: commonData.id,
      title: commonData.media_name,
      commonData: commonData,
      avatar: commonData.media_pic,
      type: 'yidian',
      supportTypes: ['html'],
      home: 'https://mp.yidianzixun.com',
      icon: 'https://www.yidianzixun.com/favicon.ico',
    }
    return metadata
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var res = await $.ajax({
      url: 'https://mp.yidianzixun.com/model/Article',
      type: 'POST',
      dataType: 'JSON',
      data: {
        title: post.post_title,
        cate: '',
        cateB: '',
        coverType: 'default',
        covers: [],
        content: post.post_content,
        hasSubTitle: 0,
        subTitle: '',
        original: 0,
        reward: 0,
        videos: [],
        audios: [],
        votes: {
          vote_id: '',
          vote_options: [],
          vote_end_time: '',
          vote_title: '',
          vote_type: 1,
          isAdded: false,
        },
        images: [],
        goods: [],
        is_mobile: 0,
        status: 0,
        import_url: '',
        import_hash: '',
        image_urls: {},
        minTimingHour: 3,
        maxTimingDay: 7,
        tags: [],
        isPubed: false,
        lastSaveTime: '',
        dirty: false,
        editorType: 'articleEditor',
        activity_id: 0,
        join_activity: 0,
        notSaveToStore: true,
      },
    })

    if (!res.id) {
      throw new Error('同步错误' + JSON.stringify(res))
    }
    return {
      status: 'success',
      post_id: res.id,
      draftLink: 'https://mp.yidianzixun.com/#/Writing/' + res.id,
    }
  }

  async uploadFile(file) {
    var src = file.src
    var res = await $.get(
      'https://mp.yidianzixun.com/api/getImageFromUrl?src=' +
        encodeURIComponent(src)
    )
    // throw new Error('fuck');
    if (res.status != 'success') {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    return [
      {
        id: '',
        object_key: '',
        url: res.inner_addr,
      },
    ]
  }

  async preEditPost(post) {
    // var div = $("<div>");
    // $("body").append(div);
    // div.html(post.content);
    // // var org = $(post.content);
    // // var doc = $('<div>').append(org.clone());
    // var doc = div;
    // var pres = doc.find("a");
    // for (let mindex = 0; mindex < pres.length; mindex++) {
    //   const pre = pres.eq(mindex);
    //   try {
    //     pre.after(pre.html()).remove();
    //   } catch (e) {}
    // }
    // var pres = doc.find("iframe");
    // for (let mindex = 0; mindex < pres.length; mindex++) {
    //   const pre = pres.eq(mindex);
    //   try {
    //     pre.remove();
    //   } catch (e) {}
    // }
    // post.content = $("<div>")
    //   .append(doc.clone())
    //   .html();
    // console.log("post", post);
  }

  //   editImg(img, source) {
  //     img.attr("web_uri", source.images[0].origin_web_uri);
  //   }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
