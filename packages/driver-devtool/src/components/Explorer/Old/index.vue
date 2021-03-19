<template>
  <div id="app" class="app">
    <router-view v-if="extensionInstalled"></router-view>
    <loading v-else :showDownload="checkTimes > 3" />
  </div>
</template>

<script>
import Loading from './components/Explorer/Loading.vue'
import './style/main.css'

// check Extension installed
export default {
  components: { Loading },
  data() {
    return {
      extensionInstalled: false,
      checkTimes: 0,
    }
  },
  created() {
    this.pollCheckExtension()
  },
  methods: {
    ...files,
    addLog(args, category = 'inspect') {
      // if(this.logs.length > 60) {
      //   this.logs = this.logs.slice(-60, this.logs.length)
      // }
      console.log('add log', this.logs.length)
      this.logs.push({
        uid: Date.now() + Math.floor(Math.random() * 10000),
        time: Date.now(),
        cat: category,
        content: args
          .map((_) => {
            if (typeof _ == 'object') return JSON.stringify(_)
            return _
          })
          .join('\t'),
      })
      // this.$forceUpdate()
      // console.log(this.rencetLogs[this.rencetLogs.length -1])
      this.$nextTick(() => {
        this.goBottom()
      })
    },
    addDebugLog(args) {
      return this.addLog(args, 'debug')
    },
    goBottom() {
      if (this.$refs.logContainer) {
        this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight
      }
    },
    afterExtension() {
      this.loadState()
      this.$nextTick((_) => {
        this.initFileManager()
        this.initEditor()
        this.editorAfterProjectLoad()
      })
    },
    loadState() {
      var state = window.localStorage.getItem('state')
      if (state) {
        state = JSON.parse(state)
        if (!state.files.length) {
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
        files: this.files.map((data) => {
          return {
            fileName: data.fileName,
            content: data.content,
            isLeader: data.isLeader,
            hexData: data.hexData,
            compiled: data.compiled,
          }
        }),
        lastSave: Date.now(),
      }
      window.localStorage.setItem('state', JSON.stringify(state))
      console.log('enableAutoDeploy', this.enableAutoDeploy)
      if (this.enableAutoDeploy) {
        console.log('deploy after save')
        try {
          this.throttleDeployCode(true)
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
      var driverCode = this.currentEditFile.content
      // console.log(this.currentEditFile)
      const deployResult = await new Promise((resolve, reject) => {
        window.$syncer.updateDriver(
          {
            name: driverName,
            code: driverCode,
            dev: true,
            patch: true,
          },
          (res) => {
            console.log('updateDriver.res', res)
            resolve(res.result)
          }
        )
      })

      if (deployResult.status) {
        // 第一次部署成功后，自动部署
        this.enableAutoDeploy = true
      }

      if (!silent) this.addDebugLog([deployResult])
    },

    async runCode({ testSync = false, forceAccount = false }) {
      const targetAccount = {
        type: this.currentDriverName,
      }
      // test find account
      var callArgs = {
        methodName: 'getMetaData',
        account: {
          type: this.currentDriverName,
        },
      }
      var accountResult = await new Promise((resolve, reject) => {
        window.$syncer.magicCall(callArgs, (res) => {
          resolve(res)
        })
      })

      this.addDebugLog([accountResult])
      console.log('accountResult', accountResult)
      if (accountResult.error) {
        return
      }

      if (forceAccount) {
        return
      }

      // test image upload
      var articleFiles = this.files.filter((_) => _.fileName == 'article.json')
      if (articleFiles.length == 0) {
        alert('请创建一个名为“article.json”的json文件作为测试文章数据')
        return
      }

      var articleData = JSON.parse(articleFiles[0].content)
      this.addDebugLog(['测试图片上传'])
      var testImageSrc =
        articleData.thumnail ||
        'https://mmbiz.qpic.cn/mmbiz_jpg/VUsUpGDa4qdFYthOpjEqaqDPnS3WVhTKToFr9cPhObPwEw1NP5fQLNrqqjIqOxZRppCibZchwWkqh7zia3lEhoDQ/0?wx_fmt=jpeg'
      var actionData = {
        src: testImageSrc,
        account: targetAccount,
      }

      const uploadResult = await new Promise((resolve, reject) => {
        window.$syncer.uploadImage(actionData, (res) => {
          console.log('handleImageUpload.res', res)
          resolve(res)
        })
      })

      this.addDebugLog([uploadResult])

      if (testSync) {
        // test article publish
        window.$syncer.addTask(
          {
            post: {
              title: articleData.title,
              content: articleData.content,
            },
            accounts: [targetAccount],
          },
          function (status) {
            // self.taskStatus = status
            console.log('status', status)
          },
          function () {
            console.log('send')
          }
        )
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
  line-height: 42px;
  /* position: absolute; */
  width: 100%;
  border-bottom: 1px solid #ddd;
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

#editor .code-area {
  height: calc(100% - 0.5px);
}

#editor.hasLog #console-area,
#editor.hasLog .gutter {
  display: block;
}

#editor.hasLog .code-area {
  height: calc(70% - 0.5px);
}
</style>
