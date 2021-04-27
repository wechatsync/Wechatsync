var NoteVersionCaches = {}
var defaultNoteBookId

export default class JianShuAdapter {
  constructor() {
    this.name = 'jianshu'
    // chrome.cookies.getAll({ domain: "zhihu.com"},  function(cookies){
    //     console.log(cookies)
    // })
  }

  async getMetaData() {
    var res = await $.ajax({
      url: 'https://www.jianshu.com/settings/basic.json',
    })
    var notebooks = await $.get('https://www.jianshu.com/author/notebooks')
    // console.log(res);
    // https://upload.jianshu.io/users/upload_avatars/12192974/d02c5033-7f82-458f-9b3e-f4c4dbaa1221?imageMogr2/auto-orient/strip|imageView2/1/w/96/h/96
    return {
      uid: res.data.avatar.split('/')[5],
      title: res.data.nickname,
      avatar: res.data.avatar,
      type: 'jianshu',
      displayName: '简书',
      supportTypes: ['html'],
      home: 'https://www.jianshu.com/settings/basic',
      icon: 'https://www.jianshu.com/favicon.ico',
      notebooks: notebooks,
    }
  }

  async addPost(post) {
    var notebooks = await $.get('https://www.jianshu.com/author/notebooks')
    var firstNoteBook = notebooks[0]
    defaultNoteBookId = firstNoteBook.id
    var res = await $.ajax({
      url: 'https://www.jianshu.com/author/notes',
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      contentType: 'application/json',
      data: JSON.stringify({
        at_bottom: false,
        notebook_id: firstNoteBook.id,
        title: post.post_title,
      }),
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.id,
      notebook_id: firstNoteBook.id,
    }
  }

  async editPost(post_id, post) {
    var cacheVerions = NoteVersionCaches[post_id]
    var notebook_id = post.notebook_id ? post.notebook_id : defaultNoteBookId

    if (!cacheVerions) {
      var bookNotes = await $.get(
        'https://www.jianshu.com/author/notebooks/' + notebook_id + '/notes'
      )
      var currentNote = bookNotes.filter((t) => {
        return t.id == post_id
      })[0]

      console.log(post_id, bookNotes)
      NoteVersionCaches[post_id] = currentNote.autosave_control
      NoteVersionCaches[post_id]++
      cacheVerions = NoteVersionCaches[post_id]
    } else {
      NoteVersionCaches[post_id]++
      cacheVerions = NoteVersionCaches[post_id]
    }

    console.log('currentNote', cacheVerions)
    var requestData = {
      autosave_control: cacheVerions,
    }

    if (post.post_content) {
      requestData.content = post.post_content
    }

    if (post_id) {
      requestData.id = post_id
    }

    if (post.post_title) {
      requestData.title = post.post_title
    }

    // https://www.jianshu.com/author/notebooks/108908/notes
    var res = await $.ajax({
      url: 'https://www.jianshu.com/author/notes/' + post_id,
      type: 'PUT',
      dataType: 'JSON',
      contentType: 'application/json',
      headers: {
        accept: 'application/json',
      },
      data: JSON.stringify(requestData),
    })

    return {
      status: 'success',
      notebook_id: notebook_id,
      post_id: post_id,
      draftLink:
        'https://www.jianshu.com/writer#/notebooks/' +
        notebook_id +
        '/notes/' +
        post_id,
    }
  }

  async uploadFile(file) {
    const tokenReq = await axios.get('https://www.jianshu.com/upload_images/token.json?filename='+ new Date().getTime() +'.png')
    if(tokenReq.data.token) {
      var blob = new Blob([file.bits], {
        type: file.type
      });
      var formdata = new FormData()
      formdata.append('token', tokenReq.data.token)
      formdata.append('key', tokenReq.data.key)
      formdata.append('x:protocol', 'https')
      formdata.append('file', blob, new Date().getTime() + '.jpg')
      var res = await axios({
        url: 'https://upload.qiniup.com/',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if(!res.data.url) {
        console.log(res.data);
        throw new Error('upload failed')
      }
      var url = res.data.url
      return [
        {
          id: tokenReq.data.key,
          object_key: tokenReq.data.key,
          url: url
        }
      ]
    }
    throw new Error('upload failed')
  }

  async uploadFileBySrc(file) {
    var src = file.src
    try {
      // jianshu not support webp
      if (src.indexOf('xitu.io') > -1) {
        src = src.replace('webp', 'png')
      }

      var res = await $.ajax({
        url: 'https://www.jianshu.com/upload_images/fetch',
        type: 'POST',
        contentType: 'application/json',
        xhrFields: {
          withCredentials: true,
        },
        headers: {
          accept: 'application/json',
        },
        data: JSON.stringify({
          url: src,
        }),
      })

      // http only
      console.log('uploadFile', res)
      return [res]
    } catch (e) {
      console.log('JianShuDriver.uploadFile', e)
      var error = e.responseJSON.error[0].message
      throw new Error(error)
    }
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    div.html(post.content)
    var doc = div
    var processEmptyLine = function (idx, el) {
      var $obj = $(this)
      var originalText = $obj.text()
      var img = $obj.find('img')
      var brs = $obj.find('br')
      if (originalText == '') {
        ;(function () {
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

    var processBr = function (idx, el) {
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

  addPromotion(post) {
    var sharcode = `<blockquote><p>本文使用 <a href="https://www.jianshu.com/p/5709df6fb58d" class="internal">文章同步助手</a> 同步</p></blockquote>`
    post.content = post.content.trim() + `${sharcode}`
  }
}
