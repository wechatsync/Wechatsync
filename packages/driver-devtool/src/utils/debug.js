import { getFileName, getFileType } from './file'
import log from './log'
import { getTestCases } from '@/store/controller/section'
import matter from 'gray-matter'
import marked from 'marked'

export async function deployCode({ name, content }) {
  log.addInfoLog('部署代码到插件...')

  try {
    await new Promise((resolve, reject) => {
      window.$syncer.updateDriver(
        {
          name: getFileName(name),
          code: content,
          dev: true,
          patch: true,
        },
        res => {
          const { status, ...info } = res.result

          if (status === 0) {
            reject(info)
          } else {
            resolve(info)
          }
        }
      )
    })
    log.addSuccessLog(`${name} 已部署到插件`)
    return true
  } catch (info) {
    log.addErrorLog({
      title: `${name} 部署失败`,
      info: info,
    })
    return false
  }
}

// 测试获取用户信息
async function testUserInfoGather(driverName) {
  log.addInfoLog('测试账号识别...')

  const callArgs = {
    methodName: 'getMetaData',
    account: {
      type: driverName,
    },
  }

  try {
    const accountResult = await new Promise((resolve, reject) => {
      window.$syncer.magicCall(callArgs, res => {
        if (res.error) {
          reject(res)
        } else {
          resolve(res.result)
        }
      })
    })
    log.addSuccessLog({
      title: `${driverName} 账号识别成功`,
      info: accountResult,
    })
    return true
  } catch (info) {
    log.addErrorLog({
      title: `${driverName} 账号识别失败`,
      info,
    })
    return false
  }
}

// 测试图片上传
async function testImageUpload(driverName) {
  log.addInfoLog('测试图片上传...')

  const testCases = getTestCases()

  if (!testCases.length) {
    window.alert('没有选择任何测试文章，请在侧边栏添加并选择')
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
          resolve({
            origin: testImageSrc,
            result: res,
          })
        })
      })
    })
  )

  let isPassedAll = true
  uploadResults.forEach(({ origin, result }, index) => {
    if (result.error) {
      log.addErrorLog({
        title: `第${index + 1}张图片上传失败。图片源：${origin}`,
        info: result,
      })
      isPassedAll = false
    } else {
      log.addSuccessLog({
        title: `第${index + 1}张图片上传成功。图片源：${origin}`,
        info: result.result,
      })
    }
  })

  return isPassedAll
}

// 测试文章同步
async function testArticleUpload(driverName) {
  let syncingQueue = []
  const testCases = getTestCases()

  if (!testCases.length) {
    window.alert('没有选择任何测试文章，请在侧边栏添加并选择')
    return
  }

  log.addInfoLog('测试文章同步...')

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
    } else {
      Object.assign(payload, {
        title: fileName,
        content,
      })
    }

    window.$syncer.addTask(
      {
        post: payload,
        accounts: [
          {
            type: driverName,
          },
        ],
      },
      function(res) {
        if (res.status === 'done') {
          console.log(res)
          log.addSuccessLog({
            title: `同步文章 ${fileName} 成功`,
            info: res.accounts
              .map(({ editResp, status }) => {
                if (status === 'done') {
                  return editResp.draftLink
                }
              })
              .join('\n'),
          })
          syncingQueue = null
        } else {
          if (!syncingQueue.includes(res.guid)) {
            log.addInfoLog({
              title: `正在同步文章 ${fileName}`,
              info: res.post,
            })
            syncingQueue.push(res.guid)
          }
        }

        console.log('article sync start', res)
      },
      function(res) {
        log.addInfoLog({
          title: `同步文章 ${fileName} 失败`,
          info: res,
        })
      }
    )
  })
}

export async function runAccountTest(fileName) {
  await testUserInfoGather(getFileName(fileName))
}

export async function runImageSyncTest(fileName) {
  const driverName = getFileName(fileName)
  // if (!(await testUserInfoGather(driverName))) return
  await testImageUpload(driverName)
}

export async function runArticleSyncTest(fileName) {
  const driverName = getFileName(fileName)
  // if (!(await testUserInfoGather(driverName))) return
  // if (!(await testImageUpload(driverName))) return
  await testArticleUpload(driverName)
}

export const debugList = [
  {
    key: 'account',
    label: '账号识别',
    function: runAccountTest,
    shortcuts: { mac: ['Cmd + 1'], win: ['Ctrl + 1'] },
  },
  {
    key: 'imageUpload',
    label: '图片上传',
    function: runImageSyncTest,
    shortcuts: { mac: ['Cmd + 2'], win: ['Ctrl + 2'] },
  },
  {
    key: 'articleSync',
    label: '文章同步',
    function: runArticleSyncTest,
    shortcuts: { mac: ['Cmd + 3'], win: ['Ctrl + 3'] },
  },
]
