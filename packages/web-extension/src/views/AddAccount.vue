<template>
  <section id="main-section">
    <header class="float-section-header">
      <a view-ref="back" @click="$router.back()" class="back-btn">
        <img src="/images/arrow-left.png" style="vertical-align: 0px" />
      </a>
      添加账号
    </header>
    <div style="
    background: #e91e63;
    color: #efefef;
    padding: 5px 0;
"><p class=" ml-3 mb-0">
      除WordPress、Typecho平台外
      <br>其它平台只要在当前浏览器登录过即可被识别到账号，无需在此添加
    </p></div>
    <ul class="account-types" style="padding-bottom: 53px" v-if="!type">
      <li @click="add(driver.type)" v-for="driver in drivers">
        <img :src="driver.icon" class="icon" height="20" />
        <span v-if="driver.home">
          <a :href="driver.home" target="_blank">登陆{{ driver.name }}</a>
        </span>
        <span v-if="!driver.home">{{ driver.name }}</span>
        <img src="/images/arrow-right-light.png" style="float: right" />
      </li>
      <p class="mt-2 mb-2 ml-3">
        <a href="https://www.wechatsync.com/?utm_source=extension-add-accoun#supports" target="_blank" class="mt-2 btn btn-outline-secondary">所有支持平台</a>
        <a href="https://developer.wechatsync.com/?utm_source=extension-add-account" target="_blank" class="mt-2 ml-3 btn btn-info">添加平台</a>
      </p>
    </ul>
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
        <template v-if="checking">登陆中...</template>
        <template v-if="!checking">添加</template>
      </button>
    </div>
  </section>
</template>

<script>
// import { getDriver } from '../drivers/driver'

var winBackgroundPage = chrome.extension.getBackgroundPage()
var db = winBackgroundPage.db


export default {
  data() {
    return {
      type: '',
      wpUrl: '',
      wpUser: '',
      wpPwd: '',
      checking: false,
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
        // {
        //   type: 'juejin',
        //   home: 'https://juejin.im/editor/drafts',
        //   icon: 'https://gold-cdn.xitu.io/favicons/favicon.ico',
        //   name: '掘金',
        // },
        // {
        //   type: 'csdn',
        //   home: 'https://i.csdn.net',
        //   icon: 'https://csdnimg.cn/public/favicon.ico',
        //   name: 'CSDN',
        // },
        // {
        //   type: 'segmentfault',
        //   home: 'https://segmentfault.com/user/draft',
        //   icon:
        //     'https://static.segmentfault.com/v-5d8c9d24/global/img/favicon.ico',
        //   name: 'Segmentfault',
        // },
        // {
        //   type: 'cnblog',
        //   home: 'https://i.cnblogs.com/EditArticles.aspx?IsDraft=1',
        //   icon: 'https://common.cnblogs.com/favicon.ico',
        //   name: '博客园',
        // },
      ],
    }
  },

  methods: {
    add(type) {
      this.type = type
    },
    async create() {
      var self = this
      var driver = winBackgroundPage.currentDriver.getDriver({
        type: this.type,
        params: {
          wpUrl: this.wpUrl,
          wpUser: this.wpUser,
          wpPwd: this.wpPwd,
        },
      })

      this.checking = true
      // var resp = await driver.getMetaData()
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
            self.checking = false
            self.$router.back()
          },
          function (res) {
            const {error, jqXHR, status } = res
            self.checking = false
            // console.log('getMetaData', res)
            if(status == 'error') {
              alert(jqXHR.responseText)
              return
            }

            if (jqXHR.status == 'parsererror') {
              if (jqXHR.error.code == 403) {
                alert('账号或密码错误')
              } else {
                alert(error.msg)
              }
            } else {
              if (jqXHR.error == 'Not Found') {
                alert('地址不对，非WordPress网站')
              } else {
                alert(JSON.stringify(jqXHR.error))
              }
            }
          }
        )
        // .catch((er) => {
        //   alert(er.toString())
        //   console.log('error')
        // })
    },
  },
}
</script>
