function copyHtml(obj) {
  var newObj = $('<div>').append(obj.clone())
  newObj.find('p').eq(0).css('fontSize')
  console.log(newObj.html())
}

;(function ($) {
  $.extend($.fn, {
    makeCssInline: function () {
      this.each(function (idx, el) {
        var style = el.style
        var types = [
          'margin',
          'padding',
          'vertical-align',
          'word-break',
          'color',
          'text-align',
          'font-weight',
          'border',
          'box-sizing',
          'font-size',
          'font-family',
          'line-height',
          'white-space',
          'background',
          'overflow',
        ]
        var properties = []
        for (var i in types) {
          property = types[i]
          if ($(this).css(property)) {
            properties.push(property + ':' + $(this).css(property))
          }
        }
        this.style.cssText = properties.join(';')
        $(this).children().makeCssInline()
      })
    },
  })
})(jQuery)

$('.articleDetailContent ').eq(0).makeCssInline()

// obj.find('p').eq(0).attr('style')
copyHtml($('.articleDetailContent ').eq(0))
