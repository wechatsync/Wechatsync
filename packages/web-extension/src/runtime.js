import Sval from 'sval'
import svalScopes from "@wechatsync/drivers/scopes";

function getRuntimeScopes () {
  return {
    ...svalScopes,
    console: console,
    $: $,
    DOMParser: DOMParser,
    document: document,
    Blob: Blob,
    Promise: Promise,
    setCache: setCache,
    initializeFrame: initializeFrame,
    requestFrameMethod: requestFrameMethod,
  };
}

export function initDevRuntimeEnvironment () {
  const scopes = getRuntimeScopes();

  Object.keys(scopes).forEach(key => {
    if (!window.hasOwnProperty(key)) {
      window[key] = scopes[key];
    }
  })
}

export function getDriverProvider(code) {
  const options = {
    // ECMA Version of the code (5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019)
    ecmaVer: 9,
    // Whether the code runs in a sandbox
    sandBox: true,
  }

  const interpreter = new Sval(options)
  const scopes = getRuntimeScopes();

  for (var k in scopes) {
    interpreter.import(k, scopes[k])
  }
  interpreter.run(code)

  return interpreter.exports
}

window.initializeDriver = initializeDriver

export function initializeDriver(conf) {
  return new Promise((resolve) => {
    function createDriver(driverRemote) {
      const code = driverRemote ? driverRemote : window.driver
      const driver = getDriverProvider(code)
      resolve(driver)
    }

    chrome.storage.local.get(['driver'], function (result) {
      if(conf.beforeCreate) {
        conf.beforeCreate(result)
      }
      createDriver(result.driver)
    })
  })
}

function setCache(name, value) {
  var d = {};
  d[name] = value;
  chrome.storage.local.set(d,
    function() {
      console.log('cache set')
      // loadDriver()
    }
  )
}

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

function initializeFrame(src, type, forceOpen) {
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
