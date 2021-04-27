var metaCache = null


const ImageRegexp = /^!\[([^\]]*)]\s*\(([^)"]+)( "([^)"]+)")?\)/
const imageBlock = (remarkable) => {
  remarkable.block.ruler.before('paragraph', 'image', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    if (pos >= max) {
      return false
    }
    if (!state.src) {
      return false
    }
    if (state.src[pos] !== '!') {
      return false
    }

    var match = ImageRegexp.exec(state.src.slice(pos))
    if (!match) {
      return false
    }

    // in silent mode it shouldn't output any tokens or modify pending
    if (!silent) {
      state.tokens.push({
        type: 'image_open',
        src: match[2],
        alt: match[1],
        lines: [ startLine, state.line ],
        level: state.level
      })

      state.tokens.push({
        type: 'image_close',
        level: state.level
      })
    }

    state.line = startLine + 1

    return true
  })
}



function getFormData(obj) {
    var map = {};
    obj.find('input').each(function() {
        map[$(this).attr("name")] = $(this).val();
    });
    return map
}


export default class DoubanAdapter {
  constructor(config) {
    this.config = config
    this.meta = metaCache
    this.name = 'douban'

    modifyRequestHeaders('www.douban.com/', {
    	Origin: 'https://www.douban.com',
      Referer: 'https://www.douban.com'
    }, [
    	'*://www.douban.com/*',
    ])
  }

