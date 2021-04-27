export default class ImoocAdapter {
  constructor() {
    this.name = 'imooc'
    // cors
    modifyRequestHeaders(
      'www.imooc.com/article',
      {
        Origin: 'https://www.imooc.com',
        Referer: 'https://www.imooc.com/',
      },
      ['*://www.imooc.com/article/*']
    )
  }

  async getMetaData() {
    var res = await $.get('https://www.imooc.com/u/card')
    var dataStr = res.replace('jsonpcallback(', '').replace('})', '}')
    var result = JSON.parse(dataStr)
    console.log(result)
    if (result.result != 0) {
      throw new Error(result.msg)
    }
    return {
      uid: result.data.uid,
      title: result.data.nickname,
      avatar: result.data.img,
      type: 'imooc',
      displayName: '慕课手记',
      supportTypes: ['markdown', 'html'],
      home: 'https://www.imooc.com/article',
      icon: 'https://www.imooc.com/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    if (!post.markdown) {
      var turndownService = new turndown()
      turndownService.use(tools.turndownExt)
      var markdown = turndownService.turndown(post.post_content)
      post.markdown = markdown
      console.log(markdown)
    }

    var postStruct = {
      editor: 0,
      draft_id: 0,
      title: post.post_title,
      content: post.markdown,
    }

    var res = await $.ajax({
      url: 'https://www.imooc.com/article/savedraft',
      type: 'POST',
      dataType: 'JSON',
      data: postStruct,
    })
    console.log(res)
    post_id = res.data
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://www.imooc.com/article/draft/id/' + post_id,
    }
  }

  async uploadFile(file) {
    var uploadUrl = 'https://www.imooc.com/article/ajaxuploadimg'
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()
    formdata.append('photo', file, new Date().getTime() + '.jpg')
    formdata.append('type', file.type)
    formdata.append('id', 'WU_FILE_0')
    formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', file.size)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.result != 0) {
      throw new Error(res.data.msg)
    }

    var url = res.data.data.imgpath
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
