var compareVer = require('compare-ver')

export default class VersionChecker {
  constructor() {
    this.remoteStatus = null
  }

  async loadRemote() {
    try {
      var data = await $.get(
        'https://wpics.oss-cn-shanghai.aliyuncs.com/version.json'
      )
      this.remoteStatus = data
    } catch (e) {}
  }

  async compare(ver, key = 'version') {
    var compareVersion = null
    if (this.remoteStatus == null) {
      await this.loadRemote()
    }
    compareVersion = this.remoteStatus[key]
    console.log('VersionChecker', key, compareVersion, ver)
    if (compareVersion == null) return 0 
    return compareVer.gt(compareVersion, ver)
  }

  getStatus() {
    return this.remoteStatus
  }
}
