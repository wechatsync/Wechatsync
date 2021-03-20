import { get, set } from '@/utils/localStore'

export default class ActiveItem {
  storeName = 'active_item'
  data = {}
  constructor() {
    this.data = get(this.storeName) || { id: '' }
    return this
  }
  set(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.data[key] = value
    })
    set(this.storeName, this.data)
  }
}
