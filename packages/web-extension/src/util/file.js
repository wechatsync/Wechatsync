
const axios = require('axios')

export function readFileToBase64(url) {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let body = null
      try {
        const req = await axios.get(url, { responseType: 'blob' })
        body = req.data
      } catch (e) {
        return reject(e)
      }
      if (body != null) {
        const reader = new FileReader()
        reader.readAsDataURL(body)
        reader.onloadend = function () {
          var base64data = reader.result
          resolve(base64data)
        }
        reader.onerror = function (e) {
          reject(e)
        }
      }
    })()
  })
}