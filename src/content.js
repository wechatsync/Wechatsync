var unsafeWindow

setTimeout(function () {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML =
    "if(typeof msg_desc != 'undefined') { document.body.setAttribute('data-msg_desc', msg_desc );document.body.setAttribute('data-msg_title', msg_title);document.body.setAttribute('data-msg_cdn_url', msg_cdn_url); }"
  document.head.appendChild(script)
  document.head.removeChild(script)
}, 50)

console.log('accounts', accounts)
function getPost() {
  var post = {}
  post.title = document.body.getAttribute('data-msg_title')
  post.content = $('#js_content').html()
  post.thumb = document.body.getAttribute('data-msg_cdn_url')
  post.desc = document.body.getAttribute('data-msg_desc')
  post.link = window.location.href
  console.log(post)
  return post
}

function extractUrlValue(key, url) {
  if (typeof url === 'undefined') url = window.location.href
  var match = url.match('[?&]' + key + '=([^&]+)')
  return match ? match[1] : null
}


var isSinglePage = window.location.href.indexOf('mp.weixin.qq.com/s') > -1
if (isSinglePage) {
  //   setTimeout(() => {
  //     getPost();
  //   }, 3000);
  var div = $(
    "<div class='sync-btn' style='position: fixed; left: 0; right: 0;top: 68px;width: 950px; margin-left: auto;margin-right: auto;'></div>"
  )
  div.append(
    '<div  data-toggle="modal" data-target="#exampleModalCenter" style=\'    font-size: 14px;border: 1px solid #eee;width: 105px; text-align: center; box-shadow: 0px 0px 1px rgba(0,0,0, 0.1);border-radius: 5px;padding: 5px; cursor: pointer;    background: rgb(0, 123, 255);color: white;\'>同步该文章</div>'
  )

  function afterGet() {
    var post = getPost()
    var html = ''
    accounts = allAccounts
    var supportAccounts = allAccounts.filter((item) => {
      if (!item.supportTypes) return true
      return item.supportTypes.indexOf('html') > -1
    })

    supportAccounts.forEach((account, index) => {
      html +=
        `
            <div class="form-check mb-1">
  <input class="form-check-input" type="checkbox" value="` +
        account.uid +
        `" name="submit_check" id="defaultCheck` +
        index +
        `">
  <label class="form-check-label" for="defaultCheck` +
        index +
        `">
  <img src="` +
        (account.icon
          ? account.icon
          : chrome.extension.getURL('images/wordpress.ico')) +
        `" class="icon" height="20" style="vertical-align: -3px;height: 20px !important"> 
  ` +
        account.title +
        `
  </label>
</div>
            `
    })

    var con =
      `
        <div class="media">
        <img class="align-self-center mr-3" src="` +
      post.thumb +
      `" width="150" alt="Generic placeholder image">
        <div class="media-body">
          <h5 class="mt-0" style="font-weight:bold">` +
      post.title +
      `</h5>
          <p>` +
      post.desc +
      `</p>
        </div>
      </div>

      <hr>
      <h6>账号</h6>
      <div id="syncd-users">
      ` +
      html +
      `
      </div>

        `

    $('#exampleModalCenter .modal-body').html('')
    $('#exampleModalCenter .modal-body').append(con)
    console.log('clicka')
    restoreAndAutodCheckd();
  }
  div.click(function () {
    getAccounts(() => {
      afterGet()
    })
  })
  $('#page-content').append(div)
}

var html = `
<!-- Modal -->
<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document" style="color: #444;">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLongTitle">同步文章</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="closesyncmodl">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal" style="font-size: 13px;    line-height: 1.5;">取消</button>
        <button type="button" class="btn btn-primary" style="font-size: 13px;    line-height: 1.5;">同步</button>
      </div>
    </div>
  </div>
</div>
`

$('body').append(html)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponseA) {
  console.log('content.js revice', request)
  try {
    console.log('revice', request)
    if (request.method == 'taskUpdate') {
      buildStatusHtml(request.task)
    }
  } catch (e) {
    console.log(e)
  }
})

