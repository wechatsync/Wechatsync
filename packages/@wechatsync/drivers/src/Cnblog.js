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
// https://passport.cnblogs.com/user/LoginInfo?callback=jQuery17083998854357229_1570784103705&_=1570784103764

export default class CnblogAdapter {
  constructor() {
    this.name = 'cnblog'
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
      supportTypes: ['markdown'],
      home: 'https://i.cnblogs.com/EditArticles.aspx?IsDraft=1',
      icon: 'https://common.cnblogs.com/favicon.ico',
    }
  }

  async addPost(post) {
    var postId = null
    try {
      var res = await $.ajax({
        url: 'https://i.cnblogs.com/EditArticles.aspx?opt=1',
        type: 'POST',
        dataType: 'JSON',
        headers: {},
        data: {
          __VIEWSTATE: '',
          __VIEWSTATEGENERATOR: '',
          Editor$Edit$txbTitle: post.post_title,
          Editor$Edit$EditorBody: post.markdown,
          Editor$Edit$Advanced$ckbPublished: 'on',
          Editor$Edit$Advanced$chkDisplayHomePage: 'on',
          Editor$Edit$Advanced$chkComments: 'on',
          Editor$Edit$Advanced$chkMainSyndication: 'on',
          Editor$Edit$Advanced$txbEntryName: '',
          Editor$Edit$Advanced$txbExcerpt: '',
          Editor$Edit$Advanced$txbTag: '',
          Editor$Edit$Advanced$tbEnryPassword: '',
          Editor$Edit$lkbDraft: '存为草稿',
        },
      })
      console.log('CNBLOG addPost', res)
    } catch (e) {
      var parser = new DOMParser()
      var htmlDoc = parser.parseFromString(e.responseText, 'text/html')
      var editLink = htmlDoc.getElementById('TipsPanel_LinkEdit')
      var ErrorPanel = htmlDoc.getElementsByClassName('ErrorPanel')[0]
      if (editLink) {
        postId = editLink.href.split('postid=')[1]
        console.log('CNBLOG error', editLink, editLink.href.query)
      } else {
        if (ErrorPanel) {
          throw Error(ErrorPanel.innerText)
        }
      }
      console.log('CNBLOG error', e.responseText, htmlDoc, editLink)
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
        'https://i.cnblogs.com/EditArticles.aspx?postid=' +
        post_id +
        '&update=1',
    }
  }
}

