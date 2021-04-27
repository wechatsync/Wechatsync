
function getCookie(name, cookieStr) {
  let arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = cookieStr.match(reg))) {
    return unescape(arr[2])
  } else {
    return ''
  }
}

function parseTokenAndToHeaders(details, cookieKey, headerKey) {
  var cookieHeader = details.requestHeaders.filter(h => {
    return h.name.toLowerCase() == 'cookie'
  })
  if (cookieHeader.length) {
    var cookieStr = cookieHeader[0].value
    var _xsrf = getCookie(cookieKey, cookieStr)
    if (_xsrf) {
      details.requestHeaders.push({
        name: headerKey,
        value: _xsrf,
      })
    }
  }
}


export default class CnblogAdapter {
  constructor() {
    this.name = 'cnblog'
    //
    this.skipReadImage = true
    modifyRequestHeaders('i.cnblogs.com/', {
    	Origin: 'https://i.cnblogs.com',
      Referer: 'https://i.cnblogs.com/'
    }, [
    	'*://i.cnblogs.com/*',
    ], function(details) {
			// parse token from cookie inject to headers
      if (details.url.indexOf('i.cnblogs.com/api') > -1) {
        parseTokenAndToHeaders(details, 'XSRF-TOKEN', 'x-xsrf-token')
      }
    })
  }

  async getMetaData() {
    var res = await $.get('https://home.cnblogs.com/user/CurrentUserInfo')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var img = htmlDoc.getElementsByClassName('pfs')[0]
    var link = img.parentNode.href
    var pie = link.split('/')
    pie.pop()
    var uid = pie.pop()
    console.log(link)
    return {
      uid: uid,
      title: uid,
      avatar: img.src,
      type: 'cnblog',
      displayName: 'CnBlog',
      supportTypes: ['markdown', 'html'],
      home: 'https://i.cnblogs.com/EditArticles.aspx?IsDraft=1',
      icon: 'https://i.cnblogs.com/favicon.ico',
    }
  }

  async uploadFile(file) {
    //
    return [
      {
        url: file.src,
      }
    ]
  }

  async addPost(post) {
    if(!post.markdown) {
      var turndownService = new turndown()
      turndownService.use(tools.turndownExt)
    	var markdown = turndownService.turndown(post.post_content)
    	console.log(markdown);
    	post.markdown = markdown
    }
    var postId = null
    try {
      var res = await axios.post('https://i.cnblogs.com/api/posts', {
          "id": null,
          "postType": 2,
          "accessPermission": 0,
          "title": post.post_title,
          "url": null,
          "postBody": post.markdown,
          "categoryIds": null,
          "inSiteCandidate": false,
          "inSiteHome": false,
          "siteCategoryId": null,
          "blogTeamIds": null,
          "isPublished": false,
          "displayOnHomePage": false,
          "isAllowComments": true,
          "includeInMainSyndication": true,
          "isPinned": false,
          "isOnlyForRegisterUser": false,
          "isUpdateDateAdded": false,
          "entryName": null,
          "description": null,
          "tags": null,
          "password": null,
          "datePublished": new Date().toISOString(),
          "isMarkdown": true,
          "isDraft": true,
          "autoDesc": null,
          "changePostType": false,
          "blogId": 0,
          "author": null,
          "removeScript": false,
          "clientInfo": null,
          "changeCreatedTime": false,
          "canChangeCreatedTime": false
        })
      console.log('CNBLOG addPost', res)
      postId = res.data.id
    } catch (e) {
    }

    return {
      status: 'success',
      post_id: postId,
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink:
        'https://i.cnblogs.com/articles/edit;postId=' + post_id,
    }
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

