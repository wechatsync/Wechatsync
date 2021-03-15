console.log('segmenftfault')
function testFunc() {
  console.log('testFunc for segmenftfault')
  window.onmessage = function (evt) {
    if (evt.origin.indexOf('chrome-extension://') > -1) {
      console.log('from extension', evt)
      var action = JSON.parse(evt.data)
      if (action.type == 'sendPostToutiao') {
        ;(async () => {
          try {
            var fData = new FormData()
            for (var k in action.data) {
              fData.append(k, action.data[k])
            }
            var url = action.url || 'https://mp.toutiao.com/mp/agw/article/publish?source=mp&type=article';
            var areq = await window.fetch(url, {
              headers: {},
              referrer: 'https://mp.toutiao.com/profile_v4/graphic/publish',
              referrerPolicy: 'strict-origin-when-cross-origin',
              body: fData,
              method: 'POST',
              mode: 'cors',
              credentials: 'include',
            });
            // var res = await areq.json();
            console.log(areq)
            window.parent.postMessage(
              JSON.stringify({
                eventId: action.eventId,
                data: res,
                err: null,
              }),
              '*'
            )
          } catch (e) {
            console.log('error', e)
            window.parent.postMessage(
              JSON.stringify({
                eventId: action.eventId,
                err: e.toString(),
              }),
              '*'
            )
          }
        })();
      }

      if (action.type == 'sendPost') {
        ;(async () => {
          try {
            // window.webpackJsonp[0][1][0](window, this)
            var a = new FormData()
            for (var k in action.data) {
              a.append(k, action.data[k])
            }
            var res = await $.ajax({
              url: '/api/article/draft/save?_=63fefd2c2515dd098e0e0a4a33a8ecd4',
              method: 'POST',
              data: a,
              processData: !1,
              contentType: !1,
            })
            console.log(res)
            window.parent.postMessage(
              JSON.stringify({
                eventId: action.eventId,
                data: res,
                err: null,
              }),
              '*'
            )
          } catch (e) {
            window.parent.postMessage(
              JSON.stringify({
                eventId: action.eventId,
                err: e.toString(),
              }),
              '*'
            )
          }
        })()
      }
    }
  }
}

// a = document.createElement('iframe')
// a.src ="https://segmentfault.com/write?freshman=1"
// document.body.append(a)
// a.contentWindow.postMessage(JSON.stringify({
//     type: 'sendPost',
//     data: {}
// }), "*")
setTimeout(function () {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML = testFunc.toString() + '; ' + testFunc.name + '();'
  document.head.appendChild(script)
  console.log('injject')
}, 50)
