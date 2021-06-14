const _bundle = require('./dist/code.js')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

async function publish(type, post) {
    const _driver = _bundle.getDriver({
      type: 'zhihu',
    })

    const _meta = await _driver.getMetaData()
    console.log('_driver', _meta)
}


publish('zhihu', {
  post_title: 'test',
  post_content: 'content'
})
// console.log(
//   bundle.getDriver({
//     type: 'zhihu',
//   })
// )