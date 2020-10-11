var pageURL = null
function intiEditor() {
  var $control = $('#js_media_list')
  var inPreviewMode = false
  var originalCode = null
  var $btn = $(
    `<li class="tpl_item jsInsertIcon edui-default" id="js_editor_autoformat" style=""></li>`
  )
  var $btnI = $(`<i style="
      display: inline-block;
      vertical-align: middle;
      min-width: 32px;
      text-align: center;
      font-size: 12px;
      color: #353535;
      font-style: normal;
      box-sizing: border-box;
      /* font-weight: 600; */
  ">一键<br>排版</i>`)

  var TEMPLATE = {
    // 正文默认字体大小
    font: {
      size: '15px',
    },
    autodetect: {
      // 自动检测加粗的段落为h2
      strongAsHeader: true,
    },
    // 图片样式
    image: {
      styles: [
        {
          name: 'margin-top',
          value: '5px',
        },
        {
          name: 'margin-bottom',
          value: '25px',
        },
      ],
    },
    // 段落样式
    paragraph: {
      styles: [
        {
          name: 'font-size',
          value: '15px',
        },
        {
          name: 'margin-bottom',
          value: '30px',
        },
      ],
    },

    // 标题样式
    h2: {
      // 自定义模板
      custom: `
      <section style="display:flex;align-items: center;justify-content: center; margin-bottom: 25px"><section style="width:30px;height:30px;border-radius:100%;border:1px solid rgb(248,212,151);margin-top: -30px;margin-right:-15px;"></section><section style="padding:5px 20px;background:rgb(57,207,202);"><p class="white title" style="font-size:18px;color:rgb(255,255,255);min-width:1em;">{value}</p></section><section style="width:20px;height:20px;border-radius:100%;border:1px solid rgb(248,212,151);margin-left:5px;"></section></section>
      `,
      styles: [
        {
          name: 'font-size',
          value: '20px',
        },
        {
          name: 'margin-bottom',
          value: '30px',
        },
        {
          name: 'text-align',
          value: 'center',
        },
        {
          name: 'font-weight',
          value: 'bold',
        },
      ],
    },
    // 试图样式
    viewport: {
      styles: [
        {
          name: 'margin',
          value: '0 8px 0 8px',
        },
      ],
    },
    // 底部签名
    footer: `
      <section style="margin-right: 8px;margin-left: 8px;max-width: 100%;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;"><img class="rich_pages " data-cropselx1="0" data-cropselx2="558" data-cropsely1="0" data-cropsely2="310" data-ratio="0.5555555555555556" data-s="300,640" data-type="png" data-w="720" data-src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqKaCs2icnhHqUvt9mYicREVQXvMwho2tUXEwxiaRdy6L9MWwU0VxqnjcrQ/640?wx_fmt=png" style="box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; width: 379px !important; height: auto !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqKaCs2icnhHqUvt9mYicREVQXvMwho2tUXEwxiaRdy6L9MWwU0VxqnjcrQ/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1" crossorigin="anonymous" data-fail="0"></section>
      <p style="max-width: 100%;min-height: 1em;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;"><br></p>
      <p style="text-align: center;"><br></p>
      <p style="text-align: center;"><img class="rich_pages " data-ratio="0.6277777777777778" data-s="300,640" data-src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqpUbaZWJXwQEFjRicB8dgUSfmenHCefyfTI7aibcw1ZaicxhjkFBOiceJhw/640?wx_fmt=png" data-type="png" data-w="720" style="width: 379px !important; height: auto !important; visibility: visible !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqpUbaZWJXwQEFjRicB8dgUSfmenHCefyfTI7aibcw1ZaicxhjkFBOiceJhw/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1" crossorigin="anonymous" data-fail="0"></p>
      <p style="text-align: center;"><br></p>
      <section style="text-align: center;margin-left: 8px;margin-right: 8px;"><img class="rich_pages" data-ratio="0.03333333333333333" data-s="300,640" data-src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGt4dyAKGmD6Mibvd1Gbz6AsexqSbL3otgVVhvkGaBxWH6gKzkPrxq6PiceT7ibsyiaHTotSooNCY4cBw/640?wx_fmt=png" data-type="png" data-w="720" style="width: 379px !important; height: auto !important; visibility: visible !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGt4dyAKGmD6Mibvd1Gbz6AsexqSbL3otgVVhvkGaBxWH6gKzkPrxq6PiceT7ibsyiaHTotSooNCY4cBw/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1" crossorigin="anonymous" data-fail="0"></section>
    `,
    // 顶部签名
    header: `
      <section style="margin-bottom:20px;" data-mpa-powered-by="wechatsync.io"><span style="color: rgb(178, 178, 178);font-size: 15px;"><img class=" __bg_gif" data-cropselx1="0" data-cropselx2="558" data-cropsely1="0" data-cropsely2="38" data-ratio="0.06666666666666667" data-s="300,640" data-src="https://mmbiz.qpic.cn/mmbiz_gif/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqUC4VfbW8UHpo9o8rzSnwtWiaFkFKalic4vm0wCohec76HxoiaTibrzUH2g/640?wx_fmt=gif" data-type="gif" data-w="630" style="white-space: normal; width: 379px !important; height: auto !important; visibility: visible !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_gif/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqUC4VfbW8UHpo9o8rzSnwtWiaFkFKalic4vm0wCohec76HxoiaTibrzUH2g/640?wx_fmt=gif&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1" data-order="0" data-fail="0"></span></section>
    `,
  }

  var simapleTempEngine = (function () {
    var pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g
    return function (template, json) {
      return template.replace(pattern, function (match, key, value) {
        return json[key]
      })
    }
  })()

  function TemplateProvider(TEMPLATE) {
    this.template = TEMPLATE
    return {
      getDefaultFontSize() {
        return TEMPLATE.font.size
      },
      hasBlock(type) {
        return TEMPLATE[type]
      },
      getBlock(type) {
        return TEMPLATE[type]
      },
      hasCustomTeplate(tye) {
        return TEMPLATE[type] && TEMPLATE[type].custom
      },
      handleCustomTemplate(type, value) {
        var temp = TEMPLATE[type].custom
        return simapleTempEngine(temp, {
          value: value,
        })
      },
      getStyle(type) {
        var styleDef = TEMPLATE[type]
        var sty = ''
        if (!styleDef) return ''
        return styleDef.styles
          .map(function (def) {
            return [def.name, def.value].join(':')
          })
          .join(';')
      },
      detectHeaderBySrong() {
        return TEMPLATE.autodetect && TEMPLATE.autodetect.strongAsHeader
      },
    }
  }

  const currentTemplate = new TemplateProvider(TEMPLATE)

  function autoformat(e) {
    var frame = $('#ueditor_0')[0]
    var frameDocument = frame.contentWindow.document
    var $dom = $(frameDocument)
    var $body = $dom.find('body')

    if (!inPreviewMode) {
      $body.attr('contenteditable', false)
      inPreviewMode = true
      originalCode = $body.html()
      $btnI.html('恢复<br>编辑')
    } else {
      $body.html(originalCode)
      originalCode = null
      inPreviewMode = false
      $body.attr('contenteditable', true)
      $btnI.html('一键<br>排版')
      return
    }

    var startList = false
    var listBuffer = []

    // 组装列表
    function processList(els) {
      var ul = $('<ul></ul>')
      ul.attr('class', 'list-paddingleft-2')
      els[0].after(ul)
      for (let index = 0; index < els.length; index++) {
        const element = els[index]
        const originalText = element.text()
        const stripText = originalText.replace('-', '').trim()
        const tag = $('<p></p>')
        tag.attr('style', 'font-size: ' + currentTemplate.getDefaultFontSize())
        tag.text(stripText)
        ul.append($('<li></li>').append(tag))
        element.remove()
      }
    }

    function processImg($tag, $images) {
      // $images.attr()
      var imageStyle = currentTemplate.getStyle('image')
      $tag.attr(
        'style',
        imageStyle
        // "margin-top: 5px; margin-bottom: 25px"
      )
      // $images.attr("style", "border-radius: 9px;");
    }

    $body.children().each(function (idx, tag) {
      var $el = $(tag)
      var hasStrong = $el.find('strong')
      var tagText = $el.text()
      var listStart = tagText.indexOf('-') == 0
      var isImageLine = false
      var imgs = $el.find('img')
      if (listStart) {
        startList = true
        listBuffer.push($el)
        return
      }

      if (tagText == '' && imgs.length) {
        processImg($el, imgs)
        return
      }

      // list 结束
      if (startList && !listStart) {
        console.log('list end', listBuffer)
        processList(listBuffer)
        startList = false
        listBuffer = []
        return
      }

      var titleLine = false

      if (currentTemplate.detectHeaderBySrong()) {
        var strongText = hasStrong.text()
        if (hasStrong.length) {
          if (hasStrong.length > 1) {
            var firstText = hasStrong.eq(0).text()
            var notSame = false
            for (let index = 1; index < hasStrong.length; index++) {
              const element = hasStrong.eq(index)
              if (firstText != element.text()) {
                notSame = true
                break
              }
            }
            if (!notSame) {
              titleLine = true
              strongText = firstText
            }
          } else {
            if (strongText == tagText) {
              titleLine = true
            }
          }
        }
      }

      if (titleLine) {
        console.log('raplce')
        if (currentTemplate.handleCustomTemplate('h2')) {
          var finalTag = currentTemplate.handleCustomTemplate('h2', tagText)
          $el.replaceWith(finalTag)
        } else {
          var title = $('<h2></h2>')
          var titleStyle = currentTemplate.getStyle('h2')
          title.attr('style', titleStyle)
          title.text(tagText)
          $el.replaceWith(title)
        }
      } else {
        var onlyBr = $el.find('br')
        var isEmptyLine = false
        if (tagText == '' && onlyBr.length) isEmptyLine = true
        if (isEmptyLine) {
          // $el.remove();
        }
        if (!isEmptyLine && !listStart) {
          var paragraphStyle = currentTemplate.getStyle('paragraph')
          $el.attr(
            'style',
            paragraphStyle
            // "font-size: 15px; margin-bottom: 30px;"
          )
        }

        console.log(strongText, tagText, hasStrong, strongText == tagText, tag)
      }
      console.log(tag)
    })

    var wrapper = $('<section></section>')
    var viewportStyle = currentTemplate.getStyle('viewport')
    wrapper.attr('style', viewportStyle)

    if (currentTemplate.hasBlock('header')) {
      wrapper.append(currentTemplate.getBlock('header'))
    }
    var articleContent = $body.html()
    wrapper.append(articleContent)
    if (currentTemplate.hasBlock('footer')) {
      wrapper.append(currentTemplate.getBlock('footer'))
    }

    $body.html($('<div></div>').append(wrapper).html())
    console.log('autoformataa', frameDocument, $dom.find('body'))
  }

  function init() {
    console.log('intiEditor', $control.length)
    console.log('test', $('#edui102_content').length)
    $btn.append($btnI)
    $control.append($btn)

    var $templatBtn = $(
      `<li class="tpl_item jsInsertIcon edui-default" id="js_editor_autoformat" style=""><i style="
      display: inline-block;
      vertical-align: middle;
      min-width: 32px;
      text-align: center;
      font-size: 12px;
      color: #353535;
      font-style: normal;
      box-sizing: border-box;
      /* font-weight: 600; */
  ">模板<br>管理</i></li>`
    )

    $control.append($templatBtn)
    $templatBtn.click(function () {
      window.open(pageURL)
      // window.postMessage(
      //   JSON.stringify({
      //     method: "GoTemplateCenter"
      //   }),
      //   "*"
      // );
    })

    $btn.click(autoformat)
  }

  var $imagePoup = $('#edui102_content')

  function initImageTool() {
    var poupUI = window.$EDITORUI['edui102']
    var currentImage = null
    console.log('initImageTool', window.$EDITORUI['edui102'])
    poupUI.editor.addListener('trigger_showpopup', function (t) {
      console.log(t)
      setTimeout(adfterPoup, 0)
    })

    function adfterPoup() {
      $imagePoup.parents('#edui102_body').height('84px')
      var $edui_mask_edit_img_group = $imagePoup.find(
        '.edui_mask_edit_img_group'
      )

      var $toolRow = $('<div class="custom-row"></div>')
      var $widthInput = $(`<input type="number" style="width: 35px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 2px;"/>`)
      var $heightInput = $(`<input style="width: 35px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 2px;" type="number"/>`)
      var fixSize = $(
        `<div class="js_adapt edui-clickable edui_mask_edit_meta"><div class="edui_mask_edit_meta_inner">自定义</div></div>`
      )
      console.log('adfterPoup')

      $widthInput.on('keydown', function () {
        console.log('widthInput', $widthInput.val())
      })

      $heightInput.on('keydown', function () {
        console.log('heightInput', $heightInput.val())
      })

      //   fixSize.append($widthInput);
      //   fixSize.append(" * ");
      //   fixSize.append($heightInput);
      $toolRow.append(fixSize)
      fixSize.click(function () {
        currentImage = window.$EDITORUI['edui102']._anchorEl
        var a = prompt('自定义宽*高')
        window.$EDITORUI['edui102'].hide(window.$EDITORUI['edui102']._closeId)
        var size = a.split('*')
        console.log(a, size, currentImage)
        if (size[0] && size[1]) {
          var $targetIamge = $(currentImage)
          $targetIamge.css('width', size[0] + 'px !important')
          $targetIamge.css('height', size[1] + 'px !important')
        }
      })

      var radius = $(
        `<div class="js_adapt edui-clickable edui_mask_edit_meta"><div class="edui_mask_edit_meta_inner">圆角</div></div>`
      )

      radius.click(function () {
        currentImage = window.$EDITORUI['edui102']._anchorEl
        var a = prompt('圆角1-x')
        window.$EDITORUI['edui102'].hide(window.$EDITORUI['edui102']._closeId)
        var $targetIamge = $(currentImage)
        $targetIamge.css('border-radius', a + 'px')
      })

      $toolRow.append(radius)

      var shadow = $(
        `<div class="js_adapt edui-clickable edui_mask_edit_meta"><div class="edui_mask_edit_meta_inner">阴影</div></div>`
      )

      shadow.click(function () {
        currentImage = window.$EDITORUI['edui102']._anchorEl
        var shado = prompt('阴影色号支持rgb, hex color')
        window.$EDITORUI['edui102'].hide(window.$EDITORUI['edui102']._closeId)
        var $targetIamge = $(currentImage)
        $targetIamge.css('box-shadow', shado + ' 0em 0em 0.5em 0px')
      })

      $toolRow.append(shadow)

      var padd = $(
        `<div class="js_adapt edui-clickable edui_mask_edit_meta"><div class="edui_mask_edit_meta_inner">内边距</div></div>`
      )

      padd.click(function () {
        currentImage = window.$EDITORUI['edui102']._anchorEl
        var px = prompt('边距xx px')
        window.$EDITORUI['edui102'].hide(window.$EDITORUI['edui102']._closeId)
        var $targetIamge = $(currentImage)
        $targetIamge.css('padding', px)
      })

      $toolRow.append(padd)

      $edui_mask_edit_img_group.append($toolRow)

      console.log('$edui_mask_edit_img_group', $edui_mask_edit_img_group.length)
    }
  }

  ;(function waitImageUi() {
    $imagePoup = $('#edui102_content')
    if ($imagePoup.length) {
      return initImageTool()
    }
    setTimeout(waitImageUi, 300)
  })()
  ;(function loop() {
    $control = $('#js_media_list')
    if ($control.length) {
      init()
      return
    }
    setTimeout(loop, 300)
  })()
}

console.log('intiEditor', $, document.currentScript)
pageURL = document.currentScript.getAttribute('data-url')

// try {
//   intiEditor()
// } catch (e) {
//   console.log('intiEditor', e)
// }


// mass-send__list
console.log('wechat autosend logic')

// 

// const observer = new MutationObserver(onMutation)
// observer.observe(document, {
//   childList: true,
//   subtree: true,
// })

// function onMutation(mutations) {
//   const found = []
//   for (const { addedNodes } of mutations) {
//     for (const node of addedNodes) {
//       if (!node.tagName) continue // not an element
//       if (node.classList.contains('mass-send__list')) {
//         found.push(node)
//       } else if (node.firstElementChild) {
//         found.push(...node.getElementsByClassName('mass-send__list'))
//       }
//     }
//   }

//   if (found.length) {
//     console.log('onMutation.found', found)
//     initSyncForm();
//   }
//   // found.forEach(processFilter)
// }

// var _isInted = false;
// function initSyncForm() {
  
// }