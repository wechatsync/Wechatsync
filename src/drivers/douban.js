var metaCache = null

import TurndownService from 'turndown'
// import { markdownToDraft } from 'markdown-draft-js';
import markdownToDraft from './tools/mtd'
// const axios = require('axios');
const convertToRaw = require('draft-js').convertToRaw
const htmlToDraft = require('html-to-draftjs').default
const ContentState = require( 'draft-js').ContentState


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


function covertHTMLToDraftJs(html) {
    const blocksFromHtml = htmlToDraft(html)
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const contentStateString = JSON.stringify(convertToRaw(contentState))
    console.log('contentStateString', contentStateString)
    return contentStateString
}

function getFormData(obj) {
    var map = {};
    obj.find('input').each(function() {
        map[$(this).attr("name")] = $(this).val();
    });
    return map
}


export default class Douban {
  constructor() {
    this.meta = metaCache
    this.name = 'douban'
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
    // console.log('editPost', post.post_thumbnail)
    var turndownService = new TurndownService()

    var markdown = turndownService.turndown(post.post_content)
    console
      .log(markdown)

    // 保证图片换行
    markdown = markdown.split("\n").map(_ => {
      const imageBlocks = _.split('![]');
      return imageBlocks.length > 1 ? imageBlocks.join('\n![]') : _
    }).join("\n");

    const draftjsState = JSON.stringify(markdownToDraft(markdown, {
      remarkablePlugins: [imageBlock],
      blockTypes: {
        image_open: function(item, generateUniqueKey) {
          console.log('image_open', 'blockTypes', item)
          var key = generateUniqueKey()
          var blockEntities = {}
          blockEntities[key] = {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: {
              caption: '',
              src: item.src,
              thumb: item.src,
              url: item.url
            },
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
    // const draftjsState = covertHTMLToDraftJs(post.post_content)
    var res = await $.ajax({
      url:
        'https://www.douban.com/j/note/autosave',
      type: 'POST',
      dataType: 'JSON',
      data: {
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
      },
    })

    return {
      status: 'success',
      post_id: this.meta.form.note_id,
      draftLink: 'https://www.douban.com/note/create',
    }
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
        type: file.type
    });
    formdata.append('ck', this.meta.form.ck)
    formdata.append('note_id', this.meta.form.note_id)
    formdata.append('upload_auth_token', this.meta._POST_PARAMS.siteCookie.value)
    formdata.append('image_file', blob)
    var res = await axios({
      url: 'https://www.douban.com/j/note/add_photo',
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
        url: url,
      },
    ]
  }

}
