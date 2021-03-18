import { uniqueId } from '@/utils/file'
import BaseSection from './BaseSection'

export default class Adapters extends BaseSection {
  constructor() {
    super()
    return super.constructor('adapters', 'adapters')
  }
  defaultItemModel() {
    return {
      id: '',
      name: '',
      content: '',
      dirty: false,
    }
  }
  getDefaultData() {
    const idPrefix = `${this.key}_`
    return {
      key: this.key,
      title: '适配器',
      idPrefix,
      items: [
        {
          id: uniqueId(idPrefix),
          name: 'template.js',
          content: require('@wechatsync/drivers/src/BaseAdapter'),
          dirty: false,
        },
      ],
    }
  }
}
