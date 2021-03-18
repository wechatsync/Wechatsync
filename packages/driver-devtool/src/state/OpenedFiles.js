import { get, set } from '@/utils/localStore'

export default class OpenedFiles {
  storeName = 'opened_files'
  data = []
  constructor() {
    this.data = get(this.storeName) || []
    return this
  }
  add(prevId, currentId) {
    const index = prevId ? this.data.indexOf(prevId) : -1

    if (index > -1) {
      this.data.splice(index + 1, 0, currentId)
    } else {
      this.data.push(currentId)
    }
    set(this.storeName, this.data)
  }
  remove(id) {
    const index = this.data.indexOf(id)
    this.data.splice(index, 1)
    set(this.storeName, this.data)
  }
}
