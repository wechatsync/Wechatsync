import { uniqueId } from '@/utils/file'
import SectionBase from './SectionBase'

export default class Adapters extends SectionBase {
  constructor() {
    super('adapters', 'adapters')
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
          content: require('@wechatsync/drivers/src/BaseAdapter?raw'),
          dirty: false,
        },
        {
          id: uniqueId(idPrefix),
          name: 'zhihu.js',
          content: require('@wechatsync/drivers/src/zhihu?raw'),
          dirty: false,
        },
      ],
    }
  }
}
