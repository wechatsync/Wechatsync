var _souhuCacheMeta = null

export default class SoHuAdapter {
  constructor() {
    this.version = '0.0.1'
    this.name = 'sohu'

    // modify origin headers
    modifyRequestHeaders('mp.sohu.com/mpbp', {
        Origin: 'https://mp.sohu.com',
        Referer: 'https://mp.sohu.com/'
    }, [
    	'*://mp.sohu.com/mpbp/*',
    ])
  }

  async getMetaData() {
    const { data } = await axios.get('https://mp.sohu.com/mpbp/bp/account/register-info?_=' + Date.now())
    console.log(data)
    if(data.code != 2000000) {
    	throw new Error('not found')
    }
    const accountInfo = data.data.account
    _souhuCacheMeta = accountInfo
    return {
      uid: accountInfo.id,
      title: accountInfo.nickName,
      avatar: accountInfo.avatar,
      type: 'sohu',
      displayName: '搜狐号',
      supportTypes: ['html'],
      home: 'https://mp.sohu.com/mpfe/v3/main/first/page?newsType=1',
      icon: 'https://mp.sohu.com/favicon.ico',
    }
  }

  async addPost(post, _instance) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {

    var postStruct = {
        title: post.post_title,
        brief: '',
        content: post.post_content,
        channelId: 39,
        categoryId: -1,
        id: 0,
        userColumnId: 0,
        businessCode: 0,
        isOriginal: false,
        cover: '',
        attrIds: '',
        topicIds: '',
        isAd: 0,
        reprint: false,
        accountId: _souhuCacheMeta.id
    }

    var res = await $.ajax({
      url: 'https://mp.sohu.com/mpbp/bp/news/v4/news/draft?accountId='+ _souhuCacheMeta.id,
      type: 'POST',
      dataType: 'JSON',
      data: postStruct,
    })

    if(!res.success) throw new Error(res.msg)
    var post_id = res.data
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://mp.sohu.com/mpfe/v3/main/news/addarticle?spm=smmp.articlelist.0.0&contentStatus=2&id=' + post_id,
    }
  }

  async uploadFile(file) {
    var uploadUrl = 'https://mp.sohu.com/commons/front/outerUpload/image/file'
    var file = new File([file.bits], 'temp', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('file', file)
    if (_souhuCacheMeta) {
      formdata.append('accountId', _souhuCacheMeta.id)
    }
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return [
      {
        url: res.data.url,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    try {
      console.log('zihu.Juejin')
      div.html(post.content)
      var doc = div
      processDocCode(div)
      makeImgVisible(div)

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
