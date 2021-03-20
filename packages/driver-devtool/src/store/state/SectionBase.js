import { get, set } from '@/utils/localStore'

export default class SectionBase {
  key = ''
  storeName = ''
  data = {}
  constructor(key, storeName) {
    this.key = key
    this.storeName = storeName
    this.data = get(this.storeName)

    if (!this.data || !this.data.items.length) {
      this.data = this.getDefaultData()
    } else {
      this.data.items = this.data.items.filter(item => {
        return item.id && item.name && this.is(item.id)
      })
    }

    return this
  }
  defaultModel() {
    return {}
  }
  add(data) {
    this.data.items.push({ ...this.defaultModel(), ...data })
    this.save()
  }
  delete(itemId) {
    this.data.items = this.data.items.filter(item => item.id !== itemId)
    this.save()
  }
  merge(itemId, data) {
    const index = this.data.items.findIndex(item => item.id === itemId)
    const originItem = this.data.items[index]
    const item = { ...originItem, ...data }
    this.data.items.splice(index, 1, item)
    this.save()
  }
  get(itemId) {
    return this.data.items.find(item => item.id === itemId)
  }
  is(itemId) {
    const key = /^(.+)_/.exec(itemId)?.[1]
    return key && key === this.key
  }
  check({ name }) {
    if (!name) {
      throw new Error('Name Empty')
    }

    if (this.data.items.find(item => name === item.name)) {
      throw new Error('Name Duplicate')
    }

    return true
  }
  save() {
    set(this.storeName, this.data)
  }
}
