
function getDocumentByHTML(html, type = 'text/html') {
	const parser = new DOMParser()
	const htmlDoc = parser.parseFromString(html, type)
  return htmlDoc
}

let _cacheMeta = null

export default class OsChinaAdapter {
  constructor() {
    this.name = 'oschina'
    modifyRequestHeaders('my.oschina.net/u', {
    	Origin: 'https://my.oschina.net',
      Referer: 'https://my.oschina.net/'
    }, [
    	'*://my.oschina.net/u/*',
    ])
  }

  async getMetaData() {
    var res = await axios.get('https://www.oschina.net/blog')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res.data, 'text/html')
    var link = htmlDoc.querySelector('.user-info .current-user-avatar')
    if (!link) {
      throw Error('not found')
    }

    var uid = link.getAttribute('data-user-id')
    var avatar = link.querySelector('img').src
    var nickname = link.getAttribute('title')

    const meta = {
      uid: uid,
      title: nickname,
      avatar: avatar,
      type: 'oschina',
      displayName: '开源中国',
      supportTypes: ['markdown', 'html'],
      home: 'https://my.oschina.net/u/4227050/admin/drafts',
      icon:
        'https://www.oschina.net/favicon.ico',
    }

    _cacheMeta = meta
    return meta
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0
    }
  }

  async editPost(post_id, post) {
    if(!post.markdown) {
      var turndownService = new turndown()
      turndownService.use(tools.turndownExt)
      var markdown = turndownService.turndown(post.post_content)
      post.markdown = markdown
      console.log(markdown)
    }

    const meta = _cacheMeta ? _cacheMeta : await this.getMetaData()
    const writePageRes = await axios.get(`https://my.oschina.net/u/${meta.uid}/blog/write`)
    const docPage = getDocumentByHTML(writePageRes.data)
    const userTokenEl = docPage.querySelector('[data-name=g_user_code]')

    if(!userTokenEl) {
    	throw new Error('可能未登录？')
    }

    const userToken = userTokenEl.getAttribute('data-value')
    const postStruct = {
    	draft: 0,
      id: null,
      user_code: userToken,
      title: post.post_title,
      content: post.markdown,
      content_type: 3, // 4=html
      catalog: 6680617,
      groups: 28,
      type: 1,
      origin_url: null,
      privacy: 0,
      deny_comment: 0,
      as_top: 0,
      downloadImg: 1,
      isRecommend: 0,
  	}

    const res = await $.ajax({
    	url: `https://my.oschina.net/u/${meta.uid}/blog/save_draft`,
      type: 'POST',
      dataType: 'JSON',
      data: postStruct,
    })

    if(res.code != 1) {
    	throw new Error(res.message)
    }

    post_id = res.result.draft
    return {
      status: 'success',
      post_id: post_id,
      draftLink: `https://my.oschina.net/u/${meta.uid}/blog/write/draft/${post_id}`,
    }
  }

  async uploadFile(file) {
    const meta = _cacheMeta ? _cacheMeta : await this.getMetaData()
    var formdata = new FormData()
    var blob = new Blob([file.bits])
    formdata.append("editormd-image-file", blob)
    var res = await axios({
      url: `https://my.oschina.net/u/${meta.uid}/space/markdown_img_upload`,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = res.data.url
    return [
      {

        url: url,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      // post.content = post.content.replace(/\>\s+\</g,'');
      console.log('zihu.Juejin')
      div.html(post.content)
      // var org = $(post.content);
      // var doc = $('<div>').append(org.clone());
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
}
