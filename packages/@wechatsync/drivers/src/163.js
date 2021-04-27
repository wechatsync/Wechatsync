
class Mp163 {
  constructor() {
    this.version = '0.0.1'
        // modify origin headers
    modifyRequestHeaders('mp.sohu.com/mpbp', {
        Origin: 'https://mp.sohu.com',
      Referer: 'https://mp.sohu.com/'
    }, [
        '*://mp.sohu.com/mpbp/*',
    ])
  }

  async getMetaData() {
    const { data } = await axios.get('https://mp.163.com/wemedia/navinfo.do?_=' + Date.now())
    console.log(data)
    if(data.code != 1) {
        throw new Error('not found')
    }
    const accountInfo = data.data
    _souhuCacheMeta = accountInfo
    return {
      uid: accountInfo.wemediaId,
      title: accountInfo.tname,
      avatar: accountInfo.icon,
      type: '163',
      displayName: '网易号',
      supportTypes: ['html'],
      home: 'https://mp.163.com/index.html#/article/manage',
      icon: 'https://mp.163.com/favicon.ico',
    }
  }

  async addPost(post, _instance) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {

    // todo
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://mp.sohu.com/mpfe/v3/main/news/addarticle?spm=smmp.articlelist.0.0&contentStatus=2&id=' + post_id,
    }
  }

  async uploadFile(file) {
    var uploadUrl = 'https://upload.ws.126.net/picupload?_=1615878815133&wemediaId='
    var file = new File([file.bits], 'temp', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('file', file)
    formdata.append('from', 'neteasecode_mp')
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return [
      {
        url: res.data.data.url,
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
}
