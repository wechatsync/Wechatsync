// import vm from "../../vm/vm";
import Sval from 'sval'

export function getDriverProvider(code) {
  const options = {
    // ECMA Version of the code (5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019)
    ecmaVer: 2019,
    // Whether the code runs in a sandbox
    sandBox: true,
  }

  var axios = require('axios')
  var juice = require('juice/client')

  const interpreter = new Sval(options)
  const sanbox = {
    console: console,
    $: $,
    DOMParser: DOMParser,
    document: document,
    axios: axios,
    Blob: Blob,
    Promise: Promise,
    md5: md5,
    juice: juice,
    //   window: window
  }

  for (var k in sanbox) {
    interpreter.import(k, sanbox[k])
  }
  // const context = vm.createContext(sanbox);
  // const instance = vm.runInContext(code, context);
  interpreter.run(code)

  return interpreter.exports
}

window.initliazeDriver = initliazeDriver

export function initliazeDriver() {
  return new Promise((resolve, reject) => {
    function createDriver(driverRemote) {
      // console.log(window.driver);
      const code = driverRemote ? driverRemote : window.driver
      const driver = getDriverProvider(code)
      resolve(driver)
    }

    chrome.storage.local.get(['driver'], function (result) {
      createDriver(result.driver)
    })
    // return driver;
  })
}