  async getMetaData() {
    var res = await $.ajax({ url: 'https://www.douban.com/note/create' })
    var innerDoc = $(res)
    var doc = $('<div>').append(innerDoc.clone())
    var configScript = innerDoc.filter(function(index, el){ return $(el).text().indexOf('_POST_PARAMS') > -1 });
    if(configScript.length == 0) {
        throw new Error('未登录')
    }
    var code = configScript.text()
    var wx = new Function(
        'Do ={}; Do.add = function() {} '+ code +
        '; return {_USER_AVATAR: _USER_AVATAR, _USER_NAME: _USER_NAME, _NOTE_ID: _NOTE_ID, _TAGS: _TAGS, _POST_PARAMS: _POST_PARAMS};'
    )();
    console.log(code, wx)

    var metadata = {
      uid: wx._USER_NAME,
      title: wx._USER_NAME,
      commonData: wx,
      avatar: wx._USER_AVATAR,
      type: 'douban',
      supportTypes: ['html'],
      home: 'https://www.douban.com/note/create',
      icon: 'https://img3.doubanio.com/favicon.ico',
      form: getFormData(doc.find('#note-editor-form')),
      _POST_PARAMS: wx._POST_PARAMS
    }
    metaCache = metadata
    this.meta = metaCache
    console.log('metaCache', metaCache)
    return metadata
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var turndownService = new turndown()
    turndownService.use(tools.turndownExt)
    var markdown = turndownService.turndown(post.post_content)
    console
      .log(markdown)

    // 保证图片换行
    markdown = markdown.split("\n").map(_ => {
      const imageBlocks = _.split('![]');
      return imageBlocks.length > 1 ? imageBlocks.join('\n![]') : _
    }).join("\n");

    const draftjsState = JSON.stringify(tools.markdownToDraft(markdown, {
      remarkablePlugins: [imageBlock],
      blockTypes: {
        image_open: function(item, generateUniqueKey) {
          console.log('image_open', 'blockTypes', item)
          var key = generateUniqueKey()
          var blockEntities = {}
          // ?#
          var sourcePair =  item.src.split("?#")
          var rawSrc = sourcePair[0]
          var sourceId = sourcePair[1]
          if(sourcePair.length) {
            item.src = rawSrc
          }
          var imageTemplate = {
            id: sourceId,
            src:  item.src,
            thumb: item.src,
            url: item.src,
          }

          blockEntities[key] = {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: imageTemplate,
          }
          return {
            type: 'atomic',
            blockEntities: blockEntities,
            inlineStyleRanges: [],
            // "data": {
            //     "page": 0
            // },
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: key,
              },
            ],
            text: ' ',
          }
        }
      },
      blockEntities: {
        image: function (item) {
          var sourcePair =  item.src.split("?#")
          if(sourcePair.length) {
            var rawSrc = sourcePair[0]
            var sourceId = sourcePair[1]
            item.id = sourceId
            item.src = rawSrc
          }
          console.log('image_open', 'blockEntities', item)
          return {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: item
          }
        }
      }
    }));
    console.log(draftjsState)

    var state = this.config.state;
    var requestUrl = 'https://www.douban.com/j/note/autosave';
    var draftLink = 'https://www.douban.com/note/create';
    var requestBody = {
      is_rich: 1,
      note_id: this.meta.form.note_id,
      note_title: post.post_title,
      note_text: draftjsState,
      introduction: '',
      note_privacy: 'P',
      cannot_reply: null,
      author_tags: null,
      accept_donation: null,
      donation_notice: null,
      is_original: null,
      ck: this.meta.form.ck
    }

    // https://music.douban.com/subject/24856133/new_review
    // music review
    // https://music.douban.com/j/review/create
    // is_rich: 1
    // topic_id:
    // review[subject_id]: 24856133
    // review[title]: aaa
    // review[introduction]:
    // review[text]: {"entityMap":{},"blocks":[{"key":"9riq1","text":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"page":0}}]}
    // review[rating]:
    // review[spoiler]:
    // review[donate]:
    // review[original]:
    // ck: O4jk
    if(state && state.is_review) {
      if(state.subject == 'music') {
        draftLink = state.url;
        requestUrl = 'https://music.douban.com/j/review/create'
        requestBody = {
          is_rich: 1,
          topic_id: '',
          review: {
            subject_id: state.id,
            title:  post.post_title,
            introduction: '',
            text: draftjsState,
            rating: '',
            spoiler: '',
            donate: '',
            original: ''
          },
          ck: this.meta.form.ck
        }
      }
    }
    console.log('state', requestBody)
    var res = await $.ajax({
      url: requestUrl,
      type: 'POST',
      dataType: 'JSON',
      data: requestBody,
    })

    if(res.url) {
      draftLink = `https://www.douban.com/note/${requestBody.note_id}/`
    }

    return {
      status: 'success',
      post_id: this.meta.form.note_id,
      draftLink: draftLink,
    }
  }

  editImg(img, source) {
    img.attr('raw-data', JSON.stringify(source.raw))
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

  addPromotion(post) {
    var sharcode = `<blockquote><p>本文使用 <a href="https://zhuanlan.zhihu.com/p/358098152" class="internal">文章同步助手</a> 同步</p></blockquote>`
    post.content = post.content.trim() + `${sharcode}`
  }

  async uploadFile(file) {

    // https://music.douban.com/j/review/upload_image
    var requestUrl = 'https://www.douban.com/j/note/add_photo';
    var state = this.config.state;
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
      type: file.type
    });

    if(state && state.is_review) {
      if(state.subject == 'music') {
        requestUrl =  'https://music.douban.com/j/review/upload_image';
        formdata.append('review_id', '')
        formdata.append('picfile', blob)
      }
    } else {
      formdata.append('note_id', this.meta.form.note_id)
      formdata.append('image_file', blob)
    }

    formdata.append('ck', this.meta.form.ck)
    formdata.append('upload_auth_token', this.meta._POST_PARAMS.siteCookie.value)

    var res = await axios({
      url: requestUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    var url = res.data.photo.url
    if(!res.data.photo) {
        console.log(res.data);
        throw new Error('upload failed')
    }
    //  return url;
    return [
      {
        id: res.data.photo.id,
        object_key: res.data.photo.id,
        url: url + "?#" + res.data.photo.id,
        raw: res.data
      },
    ]
  }
}