function buildStatusHtml(taskStatus) {
  var isNotFirstAppend = $('.alld-pubaccounts').length

  var list = taskStatus.accounts.map((account) => {
    var msg =
      (account.status == 'uploading'
        ? ` <div class="lds-dual-ring"></div>` +
          (account.msg ? account.msg : `同步中`)
        : ``) +
      (account.status == 'failed'
        ? `同步失败, 错误内容：` + account.error
        : ``) +
      (account.status == 'done' && account.editResp
        ? `同步成功 <a
                      href="` +
          account.editResp.draftLink +
          `"
                      style="margin-left: 5px"
                      target="_blank"
                      >查看草稿</a
                    >`
        : ``)
    if (isNotFirstAppend) {
      var obj = $('.' + account.type + '-message')
      if (obj.length) {
        obj.html(msg)
      }
      return msg
    }
    return (
      `<div class="account-item taskStatus">
                 ` +
      (account.icon
        ? ` <img src="` +
          account.icon +
          `" class="icon"
      width="20"
      height="20"
      style="vertical-align: -6px;height: 20px !important"
    />`
        : '') +
      `<span class="name-block">` +
      account.title +
      `</span><span
                  style="margin-left: 15px"
                  class="` +
      account.type +
      `-message ` +
      account.status +
      ` message"
                >
                  ` +
      msg +
      `</span></div>`
    )
  })
  var html =
    `
  <div class="alld-pubaccounts">
  ` +
    list.join('\n') +
    `</div>`

  console.log(list, html)

  // $("#syncd-users").html("");
  if (isNotFirstAppend) {
    // taskStatus.accounts.map(account => {
    // });
  } else {
    $('#syncd-users').html(html)
  }
}

$('#exampleModalCenter .btn-primary').click(function (e) {
  // var listAccount = $('input[name="submit_check"]')
  // var saccounts = []
  // for (let index = 0; index < listAccount.length; index++) {
  //   const element = listAccount[index]
  //   if (element.checked) {
  //     var aa = accounts.filter((t) => {
  //       return t.uid == element.value
  //     })
  //     console.log(accounts, element.value)
  //     saccounts.push(aa[0])
  //   }
  // }
  const saccounts = getAllCheckedAccounts()

  if (!saccounts.length) {
    alert('请选择账号')
    return e.stopPropagation()
  }

  chrome.extension.sendMessage(
    {
      action: 'addTask',
      task: {
        post: getPost(),
        accounts: saccounts,
      },
    },
    function (resp) {
      console.log('addTask return', resp)
    }
  )
  // getCache

  $('#syncd-users').html('等待发布...')
  // $("#closesyncmodl").click();
})

var allAccounts = []
var accounts = []

function getAccounts(cb) {
  chrome.extension.sendMessage(
    {
      action: 'getAccount',
    },
    function (resp) {
      allAccounts = resp
      cb && cb()
    }
  )
}

function saveCheckdStatus(accounts) {
  try {
    localStorage.setItem('_sync_checked_all', JSON.stringify(accounts))
  } catch (e) {

  }
}

function restoreCheckedState() {
  if (localStorage.getItem('_sync_checked_all')) {
    const checkedAccounts = JSON.parse(localStorage.getItem('_sync_checked_all'));
    return checkedAccounts;
  }
  return [];
}

function restoreAndAutodCheckd() {
  var listAccount = $('input[name="submit_check"]')
  var checkedAccounts = restoreCheckedState()
  for (let index = 0; index < listAccount.length; index++) {
    const element = listAccount[index]
    var cAccounts = checkedAccounts.filter(t => {
      return t.uid == element.value
    })
    if (cAccounts.length) {
      element.checked = true
    }
  }
}

function getAllCheckedAccounts() {
  var listAccount = $('input[name="submit_check"]')
  var saccounts = []
  for (let index = 0; index < listAccount.length; index++) {
    const element = listAccount[index]
    if (element.checked) {
      var aa = accounts.filter(t => {
        return t.uid == element.value
      })
      console.log(accounts, element.value)
      saccounts.push(aa[0])
    }
  }
  // if (!saccounts.length) {
  //   alert('请选择账号')
  //   return e.stopPropagation()
  // }
  saveCheckdStatus(saccounts)
  return saccounts
}

// getAccounts();

var isEditorPage =
  window.location.href.indexOf('mp.weixin.qq.com/cgi-bin/appmsg') > -1
