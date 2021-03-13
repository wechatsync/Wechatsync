import buildInDrivers from "@wechatsync/drivers";

const {
  JianShuDriver,
  ZhiHuDriver,
  WordpressDriver,
  ToutiaoDriver,
  Weibo,
  Segmentfault,
  Juejin,
  CSDN,
  Cnblog,
  Weixin,
  YiDian,
  Douban,
  Bilibili,
  B51Cto,
  FocusDriver,
  Discuz
} = buildInDrivers;

var _cacheState = {}

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

  if (account.type == 'bilibili') {
    return new Bilibili({
      globalState: _cacheState,
      state: _cacheState[account.type],
    })
  }

  if (account.type == 'weibo') {
    return new Weibo()
  }

  if (account.type == 'sohufocus') {
    return new FocusDriver()
  }

  if (account.type == '51cto') {
    return new B51Cto()
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

  if(account.type == 'douban') {
    console.log(account.type)
    return new Douban({
      globalState: _cacheState,
      state: _cacheState[account.type],
    })
  }

  if(account.type == 'discuz') {
    console.log('discuz', account)
    return new Discuz(account.config)
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
    new Douban(),
    new Bilibili(),
    new B51Cto(),
    new FocusDriver(),
  ]

  var customDiscuzEndpoints = ['https://www.51hanghai.com'];
  customDiscuzEndpoints.forEach(_ => {
    drivers.push(new Discuz({
        url: _,
      }));
  })

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

function getCookie(name, cookieStr) {
  let arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = cookieStr.match(reg))) {
    return unescape(arr[2])
  } else {
    return ''
  }
}

function urlHandler(details) {
  if (
    details.url.indexOf('api.bilibili.com') >
    -1
  ) {
    var cookieHeader = details.requestHeaders.filter(h => {
      return h.name.toLowerCase() == 'cookie'
    })

    if (cookieHeader.length) {
      var cookieStr = cookieHeader[0].value
      var bili_jct = getCookie('bili_jct', cookieStr)
      if (bili_jct) {
        _cacheState['bilibili'] = _cacheState['bilibili'] || {};
        Object.assign(_cacheState['bilibili'], {
          csrf: bili_jct,
        })
        console.log('bili_jct', bili_jct, details)
      }
    }
    // console.log('details.requestHeaders', details)
  }
  // https://music.douban.com/subject/24856133/new_review
  if (
    details.url.indexOf('music.douban.com') >
    -1
    &&
    details.url.indexOf('/new_review') >
    -1
  ) {
    _cacheState['douban'] = _cacheState['douban'] || {};
    Object.assign(_cacheState['douban'], {
      is_review: true,
      subject: 'music',
      url: details.url,
      id: details.url.replace('https://music.douban.com/subject/', '')
      .replace('/new_review', '')
    })
  }
}

export function getMeta() {
  return {
    version: '0.0.11',
    versionNumber: 12,
    log: '',
    urlHandler: urlHandler,
    inspectUrls: ['*://api.bilibili.com/*', '*://music.douban.com/*'],
  }
}
