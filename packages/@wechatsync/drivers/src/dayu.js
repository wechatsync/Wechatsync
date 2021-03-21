var _cacheMeta = null

export default class DaYuAdapter {
  constructor() {
    // this.skipReadImage = true
    this.version = '0.0.1'
    this.name = 'dayu'
    this.images = []
    modifyRequestHeaders(
      'mp.dayu.com/',
      {
        Origin: 'https://mp.dayu.com',
        Referer: 'https://mp.dayu.com/',
      },
      ['*://mp.dayu.com/dashboard/*']
    )
    // https://mp.dayu.com
  }

  async getMetaData() {
    const res = await axios.get('https://mp.dayu.com/dashboard/index')
    var pageHtml = res.data
    var markStr = 'var globalConfig = '
    var authIndex = pageHtml.indexOf(markStr)
    if (authIndex == -1) {
      throw new Error('登录失效 authIndex=' + authIndex)
    }

    var authTokenStr = pageHtml.substring(
      authIndex + markStr.length,
      pageHtml.indexOf(`var G = {`, authIndex)
    )

    var pageConfig = new Function(
      'var config = ' + authTokenStr + '; return config;'
    )()

    _cacheMeta = {
      utoken: pageConfig.utoken,
      uploadSign: pageConfig.nsImageUploadSign,
      uid: pageConfig.wmid,
      title: pageConfig.weMediaName,
      avatar:
        pageConfig.wmAvator.indexOf('http') > -1
          ? pageConfig.wmAvator
          : pageConfig.wmAvator.replace('//', 'https://'),
      supportTypes: ['html'],
      type: 'dayu',
      displayName: '大鱼号',
      home: 'https://mp.dayu.com/dashboard/account/profile',
      icon: 'https://image.uc.cn/s/uae/g/1v/images/index/favicon.ico',
    }

    return _cacheMeta
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    _cacheMeta = _cacheMeta ? _cacheMeta : await this.getMetaData()
    console.log('editPost', post)
    var res = await $.ajax({
      url: 'https://mp.dayu.com/dashboard/save-draft',
      type: 'POST',
      headers: {
        utoken: _cacheMeta.utoken,
      },
      data: {
        title: post.post_title,
        content: post.post_content,
        author: _cacheMeta.title,
        coverImg: this.images[0].org_url,
        article_type: 1,
        utoken: _cacheMeta.utoken,
        cover_from: 'auto',
      },
    })

    if (res.error) {
      throw new Error(res.error)
    }

    post_id = res.data._id
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
      draftLink:
        'https://mp.dayu.com/dashboard/article/write?draft_id=' + post_id,
    }
  }

  async uploadFile(file) {
    _cacheMeta = _cacheMeta ? _cacheMeta : await this.getMetaData()
    var uploadUrl =
      'https://ns.dayu.com/article/imageUpload?appid=website&fromMaterial=0&wmid=' +
      _cacheMeta.uid +
      '&wmname=' +
      encodeURIComponent(_cacheMeta.title) +
      '&sign=' +
      _cacheMeta.uploadSign
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()
    formdata.append('upfile', file, new Date().getTime() + '.jpg')
    formdata.append('type', file.type)
    formdata.append('id', 'WU_FILE_1')
    formdata.append('fileid', `uploadm-` + Math.floor(Math.random() * 1000000))
    formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', file.size)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    var image = {
      org_url: res.data.data.imgInfo.org_url,
      url: res.data.data.imgInfo.url,
    }

    this.images.push(image)

    return [image]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    // post.content = post.content.replace(/\>\s+\</g,'');
    div.html(post.content)

    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('pre')
    console.log('find code blocks', pres.length, post)
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        var newHtml = CodeBlockToPlainText(pre, 0)
        if (newHtml) {
          console.log(newHtml)
          pre.html(newHtml)
        }
      } catch (e) {}
    }

    var processEmptyLine = function(idx, el) {
      var $obj = $(this)
      var originalText = $obj.text()
      var img = $obj.find('img')
      var brs = $obj.find('br')
      if (originalText == '') {
        ;(function() {
          if (img.length) return
          if (!brs.length) return
          $obj.remove()
        })()
      }

      // try to replace as h2;
      var strongTag = $obj.find('strong').eq(0)
      var childStrongText = strongTag.text()
      if (originalText == childStrongText) {
        var strongSize = null
        var tagStart = strongTag
        var align = null
        for (let index = 0; index < 4; index++) {
          var fontSize = tagStart.css('font-size')
          var textAlign = tagStart.css('text-align')
          if (fontSize) {
            strongSize = fontSize
          }
          if (textAlign) {
            align = textAlign
          }
          if (align && strongSize) break
          if (tagStart == $obj) {
            console.log('near top')
            break
          }
          tagStart = tagStart.parent()
        }
        if (strongSize) {
          var theFontSize = parseInt(strongSize)
          if (theFontSize > 17 && align == 'center') {
            var newTag = $('<h2></h2>').append($obj.html())
            $obj.after(newTag).remove()
          }
        }
      }
    }

    // remove empty break line
    doc.find('p').each(processEmptyLine)
    doc.find('section').each(processEmptyLine)

    // for break line
    doc.find('section').replaceWith(function() {
      return $('<p />').append($(this).contents())
    })

    var processBr = function(idx, el) {
      var $obj = $(this)
      if (!$obj.next().length) {
        $obj.remove()
      }
    }
    doc.find('br').each(processBr)
    // table {
    //     margin-bottom: 10px;
    //     border-collapse: collapse;
    //     display: table;
    //     width: 100%!important;
    // }
    // td, th {
    //     word-wrap: break-word;
    //     word-break: break-all;
    //     padding: 5px 10px;
    //     border: 1px solid #DDD;
    // }

    // console.log('found table', doc.find('table'))
    var tempDoc = $('<div>').append(doc.clone())
    post.content =
      tempDoc.children('div').length == 1
        ? tempDoc.children('div').html()
        : tempDoc.html()
    // div.remove();
  }
}
