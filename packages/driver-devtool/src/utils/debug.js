import { getFileName, getFileType } from './file'
import log from './log'
import { getTestCases } from '@/store/controller/section'
import matter from 'gray-matter'
import marked from 'marked'

export async function deployCode({ name, content }) {
  log.addLog('部署代码到插件...')
  const deployResult = await new Promise(resolve => {
    window.$syncer.updateDriver(
      {
        name: getFileName(name),
        code: content,
        dev: true,
        patch: true,
      },
      res => {
        resolve(res.result)
      }
    )
  })

  log.addDebugLog(deployResult)
}

// 测试获取用户信息
async function testUserInfoGather(driverName) {
  const callArgs = {
    methodName: 'getMetaData',
    account: {
      type: driverName,
    },
  }
  const accountResult = await new Promise(resolve => {
    window.$syncer.magicCall(callArgs, res => {
      resolve(res)
    })
  })
  log.addDebugLog(accountResult)

  return accountResult.status !== 0
}

// 测试图片上传
async function testImageUpload(driverName) {
  log.addLog(['图片上传测试...'])

  const testCases = getTestCases()

  if (!testCases.length) {
    window.confirm('没有选择任何测试文章，请在侧边栏添加并选择')
    return
  }

  const uploadResults = await Promise.all(
    testCases.map(test => {
      const { name, content } = test
      const extType = getFileType(name)

      let testImageSrc
      if (extType === 'json') {
        testImageSrc = content.thumnail
      } else if (extType === 'md') {
        testImageSrc = matter(content).data?.image
      }
      testImageSrc ||= 'https://fakeimg.pl/350x200/?text=WechatSync'

      const actionData = {
        src: testImageSrc,
        account: {
          type: driverName,
        },
      }
      return new Promise(resolve => {
        window.$syncer.uploadImage(actionData, res => {
          resolve(res)
        })
      })
    })
  )

  log.addDebugLog(uploadResults)

  return uploadResults.every(result => !result.error)
}

// 测试文章同步
async function testArticleUpload(driverName) {
  const testCases = getTestCases()

  if (!testCases.length) {
    window.confirm('没有选择任何测试文章，请在侧边栏添加并选择')
    return
  }

  testCases.forEach(test => {
    const { name, content } = test
    const fileName = getFileName(name)
    const extType = getFileType(name)

    const payload = {
      title: '',
      content: '',
    }

    if (extType === 'json') {
      const json = JSON.parse(content)
      Object.assign(payload, {
        title: json.title,
        content: json.content,
      })
    } else if (extType === 'md') {
      const { content, data } = matter(test.content)
      Object.assign(payload, {
        title: data.title || fileName,
        content: marked(content),
        markdown: content,
      })
    }
    window.$syncer.addTask(
      {
        post: payload,
        accounts: [
          {
            account: {
              type: driverName,
            },
          },
        ],
      },
      function(status) {
        // self.taskStatus = status
        console.log('status', status)
      },
      function() {
        console.log('send')
      }
    )
  })
}

export async function runAccountTest(fileName) {
  await testUserInfoGather(getFileName(fileName))
}

export async function runImageSyncTest(fileName) {
  const driverName = getFileName(fileName)
  if (!(await testUserInfoGather(driverName))) return
  await testImageUpload(driverName)
}

export async function runArticleSyncTest(fileName) {
  const driverName = getFileName(fileName)
  if (!(await testUserInfoGather(driverName))) return
  if (!(await testImageUpload(driverName))) return
  await testArticleUpload(driverName)
}
