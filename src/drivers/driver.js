import JianShuDriver from './JianShuDriver'
import ZhiHuDriver from './ZhiHuDriver'
import WordpressDriver from './WordpressDriver'
import ToutiaoDriver from './ToutiaoDriver'
import Weibo from './Weibo'
import Segmentfault from './Segmentfault'
import Juejin from './Juejin'
import CSDN from './CSDN'
import Cnblog from './Cnblog'
import Weixin from './WeixinDriver'
import YiDian from './YiDian'

export function getDriver(account) {
  if (account.type == 'wordpress') {
    return new WordpressDriver(
      account.params.wpUrl,
      account.params.wpUser,
      account.params.wpPwd
    )
  }

  if (account.type == 'zhihu') {
    return new ZhiHuDriver()
  }

  if (account.type == 'jianshu') {
    return new JianShuDriver()
  }

  if (account.type == 'typecho') {
    return new WordpressDriver(
      account.params.wpUrl,
      account.params.wpUser,
      account.params.wpPwd,
      true
    )
  }

  if (account.type == 'toutiao') {
    return new ToutiaoDriver()
  }

  if (account.type == 'weibo') {
    return new Weibo()
  }

  if (account.type == 'segmentfault') {
    return new Segmentfault(account)
  }

  if (account.type == 'juejin') {
    return new Juejin(account)
  }

  if (account.type == 'csdn') {
    return new CSDN(account)
  }

  if (account.type == 'cnblog') {
    return new Cnblog(account)
  }
  if (account.type == 'weixin') {
    return new Weixin(account)
  }

  if (account.type == 'yidian') {
    return new YiDian(account)
  }

  throw Error('not supprt account type')
}

export async function getPublicAccounts() {
  console.log('getPublicAccounts')
  var drivers = [
    new Segmentfault(),
    new CSDN(),
    new Juejin(),
    new Cnblog(),
    new Weibo(),
    new ZhiHuDriver(),
    new JianShuDriver(),
    new ToutiaoDriver(),
    new Weixin(),
    new YiDian(),
  ]
  var users = []
  for (let index = 0; index < drivers.length; index++) {
    const driver = drivers[index]
    try {
      var user = await driver.getMetaData()
      users.push(user)
    } catch (e) {
      console.log(e)
    }
  }
  return users
}

export function getMeta() {
  return {
    version: '0.0.6',
    versionNumber: 6,
    log: '',
  }
}
