export default class SegmentfaultAdapter {
  constructor() {
    this.name = 'segmentfault'
    modifyRequestHeaders('gateway.segmentfault.com/', {
    	Origin: 'https://segmentfault.com',
      Referer: 'https://segmentfault.com/'
    }, [
    	'*://gateway.segmentfault.com/*',
    ])
  }

  async getMetaData() {
    var res = await $.get('https://segmentfault.com/user/settings')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var link = htmlDoc.getElementsByClassName('user-avatar')[0]
    if (!link) {
      throw Error('not found')
    }

    var uid = link.href.split('/').pop()
    var avatar = link.style['background-image']
      .replace('url("', '')
      .replace('")', '')
    console.log(
      link.href,
      link.style['background-image'].replace('url("', '').replace('")', '')
    )

    return {
      uid: uid,
      title: uid,
      avatar: avatar,
      type: 'segmentfault',
      displayName: 'Segmentfault',
      supportTypes: ['markdown', 'html'],
      home: 'https://segmentfault.com/user/draft',
      icon:
        'https://imgcache.iyiou.com/Company/2016-05-11/cf-segmentfault.jpg',
    }
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

    const pageHtml = await $.get('https://segmentfault.com/write')
    const markStr = 'window.g_initialProps = '
    const authIndex = pageHtml.indexOf(markStr)
    if(authIndex == -1) {
    	throw new Error('登录失效 authIndex=' + authIndex)
    }

    const authTokenStr = pageHtml.substring(authIndex + markStr.length, pageHtml.indexOf(`;
	</script>`, authIndex))

    const pageConfig = new Function(
      'var config = ' +
        authTokenStr +
        '; return config;'
    )();

    const token = pageConfig.global.sessionInfo.key

    var postStruct = {
      "title":post.post_title,
      "tags":[],
      "text": post.markdown,
      "object_id":"",
      "type":"article"
    }

    var res = await axios.post('https://gateway.segmentfault.com/draft', postStruct, {
    	headers: {
      	token: token,
        accept: '*/*',
    		'content-type': 'application/json',
      }
    })
    post_id = res.data.id
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://segmentfault.com/write?draftId=' + post_id,
    }
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits])
    formdata.append('image', blob)
    var res = await axios({
      url: 'https://segmentfault.com/img/upload/image',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if(res.data[0] == 1) {
      throw new Error(res.data[1])
    }
    var url = res.data[1]
    return [
      {
        id: res.data[2],
        object_key: res.data[2],
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

  async uploadFileByForm($file) {
    var formdata = new FormData()
    formdata.append('image', $file)
    var res = await axios({
      url: 'https://segmentfault.com/img/upload/image',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = 'https://image-static.segmentfault.com/' + res.data[2]
    return url
  }
}
