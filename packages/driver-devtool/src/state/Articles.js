import { uniqueId } from '@/utils/file'
import BaseSection from './BaseSection'

export default class Articles extends BaseSection {
  constructor() {
    super()
    return super.constructor('test', 'articles')
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
      title: '测试文章',
      idPrefix,
      items: [
        {
          id: uniqueId(idPrefix),
          name: '默认文章.md',
          content: require('@/assets/defaultTestArticle.md'),
          dirty: false,
        },
      ],
    }
  }
}
