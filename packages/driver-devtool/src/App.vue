<template>
  <div class="editor-wrapper">
    <div class="header-bar">
        <nav class="navbar navbar-expand-lg navbar-light" style="padding: 0 10px;">
        <!-- Brand -->
        <a class="navbar-brand" href="#" style="color: #222; font-size: 20px; width: 178px;margin-right: 20px;">
            <img src="https://www.wechatsync.com/images/logo-light.svg" height="38" style="vertical-align: -12px;">
            开发者工具
        </a>

            <div id="actions">
        <nav class="actionCont collapsed">
          <div class="action-item" id="deploy-code">
            <a class="ai-button" @click="deployCode()">
              <v-icon name="paper-plane" scale="0.9"/>部署到插件
            </a>
          </div>
          <div class="action-item" id="run-code">
            <a class="ai-button" @click="runCode()">
              <v-icon name="play" scale="0.8"/>测试
            </a>
          </div>
        </nav>
      </div>

        <!-- Toggler -->
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Collapse -->
        <div class="collapse navbar-collapse" id="navbarCollapse">
          <!-- Toggler -->
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <i class="fe fe-x"></i>
          </button>
          <!-- Navigation -->
          <ul class="navbar-nav ml-auto" style="margin-right: 15px;">
            <li class="nav-item">
              <a class="nav-link" target="_blank" href="https://github.com/wechatsync/Wechatsync">Github</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" target="_blank" href="https://www.wechatsync.com/#install">插件下载</a>
            </li>
          </ul>
        </div>
    </nav>
    </div>
    <div class="loading-page" v-if="!extensionInstalled" style="padding-top: 80px; padding-left: 10px">
        <scale-loader class="loading" style="margin-top: 80px; margin-bottom: 10px" :loading="true" color="black" ></scale-loader>
        <div v-if="checkCount > 3">
            未检测到插件<br>
            请安装同步助手Chrome插件
            <a href="https://www.wechatsync.com/#install" target="_blank">https://www.wechatsync.com/#install</a>
        </div>
    </div>
    <div class="app-main theme-eclipse multi-file-mode" v-if="extensionInstalled">

    <div id="sidebar">
      <div id="sidebar-main">
        <div class="sidebar-item" id="file-manager">
          <h3 class="toggler" title>
            适配器
            <a class="add-file" @click="createFile()">
              <v-icon name="plus" scale="0.5"/>
            </a>
            <a class="add-file">
              <label>
                <v-icon name="folder-open" scale="0.5"/>
                <input type="file" ref="filer" name="fileContent" style="display:none">
              </label>
            </a>
          </h3>
          <div class="body" style="padding-left:0;padding-right:0">
            <ul class="file-list">
              <v-contextmenu ref="contextmenu" @contextmenu="handleFileContextmenu">
                <!-- <v-contextmenu-item @click="handleSelectAsMain">Select As Main</v-contextmenu-item> -->
                <v-contextmenu-item @click="handleRename">重命名</v-contextmenu-item>
                <v-contextmenu-item @click="handleDelete">删除</v-contextmenu-item>
              </v-contextmenu>
              <li
                v-for="(file, index) in files"
                :class="{ active: currentEditFileName == file.fileName }"
                class="file-item"
                :key="index"
                v-contextmenu:contextmenu
              >
                <div v-if="!file.edit" @click="openFile(file, index)">
                  <span class="file-name">{{ file.fileName }}</span>
                  <strong class="tag-label" v-if="file.isLeader">测试文章</strong>
                </div>
                <div v-if="file.edit">
                  <input type="text" v-model="file.fileName" @keyup.enter="handleEdit(file, index)">
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div id="content">
        <div class="file-tabs">
          <ul :current="currentEditFileName">
            <li
              v-if="file"
              class="editor-file"
              :class="{ active: currentEditFileName == file.fileName }
                  "
              v-for="(file, index) in editorFiles"
            >
              <a @click="selectFile(file)">{{ file.fileName }}</a>
              <a class="close-btn" @click="closeFile(file, index)">
                <v-icon name="times" scale="0.6"/>
              </a>
            </li>
          </ul>
        </div>
        <div id="editor">
          <div class="pannel-main">
            <codemirror
                  v-model="currentEditFile.content"
                  :options="getFileCodeOptions(currentEditFile)"
                >
            </codemirror>
          </div>
          <div class="gutter gutter-vertical" style="height: 1px;"></div>
          <div class="pannel-main" style="height: calc(30% - 0.5px);">
              <div class="windowLabelCont">
                <span class="windowLabel">Console</span>
              </div>
              <div class="vue-codemirror">
                <div class="CodeMirror cm-s-monokai">
                  <div class="results-container">
                    <p v-for="log in logs">{{ log}}</p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

     <div id="bottom-bar">
        <a href="https://www.wechatsync.com/#group" target="_blank">wechat group</a>
      <ul class="right">
        <li>
          <a
            title="issues or request new feature"
            href="https://github.com/wechatsync/Wechatsync"
            target="_blank"
          >
            <v-icon name="brands/github" scale="1"/>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>

