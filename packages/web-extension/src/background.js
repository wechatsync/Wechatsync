window.driver = require("./drivers/builtDriverCode").default;
import Store from './db/store'
import { upImage } from './util/image'

import { getGuid } from './util/util'
import { initliazeDriver, getDriverProvider } from './vm/vm'

var axios = require('axios')
var juice = require('juice/client')
var draftJs = require('draft-js')
var localDriver = require('./drivers/driver')

window.htmlToDraft = require('html-to-draftjs').default
window.draftJs = draftJs;

window.axios = axios
window.juice = juice
var service = analytics.getService('syncer')
var tracker = service.getTracker('UA-48134052-13')

let getDriver = localDriver.getDriver
let getPublicAccounts = localDriver.getPublicAccounts


async function setDriver(driver) {
  window.currentDriver = driver
  window.driverMeta = driver.getMeta()
  getDriver = window.currentDriver.getDriver
  getPublicAccounts = async function() {
    var users = await window.currentDriver.getPublicAccounts()
    try {
      users.forEach(publicAccount => {
        console.log('tracker', publicAccount)
        tracker.sendEvent(
          'user',
          publicAccount.type,
          [publicAccount.uid, publicAccount.title].join('-')
        )
      })
    } catch (e) {
      console.log(e)
    }
    return users
  }
  window.getPublicAccounts = getPublicAccounts
  console.log('driver', driver)
}

async function loadDriver() {
  try {
    const driver = await initliazeDriver()
    await setDriver(driver)
    // window.currentDriver = driver
    // window.driverMeta = driver.getMeta()
    // getDriver = window.currentDriver.getDriver
    // getPublicAccounts = async function() {
    //   var users = await window.currentDriver.getPublicAccounts()
    //   try {
    //     users.forEach(publicAccount => {
    //       console.log('tracker', publicAccount)
    //       tracker.sendEvent(
    //         'user',
    //         publicAccount.type,
    //         [publicAccount.uid, publicAccount.title].join('-')
    //       )
    //     })
    //   } catch (e) {
    //     console.log(e)
    //   }
    //   return users
    // }
    // console.log('driver', driver)
  } catch (e) {
    console.log('initliazeDriver failed', e)
  }
  afterDriver()
}



var publicAccounts = []



var db = new Store()
window.db = db
window.loadDriver = loadDriver
console.log(window.db)

function getCookie(name, cookieStr) {
  let arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = cookieStr.match(reg))) {
    return unescape(arr[2])
  } else {
    return ''
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}

class Syner {
  constructor() {
    this.senders = {}
    this.listenRequest()
    this.startWroker()
    this.modifyHeaderIfNecessary()
  }

