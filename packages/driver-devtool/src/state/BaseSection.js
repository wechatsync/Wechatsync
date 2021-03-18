import { get, set } from '@/utils/localStore'

export default class BaseSection {
  key = ''
  storeName = ''
  data = {}
  constructor(key, storeName) {
    this.key = key
    this.storeName = storeName
    this.data = get(this.storeName) || this.getDefaultData()
    this.data.items = this.data.items.filter(item => {
      return item.id && item.name && this.in(item.id)
    })
    return this
  }
  add(data) {
    const item = Object.assign({}, this.defaultItemModel(), data)
    const checkResult = this.check(item)
    if (!(checkResult instanceof Error)) {
      this.data.items.push(item)
      this.save()
    }
  }
  delete(itemId) {
    this.data.items = this.data.items.filter(item => item.id !== itemId)
    this.save()
  }
  merge(itemId, data) {
    const index = this.data.items.findIndex(item => item.id !== itemId)
    const item = { ...this.data.items[index], ...data }
    this.data.items.splice(index, 1, item)
    this.save()
  }
  get(itemId) {
    if (this.in(itemId)) {
      return this.data.items.find(adapter => adapter.id === itemId)
    } else {
      return null
    }
  }
  in(itemId) {
    const key = /^(.+)_/.exec(itemId)?.[1]
    return key && key === this.key
  }
  check({ id, name }) {
    if (!id || !name) {
      throw new Error('Field Empty')
    }

    if (this.data.items.find(item => name === item.name)) {
      throw new Error('Name Duplicate')
    }
  }
  save() {
    set(this.storeName, this.data)
  }
}