// language
import "codemirror/mode/javascript/javascript.js";
// theme css
// import "codemirror/theme/monokai.css";
// theme css
import "codemirror/theme/eclipse.css";
// require active-line.js
import "codemirror/addon/selection/active-line.js";
// styleSelectedText
import "codemirror/addon/selection/mark-selection.js";
import "codemirror/addon/search/searchcursor.js";
// hint
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/javascript-hint.js";
import "codemirror/addon/selection/active-line.js";
// highlightSelectionMatches
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";
// keyMap
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/sublime.js";
// foldGutter
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/xml-fold.js";



var PouchDB = require('pouchdb').default
PouchDB.plugin(require('pouchdb-find').default)
console.log(PouchDB)
var db = new PouchDB('articles')
var trash = new PouchDB('trash-articles')
var axios = require('axios')

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

import files from "./files.js"
import exampleCodes from "./example.js"

import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'

export default {
  name: '',
  components: { ScaleLoader },
  data() {
    return {
      logs: [],
      files: [],
      currentEditFile: {},
      currentEditFileName: "",
      editorFiles: [],
      visible: false,
      submitting: false,
      list: [
        // {
        //   id: 0,
        //   title: "MRC question1",
        //   date: "19/1/10",
        //   desc: "navigator.battery navigator.getBattery()"
        // },
        // {
        //   id:  1,
        //   title: "MRC question",
        //   date: "19/1/10",
        //   desc:
        //     'try{(function(oa){function wc(a,b){if(null===this||void 0===this)throw new TypeError("Array.prototype.forEach called on null or undefined");if("function"!==typeof a)throw new TypeError(a+" is not a fu...'
        // }
      ],
      value: '',
      extensionInstalled: false,
      checkCount: 0,
      allAccounts: [],
      currentArtitle: {},
      taskStatus: {},
      markdownOption: {
        // boxShadow: false
      },
    }
  },

  watch: {
    files: {
      deep: true,
      handler() {
        this.saveState();
      }
    }
  },
  mounted() {

    // if(this.list.length) this.currentArtitle = this.list[0];
    // this.loadDoc()
    var self = this;
    ;(function check() {
          self.extensionInstalled = typeof window.$syncer != 'undefined';
          self.checkCount++;
          if(self.extensionInstalled) {
            window.$syncer.startInspect(function(args) {
              console.log('log', args)
              self.addLog(args);
            });
            self.loadAccounts()
            self.afterExtension()
            return
          }
          setTimeout(check, 800);
    })();


  },
  methods: {
    ...files,
    addLog(args) {
      if(this.logs.length > 100) {
        this.logs.shift();
      }
      this.logs.push(JSON.stringify(args))
    },
    afterExtension() {
      this.loadState();
      this.$nextTick(_ => {
        this.initFileManager();
      })


    },
    loadState () {
      var state = window.localStorage.getItem("state");
      if(state) {
        state = JSON.parse(state)
        if(!state.files.length) {
          state.files = exampleCodes.files
        }
      } else {
        state = {}
        state.files = exampleCodes.files
      }
      this.files = state.files
      console.log('this.files', this.files)
      this.editorAfterProjectLoad()
    },
    saveState() {
      var state = {
        files: this.files.map(data => {
          return {
            fileName: data.fileName,
            content: data.content,
            isLeader: data.isLeader,
            hexData: data.hexData,
            compiled: data.compiled
          };
        }),
        lastSave: Date.now()
      }
      window.localStorage.setItem("state", JSON.stringify(state));
    },
    loadAccounts() {
      var allAccounts = []
      var accounts = []
      var self = this
      function getAccounts() {
        window.$syncer.getAccounts(function(resp) {
            console.log('allAccounts', resp)
            self.allAccounts = resp
        })
        // chrome.extension.sendMessage(
        //   {
        //     action: 'getAccount',
        //   },
        //   function (resp) {
        //     console.log('allAccounts', resp)
        //     self.allAccounts = resp
        //   }
        // )
      }
      getAccounts()
    },

    deployCode() {
      var driverName = this.currentEditFile.fileName.split('.')[0]
      var driverCode = this.currentEditFile.content;
      // console.log(this.currentEditFile)
      window.$syncer.updateDriver({
        name: driverName,
        code: driverCode,
        dev: true,
        patch: true
      })
    },

    async doSubmit() {
      var self = this
      function getPost() {
        var post = {}
        post.title = self.currentArtitle.title
        post.content = self.$refs.editor.d_render
        post.markdown = self.currentArtitle.content
        // post.thumb = document.body.getAttribute('data-msg_cdn_url');
        // post.desc = document.body.getAttribute('data-msg_desc');
        console.log(post)
        return post
      }

      var selectedAc = this.allAccounts.filter((a) => {
        return a.checked
      })

      // console.log(selectedAc, this.$refs.editor.d_render);
      // return;
      this.$message('准备同步')
       window.$syncer.addTask({
           post: getPost(),
           accounts: selectedAc,
       }, function(status) {
           self.taskStatus = status
           console.log('status', status)
       }, function(){
           console.log('send')
       })

    //   chrome.extension.sendMessage(
    //     {
    //       action: 'addTask',
    //       task: {
    //         post: getPost(),
    //         accounts: selectedAc,
    //       },
    //     },
    //     function (resp) {}
    //   )

      this.submitting = true
      this.taskStatus = {}
    },




    open(item) {
      this.currentArtitle = item
    },
    async imgAdd(pos, $file) {
      // var dri = new Segmentfault();
    //   var dri = new Juejin()
    //   var finalUrl = await dri.uploadFileByForm($file)
    var sortOrderTypes = [
        "weixin",
        "zhihu",
        "jianshu",
        "toutiao",
        "weibo",
        "douban",
        "segmentfault"
    ].map(_ => this.allAccounts.filter(a => a.type === _)[0]).filter(_ => _);

    if(sortOrderTypes.length === 0) {
        this.$message('当前未登陆任何自媒体平台，无法自动上传图片')
        return;
    }

    var base64Url = await toBase64($file);
    var accountCurrent = sortOrderTypes[0];
    var actionData = {
        src: base64Url,
        account: accountCurrent
    }
    console.log('actionData', actionData);
    window.$syncer.uploadImage(actionData, (res) => {
        console.log('res', res)
        if(accountCurrent.type === 'zhihu') {
          res.result.url = [res.result.url, '_r.jpg'].join('');
        }
        this.$refs.editor.$img2Url(pos, res.result.url)
    })
    console.log('imgAdd', pos, $file, sortOrderTypes, this.allAccounts)
    //   this.$refs.editor.$img2Url(pos, finalUrl)
    },
  },
}
</script>
<style>


.article-list {
  height: 100%;
  width: 350px;
}


.v-note-wrapper {
    padding-top: 110px;
}

.article-all {
  color: #878787;
  height: 100%;
  width: 350px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  margin-top: 110px;
}

#app,
html,
body,
.editor-wrapper {
  height: 100%;
  overflow: hidden;
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
  z-index: 3;
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
  border-left: none !important;
  box-sizing: border;
}

.top-tools,
.post-title {
  position: absolute;
  z-index: 1502;
  top: 60px;
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
  position: absolute;
  right: 15px;
  top: 12px;
  z-index: 888;
}

.all-pubaccounts {
}

.account-item img {
  margin-right: 5px;
}

.account-item {
  height: 36px;
  line-height: 36px;
  padding: 0 15px;
  font-size: 14px;
}

.header-bar {
    height: 60px;
    line-height: 42px;;
    /* position: absolute; */
    width: 100%;
    border: 1px solid #ddd;
    z-index: 888;
}

.header-bar a:hover {
    text-decoration: none;
}
</style>