function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getChildren(obj, count) {
  count++
  if (count > 4) return null
  if (obj.children().length > 1) return obj
  return getChildren(obj.children().eq(0), count)
}

function CodeBlockToPlainTextOther(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = minSub.children()
  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element.text()
    text.push(escapeHtml(codeStr))
  }
  return text.join('\n')
}

export function CodeBlockToPlainText(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = pre.find('code')
  if (lines.length > 1) {
    return CodeBlockToPlainTextOther(pre)
  }

  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element[0].innerText;
    // $(element.html()).text()
    // console.log('codeStr', codeStr)
    // var codeLines = codeStr.split('\n')
    // codeLines.forEach((codeLine) => {
    //   text.push('<code>' + escapeHtml(codeLine) + '</code>')
    // })
    text.push('<code>' + escapeHtml(codeStr) + '</code>')
  }
  return text.join('\n')
}

export function processDocCode(div) {
  var doc = div
  var pres = doc.find('pre')
  // console.log("find code blocks", pres.length, post);
  for (let mindex = 0; mindex < pres.length; mindex++) {
    const pre = pres.eq(mindex)
    try {
      var oldHtml = pre.html()
      var newHtml = CodeBlockToPlainText(pre, 0)
      if (newHtml) {
        console.log('processDocCode', newHtml, oldHtml)
        pre.html(newHtml)
      } else {
        console.log('processDocCode.failed')
      }
    } catch (e) {}
  }
}

export function makeImgVisible(doc) {
  console.log('makeImgVisible')
  var pres = doc.find('img')
  for (let mindex = 0; mindex < pres.length; mindex++) {
    const item = pres.eq(mindex)
    const src = item.attr('data-src')
    if (src) {
      item.attr('src', src)
    }
  }
}
