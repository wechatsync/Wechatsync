import { get, set } from '@/utils/localStore'

export default class OpenedFiles {
  storeName = 'opened_files'
  data = []
  constructor() {
    this.data = get(this.storeName) || []
    return this
  }
  add(index, id) {
    this.data.splice(index, 0, id)
    this.save()
  }
  remove(id) {
    this.data.splice(this.data.indexOf(id), 1)
    this.save()
  }
  save() {
    set(this.storeName, this.data)
  }
}