  modifyHeaderIfNecessary() {
    console.log('modifyHeaderIfNecessary', window.driverMeta)
    var insepectURLs = [
      '*://mp.toutiao.com/mp*',
      '*://card.weibo.com/*',
      '*://mp.weixin.qq.com/*',
      '*://zhuanlan.zhihu.com/api/*',
      // '*://api.bilibili.com/*',
    ]

    if (window.driverMeta && window.driverMeta.inspectUrls) {
      insepectURLs = insepectURLs.concat(window.driverMeta.inspectUrls)
    }

      chrome.webRequest.onBeforeSendHeaders.addListener(
        function(details) {
          console.log('details.requestHeaders', details, details.url)
          // WEIBO API
          try {
            var modifRules = [
              {
                prefix: 'mp.weixin.qq.com/cgi-bin',
                origin: 'https://mp.weixin.qq.com',
                referer: 'https://mp.weixin.qq.com/cgi-bin/appmsg',
              },
              {
                prefix: 'mp.toutiao.com/mp',
                origin: 'https://mp.toutiao.com',
                referer: 'https://mp.toutiao.com/profile_v4/graphic/publish',
              },
            ]

            for (let index = 0; index < modifRules.length; index++) {
              const modifRule = modifRules[index]
              if (details.url.indexOf(modifRule.prefix) > -1) {
                var foundRefereHeader = false
                for (var i = 0; i < details.requestHeaders.length; ++i) {
                  if (details.requestHeaders[i].name === 'Referer')
                    foundRefereHeader = true
                  if (details.requestHeaders[i].name === 'Origin') {
                    details.requestHeaders[i].value = modifRule.origin
                  }
                }
                if (!foundRefereHeader) {
                  details.requestHeaders.push({
                    name: 'Referer',
                    value: modifRule.referer,
                  })
                }
                console.log('details.requestHeaders', modifRule, details)
              } else {
                // console.log('rule not macth', modifRule.prefix, details.url)
              }
            }

            if (details.url.indexOf('https://card.weibo.com/article/v3') > -1) {
              var foundRefereHeader = false
              for (var i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === 'Referer')
                  foundRefereHeader = true
                if (details.requestHeaders[i].name === 'Origin') {
                  details.requestHeaders[i].value = 'https://card.weibo.com'
                }
              }
              if (!foundRefereHeader) {
                details.requestHeaders.push({
                  name: 'Referer',
                  value: 'https://card.weibo.com/article/v3/editor',
                })
              }
              console.log('details.requestHeaders', details)
            }

            //  zhihu xsrf token
            if (details.url.indexOf('zhuanlan.zhihu.com/api') > -1) {
              var cookieHeader = details.requestHeaders.filter(h => {
                return h.name.toLowerCase() == 'cookie'
              })

              if (cookieHeader.length) {
                var cookieStr = cookieHeader[0].value
                var _xsrf = getCookie('_xsrf', cookieStr)
                if (_xsrf) {
                  details.requestHeaders.push({
                    name: 'x-xsrftoken',
                    value: _xsrf,
                  })
                }
                console.log('cookieStr', cookieStr)
              }
              console.log('details.requestHeaders', details)
            }
          } catch (e) {
            console.log('modify headers error', e)
          }

          try {
            window.driverMeta.urlHandler(details)
          } catch (e) {
            console.log('urlHandler', e)
          }

          return { requestHeaders: details.requestHeaders }
        },
        {
          urls: insepectURLs,
        },
        ['blocking', 'requestHeaders', 'extraHeaders',]
      )
  }

  getSender(guid) {
    return this.senders[guid]
  }

  removeSender(guid) {
    if (this.senders[guid]) delete this.senders[guid]
  }

  listenRequest() {
    var self = this
    chrome.runtime.onMessage.addListener(function(
      request,
      sender,
      sendResponseA
    ) {
      if (request.action && request.action == 'getAccount') {
        sendResponseA(db.getAccounts().concat(publicAccounts))
        ;(async () => {
          // if (request.force) {
          publicAccounts = await getPublicAccounts()
          // }
        })()
      }
      if (request.action && request.action == 'addTask') {
        console.log(request)
        request.task.status = 'wait'
        request.task.guid = getGuid()
        db.addTask(request.task)
        // brocast message to the front end
        self.senders[request.task.guid] = sender
        sendResponseA(request.task.guid)
        try {
          var newTask = request.task
          tracker.sendEvent('add', 'link', request.task.post.link)
          tracker.sendEvent(
            'add',
            'title',
            [
              request.task.post.title,
              newTask.accounts.map(account => {
                return [account.type, account.uid, account.title].join('-')
              }),
            ].join(';;')
          )
        } catch (e) {
          console.log(e)
        }
      }

      if (request.action && request.action == 'parseArticle') {
        console.log(request)
        ;(async () => {
          var driver = getDriver(request.account)
          try {
            var article = await driver.getArticle(request.data)
            sendResponseA({
              article: article,
            })
          } catch (e) {
            console.log(e)
          }
        })()
        return true
      }

      if (request.action && request.action == 'getCache') {
        console.log(request)
        ;(async () => {
          chrome.storage.local.get([request.name], function(result) {
            sendResponseA({
              result: result,
            })
          })
        })();
        return true
      }
      
      if (request.action && request.action == 'updateDriver') {
        console.log('updateDriver', request);
        (async () => {
          try {
            var isDevelopment = request.dev;
            var newDriver = getDriverProvider(request.data.code)
            var newDriverMeta = newDriver.getMeta()
            console.log('new version found', newDriverMeta)
            if (isDevelopment) {
              // dynamic reload not store
              setDriver(newDriver)
            } else {
              // if (newDriverMeta.versionNumber > window.driverMeta.versionNumber) {
              chrome.storage.local.set(
                {
                  driver: request.data.code,
                },
                function() {
                  console.log('driver seted')
                  loadDriver()
                }
              )
              console.log('is new driver')
              sendResponseA({
                result: {
                status: 1
              },
              })
            // } else {
            //   sendResponseA({
            //     result: {
            //     status: 0
            //   },
            //   })
            // }
            }
          } catch (e) {
            sendResponseA({
              result: {
                status: 0,
                error: e.toString()
              },
            })
          }
          
        })()
        return true
      }

      if (request.action && request.action == 'callDriverMethod') {
        console.log(request)
        ;(async () => {
          var driver = getDriver(request.data.account )
          var methodName = request.methodName
          try {
            if (methodName === 'uploadImage') {
              var postId = Math.floor(Math.random() * 100000)
              var imgSRC = request.data.src;
              var result = await upImage(
                driver,
                imgSRC,
                postId,
                postId + '.png'
              )
              sendResponseA({
                result: result,
              })
            } else {
              var driverFunc = driver[methodName]
              var article = await driverFunc(request.data)
              sendResponseA({
                article: article,
              })
            }
          } catch (e) {
            console.log(e)
          }
        })()
        return true
      }
    })
  }

  startWroker() {
    var self = this

    ;(function loop() {
      var tasks = db.getTasks()
      tasks.forEach((t, tid) => {
        t.tid = tid
      })
      var notDone = tasks.filter(t => {
        return t.status == 'wait'
      })

      try {
        chrome.browserAction.setBadgeText({
          text: notDone.length + '',
        })
      } catch (e) {}

      var timeOut = tasks.filter(t => {
        return t.status == 'uploading'
      })

      timeOut.forEach(t => {
        // db.editTask(t.tid, {
        //   status: "failed",
        //   msg: "超时"
        // });
      })

      var currentTask = notDone.shift()
      if (!currentTask) {
        setTimeout(loop, 3 * 1000)
        return
      }

      ;(async () => {
        db.editTask(currentTask.tid, {
          status: 'uploading',
          startTime: Date.now(),
        })

        try {
          for (let index = 0; index < currentTask.accounts.length; index++) {
            const account = currentTask.accounts[index]
            try {
              await self.doSync(account, currentTask)
              console.log('doSync done', account)
              chrome.notifications.create(
                'sync_sucess_' + currentTask.tid,
                {
                  type: 'basic',
                  title: '同步成功',
                  message: currentTask.post.title + ' >> ' + account.title,
                  iconUrl: 'images/logo.png',
                },
                function() {
                  window.setTimeout(function() {
                    chrome.notifications.clear(
                      'sync_sucess_' + currentTask.tid,
                      function() {}
                    )
                  }, 4000)
                }
              )

              var link = ''
              if (account.type != 'wordpress') {
                link = account.editResp.draftLink
              } else {
                link = account.params.wpUrl + '?p=' + account.post_id
              }

              console.log(account.editResp, link)
              tracker.sendEvent('sync', 'sucess', link)
            } catch (e) {
              console.log(e)

              var msgErro = e ? e.toString() : '未知错误'
              chrome.notifications.create(
                'sync_error_' + currentTask.tid,
                {
                  type: 'basic',
                  title: '同步失败',
                  message: msgErro,
                  iconUrl: 'images/logo.png',
                },
                function() {
                  window.setTimeout(function() {
                    chrome.notifications.clear(
                      'sync_error_' + currentTask.tid,
                      function() {}
                    )
                  }, 4000)
                }
              )

              account.status = 'failed'
              account.error = msgErro

              db.editTask(currentTask.tid, {
                accounts: currentTask.accounts,
              })

              tracker.sendEvent('sync', 'error', msgErro)
              tracker.sendEvent(
                'sync',
                account.type + '-error',
                [currentTask.post.link, +msgErro].join(':')
              )

              tracker.sendEvent(
                'sync-' + window.driverMeta.versionNumber,
                'error',
                msgErro
              )
            }
          }
        } catch (e) {
          console.log(e)
          db.editTask(currentTask.tid, {
            status: 'failed',
            msg: e + '',
          })
        }
      })()
      setTimeout(loop, 2 * 1000)
    })()
  }

  async doSync(account, currentTask) {
    var driver = getDriver(account)
    var postId
    account.status = 'uploading'
    db.editTask(currentTask.tid, {
      accounts: currentTask.accounts,
    })

    var postContent = JSON.parse(JSON.stringify(currentTask.post))

    try {
      if (driver.preEditPost) {
        console.log('driver.preEditPost')
        await driver.preEditPost(postContent)
      } else {
        console.log('driver.preEditPost skip')
      }
    } catch (e) {
      console.log('preEditPost', e)
    }

    console.log('driver instance', driver)
    var addResp = await driver.addPost(
      Object.assign(
        {
          post_title: postContent.title,
          post_author: account.params ? account.params.wpUser : '',
          post_content:  postContent[`content_${account.type}`] ?  postContent[`content_${account.type}`] : postContent.content,
        },
        postContent
      ),
      driver
    )

    if (addResp.status != 'success') {
      throw Error('create post failed')
      return
    }

    postId = addResp.post_id ? addResp.post_id : addResp.response
    account.post_id = postId
    var doc = $(postContent.content)
    var imags = doc.find('img')
    console.log('upload images', imags.length)
    account.totalImages = imags.length
    account.uploadedCount = 1
    account.msg = '准备上传' + imags.length + '张图片'

    db.editTask(currentTask.tid, {
      accounts: currentTask.accounts,
    })

    var imageMaxRetry = 10

    for (let mindex = 0; mindex < imags.length; mindex++) {
      const img = imags.eq(mindex)
      let imgSRC = img.attr('data-src')
      if (!imgSRC) {
        imgSRC = img.attr('data-original')
      }

      if (!imgSRC) {
        imgSRC = img.attr('src')
      }

      if (!imgSRC) {
        account.uploadedCount++
        continue
      }
      console.log('upload image start', imgSRC)

      var maxRetry = 3

      for (let index = 0; index < imageMaxRetry; index++) {
        console.log('imageMaxRetry', index)
        try {
          const newSrc = await upImage(
            driver,
            imgSRC,
            postId,
            postId + mindex + '.png'
          )
          img.attr('src', newSrc.url)
          if (driver.editImg) {
            try {
              driver.editImg(img, newSrc)
            } catch (e) {}
          }
          console.log('upload image done', newSrc.url, newSrc)
          break
        } catch (e) {}

        account.msg =
          '正在上传第' +
          account.uploadedCount +
          '张图片， 总共' +
          imags.length +
          '张图片; 上传失败，1秒后准备重试第' +
          (index + 1) +
          '次'
        db.editTask(currentTask.tid, {
          accounts: currentTask.accounts,
        })
        await wait(1000)
      }
      account.uploadedCount++
      account.msg =
        '正在上传第' +
        account.uploadedCount +
        '张图片， 总共' +
        imags.length +
        '张图片'
      db.editTask(currentTask.tid, {
        accounts: currentTask.accounts,
      })
    }

    console.log('upload images done')
    postContent.content = $('<div>')
      .append(doc.clone())
      .html()

    // 设置缩略图
    var post_thumbnail = null
    var editInput = {
      post_title: postContent.title,
      post_content: postContent[`content_${account.type}`]
        ? postContent[`content_${account.type}`]
        : postContent.content,
    }

    if (postContent.thumb) {
      var maxRetry = 3
      for (let index = 0; index < imageMaxRetry; index++) {
        console.log('imageMaxRetry', index)
        try {
          post_thumbnail = await upImage(
            driver,
            postContent.thumb,
            postId,
            postId + 'thumb.png'
          )
          editInput = Object.assign(editInput, {
            post_thumbnail: post_thumbnail.id,
            post_thumbnail_raw: post_thumbnail,
          })
          break
        } catch (e) {
          console.log('upload thumb failed', e)
        }
      }
    }
    console.log('update last', editInput)

    var finalPostId = account.params ? parseInt(postId) : postId
    var editResp = await driver.editPost(finalPostId, editInput)

    account.editResp = editResp
    account.status = 'done'

    db.editTask(currentTask.tid, {
      accounts: currentTask.accounts,
    })

    console.log('editResp status')
    if (editResp.status == 'success') {
      db.editTask(currentTask.tid, {
        status: 'done',
        endTime: Date.now(),
      })
    }
  }
}

