let _cachedBook = null;

export default class YuQueAdapter {
  constructor() {
    // this.skipReadImage = true
    this.name = 'yuque'
    modifyRequestHeaders('www.yuque.com/api/', {
    	Origin: 'https://www.yuque.com',
      Referer: 'https://www.yuque.com/dashboard'
    }, [
    	'*://www.yuque.com/api/*',
    ], function(details) {
			// parse token from cookie inject to headers
      if (details.url.indexOf('www.yuque.com/api/') > -1) {
        helpers.parseTokenAndToHeaders(details, 'yuque_ctoken', 'x-csrf-token')
      }
    })
  }

  async getMetaData() {
    var res = await $.ajax({
      url: 'https://www.yuque.com/api/mine/common_used?',
    })
    
    const firstBook = res.data.user_books[0];
    const user = firstBook.user;
    _cachedBook = firstBook.target_id;
    return {
      bookId: firstBook.target_id,
    	uid: user.id,
      title: user.name,
      avatar: user.avatar_url,
      supportTypes: ['html'],
      type: 'yuque',
      displayName: '语雀',
      home: 'https://www.yuque.com/dashboard',
      icon: 'https://gw.alipayobjects.com/zos/rmsportal/UTjFYEzMSYVwzxIGVhMu.png',
    }
  }

  async addPost(post) {
    const postBody = {
        "title": post.post_title,
        "type": "Doc",
        "format": "lake",
        "book_id": _cachedBook ? _cachedBook : 689837,
        "status": 0
    }
    var res = await axios.post('https://www.yuque.com/api/docs', postBody)
    if (!res.data.data) {
      throw new Error(res.data.message)
    }
    const result = res.data.data
    return {
      status: 'success',
      post_id: result.id,
    }
  }

  async editPost(post_id, post) {
    const content = `${post.post_content}`
    try {
      const aslContent = `${content}`;
      if(!post.markdown) {
        var turndownService = new turndown()
        turndownService.use(tools.turndownExt)
        var markdown = turndownService.turndown(post.post_content)
        console.log(markdown);
        post.markdown = markdown
      }
      
      const convertRes = await axios.post(`https://www.yuque.com/api/docs/convert`, {
        from: 'markdown',
        to: 'lake',
				content: post.markdown
      });
      
      const bodyContent = convertRes.data.data.content;
			const saveRes = await axios.put(`https://www.yuque.com/api/docs/${post_id}/content`, {
          "format": "lake",
          "body_asl": bodyContent,
          "body": `<div class="lake-content" typography="traditional">${bodyContent}</div>`,
          "body_html": `<div class="lake-content" typography="traditional">${bodyContent}</div><!8384d2492e7a3edff34dd91c1ee5e056bb6ac85f2aad21b0eaa9188dc6a190a7>`,
          "draft_version": 0,
          "sync_dynamic_data": false,
          "save_type": "auto",
          "edit_type": "Lake"
      });
      return {
        status: 'success',
        post_id: post_id,
        draftLink: `https://www.yuque.com/go/doc/${post_id}/edit`
      }
    } catch (e) {
    	throw new Error(e.toString())
    }
  }

  async uploadFile(file) {
    const { src, post_id } = file
    var uploadUrl = "https://www.yuque.com/api/upload/attach?attachable_type=Doc&attachable_id="+post_id+"&type=image"
    var file = new File([file.bits], 'temp.jpg', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('file', file)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (!res.data.data.attachment_id) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    return [{
      id: res.data.data.attachment_id,
      object_key: res.data.data.attachment_id,
      url: res.data.data.url,
      images: [
        res.data.data
      ]
    }]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    div.html(post.content)
    
    var doc = div

    tools.doPreFilter(div)
    tools.processDocCode(div)
    
    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var pres = doc.find('iframe')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.remove()
      } catch (e) {}
    }

    try {
      const images = doc.find('img')
      for (let index = 0; index < images.length; index++) {
        const image = images.eq(index)
        const imgSrc = image.attr('src')
        if (imgSrc && imgSrc.indexOf('.svg') > -1) {
          console.log('remove svg Image')
          image.remove()
        }
      }
      const qqm = doc.find('qqmusic')
      qqm.next().remove()
      qqm.remove()
    } catch (e) {}

    post.content = $('<div>').append(doc.clone()).html()
    console.log('post', post)
  }
  
  editImg(img, source) {
    img.attr('class', 'ne-image')
    img.attr('id', 'u483fad24')
  }
}
