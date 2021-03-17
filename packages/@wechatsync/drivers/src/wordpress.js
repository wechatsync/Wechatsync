function xmlrpcWrapper(conf) {
  return new Promise((resolve, reject) => {
    $.xmlrpc(conf).then(
      function(response, status, xhr) {
        resolve({
          response,
          status,
          xhr,
        })
      },
      function(jqXHR, status, error) {
        reject({
          jqXHR,
          status,
          error,
        })
      }
    )
  })
}

export default class WordpressAdapter {
  constructor(url, user, pwd, isTypecho) {
    this.url = url
    this.user = user
    this.pwd = pwd
    this.isTypecho = isTypecho
  }

  getRPC() {
    var endPoint = this.url + '/xmlrpc.php'
    if (this.isTypecho) {
      endPoint = this.url + '/action/xmlrpc'
    }
    return endPoint
  }

  async getMetaData() {
    var params = [this.user, this.pwd]
    var res = await xmlrpcWrapper({
      url: this.getRPC(),
      methodName: 'wp.getUsersBlogs',
      params: params,
    })
    console.log('end')
    res.icon = chrome.extension.getURL('images/wordpress.ico')
    return res
  }

  addPost(post) {
    if (this.isTypecho) {
      return {
        status: 'success',
        post_id: '1',
      }
    }

    var params = [0, this.user, this.pwd, post]
    var end = this.url
    return xmlrpcWrapper({
      url: this.getRPC(),
      methodName: 'wp.newPost',
      params: params,
    })
  }

  editPost(post_id, post) {
    var params = [0, this.user, this.pwd, post]
    var endpoint = this.getRPC()
    var isTypecho = this.isTypecho
    if (isTypecho) {
      params.push(false)
      params[3] = {
        title: post['post_title'],
        // text: "!!!\n" + post['post_content'].trim() + "\n!!!",
        description: post['post_content'].trim(),
        // markdown: 1
      }
      console.log('params', params)
    } else {
      params[3] = post_id
      params.push(post)
    }
    return new Promise((resolve, reject) => {
      ;(async () => {
        try {
          var res = await xmlrpcWrapper({
            url: endpoint,
            methodName: isTypecho ? 'metaWeblog.newPost' : 'wp.editPost',
            params: params,
          })

          res.draftLink = this.url + '?p=' + post_id
          console.log('Wordpress', res)
          resolve(res)
        } catch (e) {
          reject(e)
        }
      })()
    })
  }

  //  'metaWeblog.getPost' => array($this, 'mwGetPost'),

  editImg(img, source) {
    // img.attr('web_uri', source.images[0].origin_web_uri)
    img.removeAttr('data-src')
  }

  uploadFile(file) {
    if (this.isTypecho) {
      file['bytes'] = file['bits']
      delete file['bits']
    }
    var params = [0, this.user, this.pwd, file]

    var end = this.url
    return $.xmlrpc({
      url: this.getRPC(),
      methodName: 'wp.uploadFile',
      params: params,
    })
  }
}
