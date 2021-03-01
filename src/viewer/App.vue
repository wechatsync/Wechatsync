<template>
  <div class="viewer-wrapper">
    <div class="ctrl">
      <div class="major-actions">
        <el-popover
          placement="top-start"
          width="500"
          :title="submitting ? '发布中' : '发布到'"
          v-model="visible"
          trigger="click"
        >
          <div>
            <hr />
            <div class="all-pubaccounts" v-if="!submitting">
              <div class="account-item" v-for="account in allAccounts">
                <el-checkbox v-model="account.checked">
                  <img
                    :src="account.icon ? account.icon : ''"
                    class="icon"
                    height="20"
                    style="vertical-align: -6px; height: 20px !important"
                  />
                  {{ account.title }}
                </el-checkbox>
              </div>
            </div>
            <div class="all-pubaccounts" v-if="submitting && taskStatus">
              <p v-if="!taskStatus.accounts">等待发布..</p>
              <div
                class="account-item taskStatus"
                v-for="account in taskStatus.accounts"
              >
                <img
                  :src="account.icon ? account.icon : ''"
                  class="icon"
                  height="20"
                  style="vertical-align: -6px; height: 20px !important"
                />
                <span class="name-block">{{ account.title }}</span>
                <span
                  style="margin-left: 15px"
                  :class="account.status + ' message'"
                >
                  <template v-if="account.status == 'uploading'">
                    <div class="lds-dual-ring"></div>
                    {{ account.msg || '发布中' }}
                  </template>

                  <template v-if="account.status == 'failed'">
                    同步失败, 错误内容：{{ account.error }}
                  </template>

                  <template v-if="account.status == 'done' && account.editResp">
                    同步成功
                    <a
                      :href="account.editResp.draftLink"
                      v-if="account.type != 'wordpress' && account.editResp"
                      style="margin-left: 5px"
                      target="_blank"
                      >查看草稿</a
                    >
                  </template>
                </span>
              </div>
            </div>
            <hr />

            <el-button
              size="small"
              v-if="!submitting"
              type="primary"
              @click="doSubmit"
              >同步</el-button
            >

            <el-button
              size="small"
              v-if="submitting"
              type="primary"
              @click="submitting = false"
              >关闭</el-button
            >
          </div>
          <el-button slot="reference" size="small" type="primary"
            >同步</el-button
          >
        </el-popover>
      </div>
    </div>
    <div
      @click="closeView"
      id="closebtn"
      style="position: fixed; cursor: pointer; right: 20px; top: 20px"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="#111"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <path
          d="M5.69999 5L5 5.70004L11.3 12.0001L5 18.3L5.69999 19L12 12.7L18.3 19L19 18.3L12.7 12.0001L19 5.70004L18.3 5.00012L12 11.3L5.69999 5Z"
        ></path>
      </svg>
    </div>
    <div id="article" style="position: relative" v-click-outside="hide">
      <div class="page" @mousemove="cleanNode" contenteditable="true">
        <h1 class="title" ref="title">{{ pageData.title }}</h1>
        <div v-html="pageData.article" ref="viewport"></div>
      </div>
      <div class="page" id="incoming-page-placeholder">
        <div id="incoming-page-corner">
          <div id="incoming-page-text" data-itext="nextPageLoadingTips">
            Loading Next Page…
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
var PouchDB = require('pouchdb').default

import ClickOutside from 'vue-click-outside'

PouchDB.plugin(require('pouchdb-find').default)
// console.log(PouchDB);
var db = new PouchDB('articles')
var trash = new PouchDB('trash-articles')
// db.put({
//   _id: 'dave@gmail.com',
//   name: 'David',
//   age: 69
// });

// db.changes().on('change', function() {
//   console.log('Ch-Ch-Changes');
// });

var service = analytics.getService('syncer')
var tracker = service.getTracker('UA-48134052-13')
var axios = require('axios')

;(function ($) {
  $.extend($.fn, {
    makeCssInline: function () {
      this.each(function (idx, el) {
        var style = el.style
        var types = [
          'margin',
          'padding',
          'vertical-align',
          'word-break',
          'color',
          'text-align',
          'font-weight',
          'border',
          'box-sizing',
          'font-size',
          'font-family',
          'line-height',
          'white-space',
          'background',
          'overflow',
        ]
        var properties = []
        for (var i in types) {
          const property = types[i]
          if ($(this).css(property)) {
            properties.push(property + ':' + $(this).css(property))
          }
        }
        this.style.cssText = properties.join(';')
        $(this).children().makeCssInline()
      })
    },
  })
})(jQuery)

