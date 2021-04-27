
// 移除一些公众号原生内容块
export default function preFilter (doc) {
  console.log('doPreFilter')
  var removeSelectors = [
    'mpprofile',
    'qqmusic'
  ]

  for (let index = 0; index < removeSelectors.length; index++) {
    const removeSelector = removeSelectors[index];
    doc.find(removeSelector).parent().remove()
  }
}
