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
    if ('name' in data && this.check(item) instanceof Error) return

    const index = this.data.items.findIndex(item => item.id === itemId)
    const originItem = this.data.items[index]
    const item = { ...originItem, ...data }
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
      throw new Error('文件名不能为空，请重新设置')
    }

    if (this.data.items.find(item => name === item.name)) {
      throw new Error('该文件名已存在，请重新设置')
    }
  }
  save() {
    set(this.storeName, this.data)
  }
}
