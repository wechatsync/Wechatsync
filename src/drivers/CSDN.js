// https://mp.csdn.net/mdeditor/saveArticle
// title: 996.ICU项目Stars构成分析
// markdowncontent:
// 996.ICU项目Stars构成分析
// content: <p>996.ICU项目Stars构成分析</p>
// id:
// readType: public
// tags:
// status: 2
// categories:
// type:
// original_link:
// authorized_status: undefined
// articleedittype: 1
// Description:
// resource_url:
// csrf_token:

// https://me.csdn.net/api/user/show

export default class CSDN {
  constructor() {
    this.name = 'csdn'
  }

  async getMetaData() {
    var res = await $.get('https://me.csdn.net/api/user/show')
    return {
      uid: res.data.csdnid,
      title: res.data.username,
      avatar: res.data.avatarurl,
      type: 'csdn',
      displayName: 'CSDN',
      supportTypes: ['markdown'],
      home: 'https://mp.csdn.net/',
      icon: 'https://csdnimg.cn/public/favicon.ico',
    }
  }

  async addPost(post) {
    var res = await $.ajax({
      url: 'https://mp.csdn.net/mdeditor/saveArticle',
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        title: post.post_title,
        markdowncontent: post.markdown,
        content: post.post_content,
        id: '',
        readType: 'public',
        tags: '',
        status: 2,
        categories: '',
        type: '',
        original_link: '',
        authorized_status: 'undefined',
        articleedittype: 1,
        Description: '',
        resource_url: '',
        csrf_token: '',
      },
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.data.id,
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://mp.csdn.net/mdeditor/' + post_id,
    }
  }
}

