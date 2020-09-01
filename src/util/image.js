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
      getDataUrl(src, function (bUrl) {
        console.log('upImage', src, bUrl)
        var baseCode = bUrl.replace('data:image/png;base64,', '')
        driver
          .uploadFile({
            post_id: postId + '',
            name: name,
            type: 'image/png',
            bits: $.xmlrpc.binary.fromBase64(baseCode),
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
      })
    }
  })
}
