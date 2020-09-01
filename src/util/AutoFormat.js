export const simapleTempEngine = (function () {
  var pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g
  return function (template, json) {
    return template.replace(pattern, function (match, key, value) {
      return json[key]
    })
  }
})()

export function TemplateProvider(TEMPLATE) {
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
      return TEMPLATE[tye] && TEMPLATE[tye].enable_custom
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

export function Autoformat(frameDocument, TEMPLATE) {
  const currentTemplate = new TemplateProvider(TEMPLATE)
  var $dom = $(frameDocument)
  var $body = $dom.find('body')
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
    $tag.attr('autoformat', 'image')
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
      if (currentTemplate.hasCustomTeplate('h2')) {
        var finalTag = currentTemplate.handleCustomTemplate('h2', tagText)
        $el.replaceWith(finalTag)
        $el.attr('autoformat', 'header')
      } else {
        var title = $('<h2></h2>')
        var titleStyle = currentTemplate.getStyle('h2')
        title.attr('style', titleStyle)
        title.text(tagText)
        title.attr('autoformat', 'header')
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
        $el.attr('autoformat', 'paragraph')
      }

      console.log(strongText, tagText, hasStrong, strongText == tagText, tag)
    }
    console.log(tag)
  })

  var wrapper = $('<section></section>')
  var viewportStyle = currentTemplate.getStyle('viewport')
  wrapper.attr('style', viewportStyle)
  wrapper.attr('autoformat', 'viewport')

  if (currentTemplate.hasBlock('header')) {
    wrapper.append(currentTemplate.getBlock('header'))
  }
  var articleContent = $body.html()
  wrapper.append(articleContent)
  if (currentTemplate.hasBlock('footer')) {
    wrapper.append(currentTemplate.getBlock('footer'))
  }

  $body.html($('<div></div>').append(wrapper).html())
}
