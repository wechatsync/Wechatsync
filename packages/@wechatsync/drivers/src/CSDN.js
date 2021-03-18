

// const TurndownService = turndown

function createUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

function signCSDN(apiPath, contentType = 'application/json') {
	var once = createUuid()
  var signStr = `POST
*/*

application/json

x-ca-key:203803574
x-ca-nonce:${once}
${apiPath}`
	var hash = CryptoJS.HmacSHA256(signStr, "9znpamsyl2c7cdrr9sas0le9vbc3r6ba");
	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  return {
    accept: '*/*',
    'content-type': contentType,
    'x-ca-key': 203803574,
    'x-ca-nonce': once,
    'x-ca-signature': hashInBase64,
    'x-ca-signature-headers':'x-ca-key,x-ca-nonce'
  }
}

export default class CSDNAdapter {
  constructor() {
    this.name = 'csdn'
    modifyRequestHeaders('bizapi.csdn.net/', {
    	Origin: 'https://editor.csdn.net',
      Referer: 'https://editor.csdn.net/'
    }, [
    	'*://bizapi.csdn.net/*',
    ])
  }

  async getMetaData() {
    var res = await $.get('https://me.csdn.net/api/user/show')
    return {
      uid: res.data.csdnid,
      title: res.data.username,
      avatar: res.data.avatarurl,
      type: 'csdn',
      displayName: 'CSDN',
      supportTypes: ['markdown', 'html'],
      home: 'https://mp.csdn.net/',
      icon: 'https://g.csdnimg.cn/static/logo/favicon32.ico',
    }
  }

  async uploadFile(file) {
    //
    return [
      {
        url: file.src,
      }
    ]
    var headers = signCSDN('/blog-console-api/v3/upload/img?shuiyin=2', 'multipart/form-data')
    var uploadUrl = 'https://bizapi.csdn.net/blog-console-api/v3/upload/img?shuiyin=2'
    var file = new File([file.bits], 'temp', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('file', file)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: Object.assign(headers, {
        'Content-Type': 'multipart/form-data'
      }),
    })


  	return [
      {
        url: file.src,
      }
    ]
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }
  async editPost(post_id, post) {
		// 支持HTML
    if(!post.markdown) {
      var turndownService = new turndown()
    	turndownService.addRule('codefor', {
        filter: ['pre'],
        replacement: function (content) {
          return ['```', content, '```'].join('\n')
        },
      })
    	var markdown = turndownService.turndown(post.post_content)
    	console.log(markdown);
    	post.markdown = markdown
    }

		var postStruct = {
    	    content: post.post_content,
          markdowncontent: post.markdown,
          not_auto_saved: "1",
          readType: "public",
          source: "pc_mdeditor",
          status: 2,
          title: post.post_title,
    }
		var headers = signCSDN('/blog-console-api/v3/mdeditor/saveArticle')
    var res = await axios.post(
      'https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle',
      postStruct,
      {
        headers: headers
    })
  	post_id = res.data.data.id
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://editor.csdn.net/md?articleId=' + post_id,
    }
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    try {
      div.html(post.content)
      var doc = div
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
