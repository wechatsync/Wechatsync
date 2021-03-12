// import vm from "../../vm/vm";
import Sval from 'sval'

export function getDriverProvider(code) {
  const options = {
    // ECMA Version of the code (5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019)
    ecmaVer: 2019,
    // Whether the code runs in a sandbox
    sandBox: true,
  }

  var axios = require('axios')
  var juice = require('juice/client')
  var draftJs = require('draft-js')
  var htmlToDraft = require('html-to-draftjs').default
  // window.draftJs = draftJs

  const interpreter = new Sval(options)
  const sanbox = {
    draftJs: draftJs,
    htmlToDraft: htmlToDraft,
    console: console,
    $: $,
    DOMParser: DOMParser,
    document: document,
    axios: axios,
    Blob: Blob,
    Promise: Promise,
    md5: md5,
    juice: juice,
    setCache: setCache,
    initliazeFrame: initliazeFrame,
    requestFrameMethod: requestFrameMethod,
    //   window: window
  }

  for (var k in sanbox) {
    interpreter.import(k, sanbox[k])
  }
  // const context = vm.createContext(sanbox);
  // const instance = vm.runInContext(code, context);
  console.log(code)
  interpreter.run(code)

  return interpreter.exports
}

window.initliazeDriver = initliazeDriver

export function initliazeDriver() {
  return new Promise((resolve, reject) => {
    function createDriver(driverRemote) {
      // console.log(window.driver);
      const code = driverRemote ? driverRemote : window.driver
      const driver = getDriverProvider(code)
      resolve(driver)
    }

    chrome.storage.local.get(['driver'], function (result) {
      createDriver(result.driver)
    })
    // return driver;
  })
}

function setCache(name, value) {
  var d = {};
  d[name] = value;
  chrome.storage.local.set(d,
    function() {
      console.log('cachhe seted')
      // loadDriver()
    }
  )
}

var segIframe = null
var abb = {}
var frameStack = {}

window.onmessage = e => {
  try {
    var action = JSON.parse(e.data)
    if (action.eventId && abb[action.eventId]) {
      abb[action.eventId](action.err, action.data)
    }
  } catch (e) {}
}

function requestFrameMethod(d, name) {
  return new Promise((resolve, reject) => {
    var evtId = Date.now() + Math.random()
    d.eventId = evtId
    abb[evtId] = function(err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    }

    var callFrame = frameStack[name]
    callFrame.contentWindow.postMessage(JSON.stringify(d), '*')
  })
}

function initliazeFrame(src, type, forceOpen) {
  if (!frameStack[type]) {
     if (!forceOpen) {
       frameStack[type] = document.createElement('iframe')
       frameStack[type].src = src || 'https://segmentfault.com/write?freshman=1'
       document.body.append(frameStack[type])
     } else {
       window.open(src)
     }
  }
}

window.setCache = setCache
window.requestFrameMethod = requestFrameMethod
window.initliazeFrame = initliazeFrame