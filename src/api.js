console.log('segmenftfault')
function testFunc() {
  console.log('testFunc for segmenftfault')
  var poster = {
    version: '1.0',
  }

  var eventCb = {}
  function callFunc(msg, cb) {
    msg.eventID = Math.floor(Date.now() + Math.random() * 100)
    eventCb[msg.eventID] = function (err, res) {
      cb(err, res)
    }
    window.postMessage(JSON.stringify(msg), '*')
  }

  poster.getAccounts = function (cb) {
    callFunc(
      {
        method: 'getAccounts',
      },
      cb
    )
  }

  window.addEventListener('message', function (evt) {
    // console.log('api', evt)
    // console.log('from page', evt)
    try {
      var action = JSON.parse(evt.data)
      if (!action.callReturn) return
      if (action.eventID && eventCb[action.eventID]) {
        eventCb[action.eventID](action)
        delete eventCb[action.eventID]
      }
    } catch (e) {}
  })

  window.$poster = poster
}

setTimeout(function () {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML = testFunc.toString() + '; testFunc();'
  document.head.appendChild(script)
  document.head.removeChild(script)
  console.log('injject')
}, 50)

var allAccounts = []
var accounts = []

function getAccounts() {
  chrome.extension.sendMessage(
    {
      action: 'getAccount',
    },
    function (resp) {
      allAccounts = resp
    }
  )
}

getAccounts()

function sendToWindow(msg) {
  msg.callReturn = true
  window.postMessage(JSON.stringify(msg), '*')
}

window.addEventListener('message', function (evt) {
  if (evt.origin == 'https://www.wechatsync.com') {
    // console.log('from page', evt)
    try {
      var action = JSON.parse(evt.data)
      if (action.method == 'getAccounts') {
        getAccounts()
        sendToWindow({
          eventID: action.eventID,
          accounts: allAccounts,
        })
      }
    } catch (e) {}
  }
})
