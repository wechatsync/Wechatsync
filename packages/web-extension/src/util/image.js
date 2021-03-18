
import { readFileToBase64 } from './file'

function getDataUrl(srcUrl, cb) {
  var canvas = document.createElement('canvas'),
    context
  var tmpImage = new Image()
  tmpImage.onload = function () {
    canvas.width = tmpImage.width
    canvas.height = tmpImage.height
    context = canvas.getContext('2d')
    context.drawImage(tmpImage, 0, 0)
    cb(canvas.toDataURL())
  }
  tmpImage.src = srcUrl
}

export function upImage(driver, src, postId, name) {
  return new Promise(function (resolve, reject) {
    if (driver.skipReadImage) {
      driver
        .uploadFile({
          post_id: postId + '',
          name: name,
          type: 'image/png',
          bits: null,
          overwrite: true,
          src: src,
        })
        .then(
          function (res, status, xhr) {
            console.log({
              res,
              status,
              xhr,
            })
            if (status == 'success' || res) {
              var object = res[0]
              resolve(object)
              // img.attr('src', object.url);
            } else {
              reject()
            }
          },
          function (xhr, status, error) {
            console.log(arguments)
            if (error) {
              reject(error)
            } else {
              reject(xhr)
            }
          }
        )
    } else {
      (async () => {
        try {
          var sourceIsBase64 = src.indexOf(';base64,') > -1;
          var dataURL = sourceIsBase64 ? src : await readFileToBase64(src)
          var dataURLPairs = dataURL.split(',')
          var fileType = dataURLPairs[0].replace('data:', '').split(';')[0]
          var baseCode = dataURLPairs[1]
          var uploadData = {
            post_id: postId + '',
            name: name,
            type: fileType || 'image/png',
            bits: $.xmlrpc.binary.fromBase64(baseCode),
            overwrite: true,
            src: src,
          }

          console.log('upImage.readFileToBase64', src, fileType, uploadData)
          driver
            .uploadFile(uploadData)
            .then(
              function(res, status, xhr) {
                console.log(res)
                if (status == 'success' || res) {
                  var object = res[0]
                  resolve(object)
                  // img.attr('src', object.url);
                } else {
                  reject()
                }
              },
              function(xhr, status, error) {
                console.log(arguments)
                if (error) {
                  reject(error)
                } else {
                  reject(xhr)
                }
              }
            )
            .catch(function(e) {
              console.log('uploadFile.catch', e)
              reject(e)
            })
        } catch (e) {
          console.log('uploadFile.error', e)
          reject(e)
        }
      })();
    }
  })
}
