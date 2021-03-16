
export default class FocusAdapter {
  constructor() {
    this.name = 'weibo'
  }

  async getMetaData() {
    var res = await $.get('https://mp-fe-pc.focus.cn//user/status?')
    return {
        uid: res.data.uid,
        title: res.data.accountName,
        avatar: null,
        supportTypes: ['html'],
        displayName: '搜狐焦点',
        type: 'sohufocus',
        home: 'https://mp.focus.cn/fe/index.html#/info/draft',
        icon: 'https://mp.focus.cn/favicon.ico',
      }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }


  async preEditPost(post) {
    var rexp = new RegExp('>[\ts ]*<', 'g')
    var result = post.content.replace(rexp, '><')
    post.content = result
  }

  async editPost(post_id, post) {
    var res = await axios.post('https://mp-fe-pc.focus.cn/news/info/publishNewsInfo', {
        "projectIds": [],
        "newsBasic": {
          "id": "",
          "cityId": 0,
          "title": post.post_title,
          "category": 1,
          "headImg": "",
          "newsAbstract": "",
          "isGuide": 0,
          "status": 4
        },
        "newsContent": {
          "content": post.post_content
        },
        "videoIds": []
    })
    // console.log(res)
    var aId = res.data.data.id
    return {
      status: 'success',
      post_id: aId,
      draftLink: 'https://mp.focus.cn/fe/index.html#/info/subinfo/' + aId,
    }
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
        type: file.type
    });

    formdata.append('image', blob, new Date().getTime() + '.jpg')
    var res = await axios({
      url: `https://mp-fe-pc.focus.cn/common/image/upload?type=2`,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if(res.data.code != 200) {
      console.log(res.data);
      throw new Error('upload failed')
    }
    var url = `https://t-img.51f.com/sh740wsh${res.data.data}`
    return [
      {
        id: res.data.data,
        object_key: res.data.data,
        url: url,
      },
    ]
  }

}