export default {
  name: '',
  data() {
    return {
      contentType: 'html',
      submitting: false,
      pageData: {},
      visible: false,
      list: [],
      value: '',
      taskStatus: {},
      allAccounts: [],
      currentArtitle: {},
      markdownOption: {},
    }
  },
  watch: {
    pageData() {
      setTimeout(() => {
        // this.cleanNode();
        var pTags = Array.prototype.slice.call(
          this.$refs.viewport.getElementsByClassName('p')
        )
        pTags.forEach((el) => {
          if (el.innerHTML == '') {
            el.parentNode.removeChild(el)
          }
          if (el.className.indexOf('ztext-empty-paragraph') > -1) {
            el.parentNode.removeChild(el)
          }
        })
      }, 1000)
    },
  },
  directives: {
    ClickOutside,
  },
  mounted() {
    var self = this
    window.onmessage = function (evt) {
      try {
        var data = JSON.parse(evt.data)
        console.log('revice', data)
        if (data.article) {
          self.pageData = data
        } else {
          if (data.method == 'taskUpdate') {
            self.taskUpdate(data.task)
            // setTimeout(() => {
            //   self.cleanNode();
            // }, 1500);
          }
          if (data.method == 'openPannel') {
            self.loadAccounts()
          }
        }
      } catch (e) {
        console.log('revice error', e, evt)
      }
    }

    window.addEventListener('scroll', () => {
      if (!self.cleaned) {
        self.cleaned = true
        // self.cleanNode();
      }
    })

    tracker.sendAppView('ArticleView')
  },
  methods: {
    taskUpdate(task) {
      this.taskStatus = task
      var currentAccount = task.accounts.filter((a) => {
        return a.status == 'uploading'
      })

      var doneAccounts = task.accounts.filter((a) => {
        if (this.lastProcessAccount) {
          return a.status == 'done' && a.type == this.lastProcessAccount.type
        }
        return a.status == 'done'
      })

      var allDoneAccounts = task.accounts.filter((a) => a.status == 'done')

      var msg = ''
      var title = task.post.title

      if (!currentAccount.length) {
        title = '准备同步'
        if (doneAccounts.length) {
          title = doneAccounts[0].displayName
          msg = '同步成功'
          this.lastProcessAccount = null
        }
      } else {
        var processAccount = currentAccount[0]
        this.lastProcessAccount = processAccount
        if (!processAccount.msg) {
          title = '准备同步到:' + processAccount.displayName
        } else {
          title = processAccount.displayName + ':' + processAccount.title
          msg = processAccount.msg
        }
      }

      if (task.accounts.length == allDoneAccounts.length) {
        // title = "同步成功";
      }

      // this.$notify({
      //   title: title,
      //   message: msg,
      //   duration: 2000
      // });
      console.log('taskUpdate', task)
    },
    hide() {
      console.log('click out')
    },
    closeView() {
      window.parent.postMessage(JSON.stringify({ method: 'closeMe' }), '*')
    },
    loadAccounts() {
      console.log('loadAccounts')
      var allAccounts = []
      var accounts = []
      var self = this
      function getAccounts() {
        chrome.extension.sendMessage(
          {
            action: 'getAccount',
          },
          function (resp) {
            console.log('allAccounts', resp)
            self.allAccounts = resp.filter((item) => {
              if (!item.supportTypes) return true
              return item.supportTypes.indexOf(self.contentType) > -1
            })
          }
        )
      }
      getAccounts()
    },
    cleanNode() {
      if (this.$refs.viewport) {
        // var els = Array.prototype.slice.call(
        //   this.$refs.viewport.getElementsByTagName("*")
        // );
        // var raderId = document.getElementById("safari-reader-element-marker");
        // if (raderId) raderId.parentNode.removeChild(raderId);
        // els.forEach(el => {
        //   if (el.offsetHeight == 0) {
        //     // el.parentNode.removeChild(el);
        //   }
        // });
        // var pTags = Array.prototype.slice.call(
        //   this.$refs.viewport.getElementsByTagName("p")
        // );
        // pTags.forEach(el => {
        //   if (el.innerHTML == "") {
        //     el.parentNode.removeChild(el);
        //   }
        //   if (el.className.indexOf("ztext-empty-paragraph") > -1) {
        //     el.parentNode.removeChild(el);
        //   }
        // });
        // $(this.$refs.viewport)
        //   .find("p")
        //   .each(function(idx, p) {
        //     var el = $(p);
        //     if (el.html() == "<br>") {
        //       el.remove();
        //     }
        //   });
        // var pTags = Array.prototype.slice.call(
        //   this.$refs.viewport.getElementsByTagName("noscript")
        // );
        // pTags.forEach(el => {
        //   el.parentNode.removeChild(el);
        // });
        // function traverseNodes(node) {
        //   if (node.hasChildNodes) {
        //     var sonnodes = node.childNodes;
        //     for (var i = 0; i < sonnodes.length; i++) {
        //       var sonnode = sonnodes[i];
        //       traverseNodes(sonnode);
        //     }
        //   }
        //   if (
        //     node.nodeType == 3 &&
        //     node.nodeName == "#text" &&
        //     node.nodeValue.trim() == ""
        //   ) {
        //     node.parentNode.removeChild(node);
        //   }
        // }
        // traverseNodes(this.$refs.viewport);
      }
    },
    async doSubmit() {
      var self = this
      this.cleanNode()
      var originalHtml = self.$refs.viewport.innerHTML
      // $(".page").makeCssInline();
      function getPost() {
        var post = {}
        post.title = self.$refs.title.innerText
        post.content = originalHtml
        post.inline_content = self.$refs.viewport.innerHTML
        // post.markdown = self.currentArtitle.content;
        post.thumb = self.pageData.mainImage
        if (!post.thumb) {
          post.thumb = self.pageData.leadingImage
        }
        // choose from content
        if (!post.thumb) {
          var images = self.$refs.viewport.getElementsByTagName('img')
          if (images.length) {
            if (images[0].src != '') {
              post.thumb = images[0].src
            }
          }
        }
        post.desc = self.pageData.description
        console.log(post)
        return post
      }
      var selectedAc = this.allAccounts.filter((a) => {
        return a.checked
      })

      this.$message('准备同步')
      setTimeout(() => {
        chrome.extension.sendMessage(
          {
            action: 'addTask',
            task: {
              post: getPost(),
              accounts: selectedAc,
            },
          },
          function (resp) {
            console.log('addTask return', resp)
          }
        )
      }, 1000)
      this.submitting = true
      this.taskStatus = {}
      // this.visible = false;
    },
  },
}
</script>
<style>
.article-list {
  height: 100%;
  width: 350px;
}


