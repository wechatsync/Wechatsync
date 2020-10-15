<template>
  <section id="main-section">
    <header class="float-section-header">
      <a view-ref="back" @click="$router.back()" class="back-btn">
        <img src="/images/arrow-left.png" style="vertical-align: 0px" />
      </a>
      添加账号
    </header>
    <ul class="account-types" style="padding-bottom: 53px" v-if="!type">
      <li @click="add(driver.type)" v-for="driver in drivers">
        <img :src="driver.icon" class="icon" height="20" />
        <span v-if="driver.home">
          <a :href="driver.home" target="_blank">登陆{{ driver.name }}</a>
        </span>
        <span v-if="!driver.home">{{ driver.name }}</span>
        <img src="/images/arrow-right-light.png" style="float: right" />
      </li>
      <!-- <li @click="add('typecho')">
        <img src="/images/typecho.ico" class="icon" height="20">
        添typecho账号
        <img src="/images/arrow-right-light.png" style="float: right;">
      </li>-->
    </ul>
    <p v-if="!type" class="mt-2 ml-3">
      除WordPress、Typecho平台外
      <br />其它的只要在当前浏览器登录过即可被识别到账号，无需在此添加
    </p>
    <div
      v-if="type == 'wordpress' || type == 'typecho'"
      class="add-account-form"
    >
      <div style="text-align: center; margin-bottom: 15px">
        <img src="/images/wordpress-logo.svg" v-if="type == 'wordpress'" />
        <img src="/images/typecho-logo.svg" v-if="type == 'typecho'" />
      </div>
      <div class="form-group">
        <label for="exampleInputEmail1">博客地址</label>
        <input
          type="email"
          v-model="wpUrl"
          class="form-control"
          placeholder="网站地址"
        />
        <small id="emailHelp" class="form-text text-muted"
          >如(http://xxx.com)</small
        >
      </div>
      <div class="form-group">
        <label for="exampleInputEmail1">账号</label>
        <input
          type="email"
          class="form-control"
          v-model="wpUser"
          placeholder="账号"
        />
        <small id="emailHelp" class="form-text text-muted"
          >账号密码只会存在你本机上</small
        >
      </div>
      <div class="form-group">
        <label for="exampleInputPassword1">密码</label>
        <input
          type="password"
          v-model="wpPwd"
          class="form-control"
          placeholder="密码"
        />
      </div>
      <button type="submit" class="btn btn-primary" @click="create">
        添加
      </button>
    </div>
  </section>
</template>

<script>
import { getDriver } from '../drivers/driver'

var winBackgroundPage = chrome.extension.getBackgroundPage()
var db = winBackgroundPage.db

export default {
  data() {
    return {
      type: '',
      wpUrl: '',
      wpUser: '',
      wpPwd: '',
      drivers: [
        {
          type: 'wordpress',
          icon: '/images/wordpress.ico',
          name: '添加Wordpress账号',
        },
        {
          type: 'typecho',
          icon: '/images/typecho.ico',
          name: '添加typecho账号',
        },
        {
          type: 'weixin',
          home: 'https://mp.weixin.qq.com',
          name: '微信',
          icon: 'https://mp.weixin.qq.com/favicon.ico',
        },
        {
          type: 'weibo',
          home: 'https://card.weibo.com/article/v3/editor',
          icon: 'https://weibo.com/favicon.ico',
          name: '微博',
        },
        {
          type: 'zhihu',
          home: 'https://www.zhihu.com/settings/account',
          icon: 'https://static.zhihu.com/static/favicon.ico',
          name: '知乎',
        },
        {
          type: 'toutiao',
          home: 'https://mp.toutiao.com/profile_v3/graphic/publish',
          icon:
            'https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png',
          name: '头条',
        },
        {
          type: 'jianshu',
          home: 'https://www.jianshu.com/settings/basic',
          icon:
            'https://cdn2.jianshu.io/assets/favicons/favicon-e743bfb1821442341c3ab15bdbe804f7ad97676bd07a770ccc9483473aa76f06.ico',
          name: '简书',
        },
        {
          type: 'juejin',
          home: 'https://juejin.im/editor/drafts',
          icon: 'https://gold-cdn.xitu.io/favicons/favicon.ico',
          name: '掘金',
        },
        {
          type: 'csdn',
          home: 'https://i.csdn.net',
          icon: 'https://csdnimg.cn/public/favicon.ico',
          name: 'CSDN',
        },
        {
          type: 'segmentfault',
          home: 'https://segmentfault.com/user/draft',
          icon:
            'https://static.segmentfault.com/v-5d8c9d24/global/img/favicon.ico',
          name: 'Segmentfault',
        },
        {
          type: 'cnblog',
          home: 'https://i.cnblogs.com/EditArticles.aspx?IsDraft=1',
          icon: 'https://common.cnblogs.com/favicon.ico',
          name: '博客园',
        },
      ],
    }
  },

  methods: {
    add(type) {
      this.type = type
    },
    async create() {
      var self = this
      var driver = getDriver({
        type: this.type,
        params: {
          wpUrl: this.wpUrl,
          wpUser: this.wpUser,
          wpPwd: this.wpPwd,
        },
      })

      var resp = await driver.getMetaData()
      driver
        .getMetaData()
        .then(
          function (blogs) {
            var blogMeta = blogs.response[0][0]
            db.addAccount({
              uid: self.wpUrl,
              type: self.type,
              params: {
                wpUrl: self.wpUrl,
                wpUser: self.wpUser,
                wpPwd: self.wpPwd,
                meta: blogMeta,
              },
              title: blogMeta.blogName,
            })
            alert('添加成功->' + blogMeta.blogName)
            self.$router.back()
          },
          function (jqXHR, status, error) {
            if (status == 'parsererror') {
              if (error.code == 403) {
                alert('账号或密码错误')
              } else {
                alert(error.msg)
              }
            } else {
              if (error == 'Not Found') {
                alert('地址不对，非WordPress网站')
              } else {
                alert(error)
              }
            }
            console.log(error, arguments)
          }
        )
        .catch((er) => {
          alert(er.toString())
          console.log('error')
        })
    },
  },
}
</script>
