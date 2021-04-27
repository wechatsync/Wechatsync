var _cacheMeta = null

export default class _51CtoAdapter {
  constructor(config) {
    // this.skipReadImage = true
    this.config = config
    this.name = '51cto'
  }

  async getMetaData() {
    var res = await $.get('https://blog.51cto.com/blogger/publish')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var img = htmlDoc.querySelector('li.more.user > a > img')
    var link = img.parentNode.href
    var pie = link.split('/')
    // pie.pop()
    var uid = pie.pop()
    console.log(link)
    var scrs = [].slice
      .call(htmlDoc.querySelectorAll('script'))
      .filter(_ => _.innerText.indexOf('sign') > -1)

    var uploadSign = null;
    if (scrs.length) {
      try {
        var dataStr = scrs[0].innerText
        var rawStr = dataStr.substring(
          dataStr.indexOf('sign'),
          dataStr.indexOf('uploadUrl', dataStr.indexOf('sign'))
        )
        var signStr = rawStr
          .replace('var', '')
          .trim()
          .replace("sign = '", '')
          .replace("';", '')
          .trim()
          uploadSign = signStr
      } catch (e) {
        console.log('51cto', e)
      }
    }
      _cacheMeta = {
        rawStr: rawStr,
        uploadSign: uploadSign,
        csrf: htmlDoc
          .querySelector('meta[name=csrf-token]')
          .getAttribute('content'),
      }
    console.log('51cto', _cacheMeta)
    return {
      uid: uid,
      title: uid,
      avatar: img.src,
      type: '51cto',
      displayName: '51CTO',
      supportTypes: ['markdown', 'html'],
      home: 'https://blog.51cto.com/blogger/publish',
      icon: 'https://blog.51cto.com/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var postStruct = {}

    if (post.markdown) {
      postStruct = {
        title: post.post_title,
        copy_code: 1,
        is_old: 0,
        content: post.markdown,
        _csrf: _cacheMeta.csrf,
      }
    } else {
      postStruct = {
        blog_type: null,
        title: post.post_title,
        copy_code: 1,
        content: post.post_content,
        pid: '',
        cate_id: '',
        custom_id: '',
        tag: '',
        abstract:'',
        is_hide: 0,
        did: '',
        blog_id: '',
        is_old: 1,
        _csrf: _cacheMeta.csrf,
        // editorValue: null,
      }
    }

    var res = await $.ajax({
      url: 'https://blog.51cto.com/blogger/draft',
      type: 'POST',
      dataType: 'JSON',
      data: postStruct,
    })

    if (!res.data) {
      throw new Error(res.message)
    }

    return {
      status: 'success',
      post_id: res.data.did,
      draftLink: 'https://blog.51cto.com/blogger/draft/' + res.data.did,
    }
  }

  async uploadFile(file) {
    var src = file.src
    // var csrf = this.config.state.csrf
    var uploadUrl = 'https://upload.51cto.com/index.php?c=upload&m=upimg&orig=b'
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()

    formdata.append('sign', _cacheMeta.uploadSign)
    // formdata.append('file', file)
    formdata.append('file', file, new Date().getTime() + '.jpg')
    formdata.append('type', file.type)
    formdata.append('id', 'WU_FILE_1')
    formdata.append('fileid', `uploadm-` + Math.floor(Math.random() * 1000000))
    // formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', file.size)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.status === false) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    var id = Math.floor(Math.random() * 100000)
    return [
      {
        id: id,
        object_key: id,
        url: `https://s4.51cto.com/` + res.data.data,
        // size: res.data.data.size,
        // images: [res.data],
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      div.html(post.content)
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

  // editImg(img, source) {
  //   img.attr('size', source.size)
  // }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