.article-all {
  color: #878787;
  height: 100%;
  width: 350px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  margin-top: 80px;
}

.editor-main {
  background: white;
  border-left: 1px solid #ececec;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  min-width: 403px;
  transition: top 0.5s ease-in-out 0.2s;
  margin-left: 350px;
  height: 100%;
}

.article-item {
  height: 120px;
  cursor: pointer;
  margin: 0 auto;
  text-align: left;
  overflow: hidden;
  position: relative;
  transition: opacity 0.2s ease-in-out, height 0.2s ease-in-out,
    width 0.2s ease-in-out;
}

.article-item .main-content {
  color: #878787;
  left: 24px;
  overflow: hidden;
  overflow-wrap: break-word;
  position: absolute;
  right: 24px;
  top: 12px;
  word-wrap: break-word;
  bottom: 15px;
}

.article-item .title {
  transition: color 0.1s ease-in-out, width 0s ease-in-out 0.1s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: caecilia, times, serif;
  font-size: 16px;
  font-weight: 400;
  color: #4a4a4a;
  margin-bottom: 3px;
  max-height: 40px;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: break-word;
  line-height: 20px;
  width: 302px;
}

.article-item .date {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: gotham, helvetica, arial, sans-serif;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.article-item .desc {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: gotham, helvetica, arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
}

.article-item * {
  box-sizing: border-box;
}

.article-item:hover .date,
.article-item:hover .title,
.article-item:hover .desc {
  color: #fff;
}

.item-divider {
  border-top: 1px solid #ececec;
  left: 20px;
  right: 20px;
  top: 0;
  position: absolute;
}

.article-item:hover .item-divider {
  border-top: none;
}

.article-item .hover-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0;
  background-color: rgba(43, 181, 92, 0.9);
  transition: opacity 0.1s ease-in-out;
}

.article-item.selected .selected-overlay {
  border: 3px solid #d9d9d9;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.hover-container {
  position: absolute;
  opacity: 0;
  top: 0;
  right: 0;
  transition: opacity 0.1s ease-in-out;
}

.hover-container .icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin: 8px 12px 0 0;
  color: white;
  font-size: 20px;
  text-align: center;
  line-height: 24px;
}

.article-item:hover .hover-overlay {
  opacity: 1;
}

.article-item:hover .hover-container {
  opacity: 1;
}

.top-tools {
  padding: 10px 24px;
  font-size: 13px;
  text-align: right;
  border-bottom: 1px solid #d9d9d9;
  width: 350px;
}

.top-tools .btn {
  font-size: 13px;
}

.v-note-wrapper .v-note-op {
  border-top: 1px solid #f2f6fc;
  border-radius: 0px;
}

.v-note-wrapper {
  height: 100%;
  position: absolute !important;
  width: 100%;
  top: 0;
  padding-top: 80px;
  border-left: none !important;
  box-sizing: border;
}

.top-tools,
.post-title {
  position: absolute;
  z-index: 1502;
  top: 32px;
}

.post-title input {
  border: none;
  height: 45px;
  outline: none;
  font-size: 20px;
  font-family: caecilia, times, serif;
  font-size: 28px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 300;
  width: 700px;
  padding-left: 24px;
}

.not-article {
  padding: 10px 20px;
  font-size: 12px;
  color: #666;
}

.major-actions {
  margin-left: 12px;
}

.all-pubaccounts {
}

.account-item img {
  margin-right: 5px;
}

.account-item {
  line-height: 36px;
  padding: 0 15px;
  font-size: 14px;
}

.account-item .name-block {
}
.account-item .message {
  max-width: 300px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  line-height: 140%;
}
.account-item .failed {
  color: red;
}

.account-item .uploading {
  color: #888;
}

.all-pubaccounts {
}
.account-item .done {
  color: #155724;
}

.lds-dual-ring {
  display: inline-block;
  width: 15px;
  height: 15px;
}

.lds-dual-ring:after {
  content: ' ';
  display: block;
  width: 12px;
  height: 12px;
  margin: 1px;
  border-radius: 50%;
  border: 1px solid #111;
  border-color: #111 transparent #111 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