if (isEditorPage) {
  // intiEditor();
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = chrome.extension.getURL('autoformat.js')
  script.setAttribute('data-url', chrome.runtime.getURL('templates.html'))
  document.head.appendChild(script)
  // document.head.removeChild(script);
  const editorStatusBar = buildStatusContainer()

  function prepairSubmitTask() {
    const allChecked = getAllCheckedAccounts()
    console.log('prepairSubmitTask', 'syncform-selectbox', allChecked)
    if (!allChecked.length) {
      console.log('selected', 0)
      return
    }
    chrome.extension.sendMessage(
      {
        action: 'parseArticle',
        account: {
          type: 'weixin',
        },
        data: {
          msgId: extractUrlValue('appmsgid'),
        },
      },
      function(resp) {
        editorStatusBar.show();
        $('#syncd-users').html('等待发布...')
        chrome.extension.sendMessage(
          {
            action: 'addTask',
            task: {
              post: resp.article,
              accounts: allChecked,
            },
          },
          function(resp) {
            console.log('addTask return', resp)
          }
        )
        console.log('parseArticle return', resp)
      }
    )
  }

  const observer = new MutationObserver(onMutation)
  observer.observe(document, {
    childList: true,
    subtree: true,
  })

  function onMutation(mutations) {
    const found = []
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (!node.tagName) continue // not an element
        if (node.classList.contains('mass-send__list')) {
          found.push(node)
        } else if (node.firstElementChild) {
          found.push(...node.getElementsByClassName('mass-send__list'))
        }
      }
    }

    if (found.length) {
      console.log('onMutation.found', found)
      initSyncForm()
    }
    // found.forEach(processFilter)
  }

  var _isInted = false
  function initSyncForm() {

    function afterGet() {
    var html = `
        <h6 style="margin-bottom: 12px">同步助手</h6> <div id="syncform-selectbox" style="padding-left: 5px">`
    accounts = allAccounts
    var supportAccounts = allAccounts.filter((item) => {
      if (!item.supportTypes) return true
      return item.supportTypes.indexOf('html') > -1
    })

    supportAccounts.forEach((account, index) => {
      html +=
        `
            <div class="form-check mb-1">
  <input class="form-check-input" type="checkbox" value="` +
        account.uid +
        `" name="submit_check" id="defaultCheck` +
        index +
        `">
  <label class="form-check-label" for="defaultCheck` +
        index +
        `">
  <img src="` +
        (account.icon
          ? account.icon
          : chrome.extension.getURL('images/wordpress.ico')) +
        `" class="icon" height="18" style="height: 20px !important"> 
  ` +
        account.title +
        `
  </label>
</div>
            `
    })


    $('.mass-send__form').append(html + '</div>')
    restoreAndAutodCheckd()
    console.log('html', html)
  }

     getAccounts(() => {
       afterGet()
       setTimeout(() => {
         $('.mass-send__footer .weui-desktop-btn_primary').click(() => {
           console.log('clicked');
           getAllCheckedAccounts();
           (function waitUntil() {
             const confirmDialogs = $('.weui-desktop-dialog__wrp').filter(
               function() {
                 return (
                   $(this)
                     .text()
                     .indexOf('开始群发后无法撤销') > -1
                 )
               }
             )
             if (confirmDialogs.length) {
               confirmDialogs.find('.weui-desktop-btn_primary').click(() => {
                 console.log('btn clicked')
                 prepairSubmitTask()
               })
               return
             }
             setTimeout(waitUntil, 300)
           })()
          
         })
       }, 100);
     })

    
    console.log('initSyncForm', allAccounts)
  }
}


function buildStatusContainer() {
  const template = `<div class="weui-desktop-dialog" style="position: fixed;
    right: -25px;
    top: 25px;
    min-width: 350px;
    width: 350px;
    z-index: 99999;">
    <div class="weui-desktop-dialog__hd" style="
    line-height: 50px;
    height: 50px;
">
  <h3 class="weui-desktop-dialog__title">同步助手</h3> 
    <button class="weui-desktop-icon-btn weui-desktop-dialog__close-btn"><svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M10.01 8.996l7.922-7.922c.086-.086.085-.21.008-.289l-.73-.73c-.075-.074-.208-.075-.29.007L9 7.984 1.077.062C.995-.02.863-.019.788.055l-.73.73c-.078.078-.079.203.007.29l7.922 7.92-7.922 7.922c-.086.086-.085.212-.007.29l.73.73c.075.074.207.074.29-.008l7.92-7.921 7.922 7.921c.082.082.215.082.29.008l.73-.73c.077-.078.078-.204-.008-.29l-7.921-7.921z"></path></svg></button></div>
    <div style="    width: 100%;
    min-height: 300px;
    background: white;">
      <div id="syncd-users" style="padding: 0 32px"></div>
    </div>
  </div>`
  const wrapper = $(template)
  $('body').append(wrapper)
  wrapper.hide();
  wrapper.find('.weui-desktop-dialog__close-btn').click(() => {
    wrapper.hide();
  })
  return wrapper;
}