// import vm from "../vm/vm";
// const sanbox = { console: console };
// const context = vm.createContext(sanbox);
// try {
//   var instance = vm.runInContext(`console.log("vm Hello world"); module.exports = { a: function() { console.log('method a')}}`, context);
//   console.log(instance);
//   instance.a();
// } catch (err) {
//   console.error(err);
// }

console.log('background.js')
function afterDriver() {
  var syncer = new Syner()
  window.syncer = syncer
  ;(async () => {
    publicAccounts = await getPublicAccounts()
  })()
}

;(async () => {
  console.log('WECHAT_ENV', process.env.WECHAT_ENV)
  if (process.env.WECHAT_ENV == 'production') {
    loadDriver()
  } else {
    window.driverMeta = localDriver.getMeta()
    afterDriver()
    console.log('dvelopment driver')
  }
})();
var sharedContextmenuId = null
function createSharedContextmenu() {
  if (!sharedContextmenuId) {
    sharedContextmenuId = chrome.contextMenus.create({
      id: 'getAttrile',
      title: '提取文章并同步',
      contexts: ['all'],
      onclick: function(info, tab) {
        // var text = info.selectionText;
        // text = text || tab.title;
        var link = info.linkUrl || info.frameUrl || info.pageUrl
        // var image_rex = /\.(jpg|png|gif|bmp)$/gi;
        // if (
        //   link.toLowerCase().indexOf("javascript") === 0 ||
        //   link === info.srcUrl ||
        //   image_rex.test(link)
        // ) {
        //   link = info.frameUrl || info.pageUrl;
        // }
        chrome.tabs.sendRequest(tab.id, {
          method: 'fetchArticle',
          text: tab.title,
          link: link,
          info: info,
        })
      },
    })
  }
}

function removeSharedContextmenu() {
  if (sharedContextmenuId) {
    chrome.contextMenus.remove(sharedContextmenuId)
    sharedContextmenuId = null
  }
}

createSharedContextmenu()


// chrome.tabs.executeScript(
//   tab.id,
//   {
//     code: args.code,
//   },
//   function(res) {
//     chrome.tabs.remove(tab.id)
//     console.log('sendResponseA', res)
//     sendResponseA({
//       error: null,
//       result: res,
//     })
//   }
// )