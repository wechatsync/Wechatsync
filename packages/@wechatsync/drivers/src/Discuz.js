// https://www.51hanghai.com/portal.php?mod=portalcp&ac=article
var _cacheMeta = null;

export default class DiscuzAdapter {
  constructor(config) {
    this.config = config || {}
    var url = this.config.url
    this.pubUrl = `${url}/portal.php?mod=portalcp&ac=article`
    // this.upUrl = `${url}/misc.php?mod=swfupload&action=swfupload&operation=portal`
    this.upUrl = `${url}/misc.php?mod=swfupload&action=swfupload&operation=upload`
    this.name = 'discuz'

    // this.skipReadImage = true
  }

  async getMetaData() {
    var url = this.config.url;
    console.log('disduz', this.config)
    var postUrl = `${url}/portal.php?mod=portalcp&ac=article`
    var favIcon = `${url}/favicon.ico`
    var res = await $.get(postUrl)
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var nickname = htmlDoc.querySelector('.vwmy').innerText
    var img = htmlDoc.querySelector('.avt img').src

    _cacheMeta = {
      uid: img.split('uid=')[1].split('&size')[0],
      title: nickname,
      avatar: img,
      type: 'discuz',
      displayName: 'Discuz',
      supportTypes: ['html'],
      config: this.config,
      home: postUrl,
      icon: favIcon,
    }

    var uploadSrciptBlocks = [].slice.apply(htmlDoc.querySelectorAll('script')).filter(_ => _.innerText.indexOf('SWFUpload') > -1);
    if(uploadSrciptBlocks.length) {
      var scripText = uploadSrciptBlocks[0].innerText
      var startTag = 'post_params:'
      var strIndex =  scripText.indexOf(startTag)
      var dataStr = scripText.substring(strIndex + startTag.length, scripText.indexOf('},', strIndex) + 1);
      var post_params = new Function(
        'var config = ' +
        dataStr +
          '; return config;'
      )();
      _cacheMeta.uploadToken = post_params.hash
      _cacheMeta.raw = post_params
    }
    // var parser = new DOMParser()
    // var htmlDoc = parser.parseFromString(res, 'text/html')
    // var img = htmlDoc.querySelector('li.more.user > a > img')
    return _cacheMeta
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
        catid: 24,
        content: post.markdown,
        romotepic: 1,
      }
    } else {
      postStruct = {
        title: post.post_title,
        catid: 24,
        romotepic: 1,
        content: post.post_content,
      }
    }

    // title: test
    // highlight_style[0]:
    // highlight_style[1]:
    // highlight_style[2]:
    // highlight_style[3]:
    // htmlname:
    // oldhtmlname:
    // pagetitle:
    // catid: 24
    // from:
    postStruct.fromurl = null
    postStruct.dateline = null
    postStruct.from_idtyp = `tid`
    postStruct.from_id = 0
    postStruct.id = 0
    postStruct.idtype = `tid`;
    postStruct.url = null;
    postStruct.author = null;
    // conver: a:3:{s:3:"pic";s:0:"";s:5:"thumb";i:0;s:6:"remote";i:0;}
    // file: (binary)
    // file: (binary)
    // content: test
    // romotepic: 1
    // summary:
    // aid:
    // cid:
    // attach_ids:
    // articlesubmit: true
    postStruct.articlesubmit = true;
    postStruct.formhash = `caa4c6cb`
    postStruct.conver = `a:3:{s:3:"pic";s:0:"";s:5:"thumb";i:0;s:6:"remote";i:0;}`;
    // var res = await $.ajax({
    //   url: this.pubUrl,
    //   type: 'POST',
    //   dataType: 'JSON',
    //   data: postStruct,
    // })
    // if (!res.data) {
    //   throw new Error(res.message)
    // }
    setCache('discuz_cache', JSON.stringify(postStruct))

    return {
      status: 'success',
      post_id: 0,
      draftLink: `${this.config.url}/forum.php?mod=guide&view=my&loaddraft`,
    }
  }

  async uploadFile(file) {
    var id = Date.now() + Math.floor(Math.random()* 1000);
    return [
      {
        id: id,
        object_key: id,
        url: file.src,
      },
    ]
    var src = file.src
    // var file = new File([file.bits], 'temp', {
    //   type: file.type,
    // })
    var blob = new Blob([file.bits], {
      type: file.type,
    })
    var formdata = new FormData()

    formdata.append('uid', _cacheMeta.uid)
    formdata.append('hash', _cacheMeta.uploadToken)
    formdata.append('filetype', '.jpg')
    formdata.append('type', 'image')
    formdata.append('aid', '0')
    // formdata.append('catid', '19')
    // formdata.append('Filedata', blob)
    formdata.append('Filedata', blob, new Date().getTime() + '.jpg')
    formdata.append('size', blob.size)
    formdata.append('id', 'WU_FILE_1')
    var res = await axios({
      url: this.upUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    var imageHtmlRes = await axios.get(`${this.config.url}/forum.php?mod=ajax&action=imagelist&type=single&pid=0&aids=` + res.data)
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(imageHtmlRes.data, 'text/html')
    var imgSrc = `${this.config.url}/` + htmlDoc.querySelector("img").getAttribute('src')
    console.log('upload.res', imageHtmlRes)
    var imageId = Date.now() +Math.floor( Math.random() * 10);
    // if (res.data.aid === false) {
    //   throw new Error('图片上传失败 ' + src)
    // }
    // http only
    console.log('uploadFile', res)
    return [
       {
        id: imageId,
        object_key: imageId,
        url: imgSrc
      },
      // {
      //   id: res.data.aid,
      //   object_key: res.data.aid,
      //   url: res.data.bigimg,
      //   // size: res.data.data.size,
      //   // images: [res.data],
      // },
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
    img.removeAttr('crossorigin')
    img.attr('referrerpolicy', "no-referrer")
  }
}
