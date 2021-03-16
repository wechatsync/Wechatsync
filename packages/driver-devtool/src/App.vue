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
            <a class="ai-button" @click="runCode({ forceAccount: true })">
              <v-icon name="user-alt" scale="0.8"/>账号识别
            </a>
          </div>
          <div class="action-item" id="run-code">
            <a class="ai-button" @click="runCode({ testSync: false })">
              <v-icon name="upload" scale="0.8"/>图片上传
            </a>
          </div>
          <div class="action-item" id="run-code">
            <a class="ai-button" @click="runCode({ testSync: true })">
              <v-icon name="sync" scale="0.8"/>文章同步
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
        <div id="editor" :class="{hasLog: logs.length }">
          <div class="pannel-main code-area">
            <codemirror
                  v-model="currentEditFile.content"
                  :options="getFileCodeOptions(currentEditFile)"
                >
            </codemirror>
          </div>
          <div class="gutter gutter-vertical" style="height: 1px;"></div>
          <div class="pannel-main" style="height: calc(30% - 0.5px);" id="console-area">
              <div class="windowLabelCont">
                <span class="windowLabel">Console</span>
              </div>
              <div class="vue-codemirror">
                <div class="CodeMirror cm-s-monokai">
                  <div class="results-container" ref="logContainer">
                    <div class="console-logs">
                        <li v-for="log in rencetLogs" :class="'log-'+log.cat" :key="log.guid"><pre v-highlightjs>{{ log.content }}</pre></li>
                    </div>
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
      enableAutoDeploy: false,
      logs: [],
      files: [],
      currentEditFile: {},
      currentEditFileName: "",
      editorFiles: [],
      visible: false,
      submitting: false,
      value: '',
      extensionInstalled: false,
      checkCount: 0,
      allAccounts: [],
      taskStatus: {},
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
    var self = this;
    ;(function check() {
          self.extensionInstalled = typeof window.$syncer != 'undefined';
          self.checkCount++;
          if(self.extensionInstalled) {
            window.$syncer.startInspect(function(args) {
              console.log('log', args, 'self.addLog', self.addLog)
              self.addLog(args);
            });
            self.loadAccounts()
            self.afterExtension()
            return
          }
          setTimeout(check, 800);
    })();

    window.goBottom = this.goBottom
  },
  computed: {
    currentDriverName() {
      return this.currentEditFile && this.currentEditFile.fileName.split('.')[0]
    },
    rencetLogs() {
      return this.logs
    }
  },
  methods: {
    ...files,
    addLog(args, category = 'inspect') {
      // if(this.logs.length > 60) {
      //   this.logs = this.logs.slice(-60, this.logs.length)
      // }
      console.log('add log', this.logs.length)
      this.logs.push({
        uid: Date.now() + (Math.floor(Math.random() * 10000)),
        time: Date.now(),
        cat: category,
        content: args.map(_ => {
          if(typeof _ == 'object') return JSON.stringify(_)
          return _;
        }).join("\t")
      });
      // this.$forceUpdate()
      // console.log(this.rencetLogs[this.rencetLogs.length -1])
      this.$nextTick(() => {
        this.goBottom();
      })
    },
    addDebugLog(args) {
      return this.addLog(args, 'debug')
    },
    goBottom() {
      if(this.$refs.logContainer) {
        this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight;
      }
    },
    afterExtension() {
      this.loadState();
      this.$nextTick(_ => {
        this.initFileManager();
        this.initEditor();
        this.editorAfterProjectLoad()
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
      console.log('enableAutoDeploy', this.enableAutoDeploy)
      if(this.enableAutoDeploy) {
        console.log('deploy after save')
        try {
          this.deployCode(true);
        } catch (e) {}
      }
    },
    loadAccounts() {
      var allAccounts = []
      var accounts = []
      var self = this
      function getAccounts() {
        // window.$syncer.getAccounts(function(resp) {
        //     console.log('allAccounts', resp)
        //     self.allAccounts = resp
        // })
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

    async deployCode(silent = false) {
      var driverName = this.currentEditFile.fileName.split('.')[0]
      var driverCode = this.currentEditFile.content;
      // console.log(this.currentEditFile)
      const deployResult = await new Promise((resolve, reject) => {
        window.$syncer.updateDriver({
          name: driverName,
          code: driverCode,
          dev: true,
          patch: true
        }, (res) => {
          console.log('updateDriver.res', res)
          resolve(res.result);
       })
      }); 

      if(deployResult.status) {
        // 第一次部署成功后，自动部署
        this.enableAutoDeploy = true
      }

      if(!silent) this.addDebugLog([deployResult])
    },

    async runCode({ testSync = false, forceAccount = false }) {
      
      const targetAccount = {
        type: this.currentDriverName
      }
      // test find account
      var callArgs = {
        methodName: 'getMetaData',
        account: {
          type: this.currentDriverName
        }
      }
      var accountResult = await new Promise((resolve, reject) => {
        window.$syncer.magicCall(callArgs, res => {
          resolve(res)
        })
      })

      this.addDebugLog([accountResult])
      console.log('accountResult', accountResult)
      if(accountResult.error) {
        return
      }

      if(forceAccount) {
        return
      }

      // test image upload
      var articleFiles = this.files.filter(_ => _.fileName == 'article.json');
      if(articleFiles.length == 0) {
        alert('请创建一个名为“article.json”的json文件作为测试文章数据')
        return
      }
      
      var articleData = JSON.parse(articleFiles[0].content)
      this.addDebugLog(['测试图片上传'])
      var testImageSrc = articleData.thumnail || 'https://mmbiz.qpic.cn/mmbiz_jpg/VUsUpGDa4qdFYthOpjEqaqDPnS3WVhTKToFr9cPhObPwEw1NP5fQLNrqqjIqOxZRppCibZchwWkqh7zia3lEhoDQ/0?wx_fmt=jpeg';
      var actionData = {
        src: testImageSrc,
        account: targetAccount
      }

      const uploadResult = await new Promise((resolve, reject) => {
          window.$syncer.uploadImage(actionData, (res) => {
              console.log('handleImageUpload.res', res)
              resolve(res.result);
          })
      }); 

      this.addDebugLog([uploadResult])

      if(testSync) {
        // test article publish
        window.$syncer.addTask({
          post: {
            title: articleData.title,
            content: articleData.content
          },
          accounts: [targetAccount],
        }, function(status) {
            // self.taskStatus = status
          console.log('status', status)
        }, function(){
          console.log('send')
        })
      }
    },
  },
}
</script>
<style>



#app,
html,
body,
.editor-wrapper {
  height: 100%;
  overflow: hidden;
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

 .console-logs {
    /* padding-top: 66px */
}

.console-logs li {
  list-style: none;
  border-bottom: 1px solid #eee;
  padding-left: 20px;
}

.console-logs li pre {
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.console-logs li:first-child {
  /* border-top: 1px solid #eee; */
}

#editor #console-area, 
#editor .gutter {
  display: none;
}

#editor .code-area{
  height: calc(100% - 0.5px);
}


#editor.hasLog #console-area, 
#editor.hasLog .gutter {
  display: block;
}

#editor.hasLog .code-area{
  height: calc(70% - 0.5px);
}

#console-area .windowLabelCont {
  border-bottom: 1px solid #eee;
}
</style>