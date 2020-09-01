var compareVer = require('compare-ver')

export default class VersionChecker {
  constructor() {
    this.remoteVersion = null
    this.remoteStatus = null
    // this.compare();
  }

  async compare(ver) {
    if (!this.remoteVersion) {
      try {
        var data = await $.get(
          'https://wpics.oss-cn-shanghai.aliyuncs.com/version.json'
        )
        this.remoteVersion = data.version
        this.remoteStatus = data
      } catch (e) {}
    }
    // console.log(compareVer.gt(data.version, currentVersion));
    console.log('VersionChecker', this.remoteVersion, ver)
    return compareVer.gt(this.remoteVersion, ver)
  }

  getStatus() {
    return this.remoteStatus
  }
}
