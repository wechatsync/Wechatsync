import buildInDrivers from "@wechatsync/drivers";

const {
  JianShuAdapter,
  ZhiHuAdapter,
  WordpressAdapter,
  ToutiaoAdapter,
  WeiboAdapter,
  SegmentfaultAdapter,
  JuejinAdapter,
  CSDNAdapter,
  CnblogAdapter,
  WeixinAdapter,
  YiDianAdapter,
  DoubanAdapter,
  BilibiliAdapter,
  _51CtoAdapter,
  FocusAdapter,
  DiscuzAdapter,
  SoHuAdapter,
  BaiJiaHaoAdapter,
  OsChinaAdapter,
  DaYuAdapter,
  ImoocAdapter,
  YuQueAdapter,
  XueQiuAdapter,
  IPFSAdapter,
} = buildInDrivers

var _cacheState = {}
const _customDrivers = {};

export function addCustomDriver(name, driverClass) {
  _customDrivers[name] = {
    name: name,
    handler: driverClass
  }
  console.log('addCustomDriver', _customDrivers)
}


export function getDriver(account) {

  // 保证在内置的前面
  if(_customDrivers[account.type]) {
    const driverInCustom = _customDrivers[account.type]
    return new driverInCustom['handler'](account)
  }

  if (account.type == 'wordpress') {
    return new WordpressAdapter(
      account.params.wpUrl,
      account.params.wpUser,
      account.params.wpPwd
    )
  }

  if (account.type == 'zhihu') {
    return new ZhiHuAdapter()
  }

  if (account.type == 'dayu') {
    return new DaYuAdapter(account)
  }

  if (account.type == 'jianshu') {
    return new JianShuAdapter()
  }

  if (account.type == 'typecho') {
    return new WordpressAdapter(
      account.params.wpUrl,
      account.params.wpUser,
      account.params.wpPwd,
      true
    )
  }

  if (account.type == 'toutiao') {
    return new ToutiaoAdapter()
  }

  if (account.type == 'bilibili') {
    return new BilibiliAdapter({
      globalState: _cacheState,
      state: _cacheState[account.type],
    })
  }

  if (account.type == 'weibo') {
    return new WeiboAdapter()
  }

  if (account.type == 'sohufocus') {
    return new FocusAdapter()
  }

  if (account.type == '51cto') {
    return new _51CtoAdapter()
  }

  if (account.type == 'segmentfault') {
    return new SegmentfaultAdapter(account)
  }

  if (account.type == 'juejin') {
    return new JuejinAdapter(account)
  }

  if (account.type == 'csdn') {
    return new CSDNAdapter(account)
  }

  if (account.type == 'cnblog') {
    return new CnblogAdapter(account)
  }
  if (account.type == 'weixin') {
    return new WeixinAdapter(account)
  }

  if (account.type == 'yidian') {
    return new YiDianAdapter(account)
  }

  if (account.type == 'baijiahao') {
    return new BaiJiaHaoAdapter(account)
  }

  if(account.type == 'douban') {
    console.log(account.type)
    return new DoubanAdapter({
      globalState: _cacheState,
      state: _cacheState[account.type],
    })
  }

  if(account.type == 'discuz') {
    console.log('discuz', account)
    return new DiscuzAdapter(account.config)
  }

  if (account.type == 'sohu') {
    return new SoHuAdapter(account)
  }

  if (account.type == 'oschina') {
    return new OsChinaAdapter(account)
  }

  if (account.type == 'imooc') {
    return new ImoocAdapter(account)
  }

  if (account.type == 'ipfs') {
    return new IPFSAdapter(account)
  }

  if (account.type == 'xueqiu') {
    return new XueQiuAdapter(account)
  }

  if (account.type == 'yuque') {
    return new YuQueAdapter(account)
  }

  throw Error('not supprt account type')
}

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
  arr.slice(i * size, i * size + size)
);

let _cacheUsers = null
let _lastFetch = null

export async function getPublicAccounts() {

  // 限制20s 保证不会太频繁请求平台
  if(_lastFetch != null) {
    const isTooQuickly = (Date.now() - _lastFetch) < 20 * 1000
    if (isTooQuickly) {
      console.log('too quickly return by cache')
      return _cacheUsers
    }
  }

  console.log('getPublicAccounts')
  var drivers = [
    new SegmentfaultAdapter(),
    new CSDNAdapter(),
    new JuejinAdapter(),
    new CnblogAdapter(),
    new WeiboAdapter(),
    new ZhiHuAdapter(),
    new JianShuAdapter(),
    new ToutiaoAdapter(),
    new WeixinAdapter(),
    new YiDianAdapter(),
    new DoubanAdapter(),
    new BilibiliAdapter(),
    new _51CtoAdapter(),
    new FocusAdapter(),
    new BaiJiaHaoAdapter(),
    new SoHuAdapter(),
    new OsChinaAdapter(),
    new DaYuAdapter(),
    new ImoocAdapter(),
    new YuQueAdapter(),
    new XueQiuAdapter(),
    new IPFSAdapter(),
  ]

  var customDiscuzEndpoints = ['https://www.51hanghai.com'];
  customDiscuzEndpoints.forEach(_ => {
    drivers.push(new DiscuzAdapter({
      url: _,
   }));
  })

  Object.keys(_customDrivers).forEach(type => {
    const _customDriver = _customDrivers[type];
    try {
      drivers.push(new _customDriver['handler']());
    } catch (e) {
      console.log('initlaze custom driver error', e)
    }
  });

  var users = []

  const stepItems = chunk(drivers, 20);
  const startTime = Date.now()
  for (let index = 0; index < stepItems.length; index++) {
    try {
      const stepItem = stepItems[index];
      const results = await Promise.all(
        stepItem.map((driver) => {
          return new Promise((resolve, reject) => {
            driver.getMetaData().then(resolve, function() {
              resolve(null)
            })
          })
        })
      );
      const successAccounts = results.filter(_ => _)
      users = users.concat(successAccounts)
    } catch (e) {
      console.log("chunkPromise", e);
    }
  }
  // for (let index = 0; index < drivers.length; index++) {
  //   const driver = drivers[index]
  //   try {
  //     var user = await driver.getMetaData()
  //     users.push(user)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }
  const spend = Date.now() - startTime
  console.log('getPublicAccounts spend', spend, 'driverCount', drivers.length)
  _lastFetch = Date.now()
  _cacheUsers = users
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
    version: '0.0.15',
    versionNumber: 15,
    log: '',
    urlHandler: urlHandler,
    inspectUrls: ['*://api.bilibili.com/*', '*://music.douban.com/*'],
  }
}

// DEVTOOL_PLACEHOLDER_INSERT
