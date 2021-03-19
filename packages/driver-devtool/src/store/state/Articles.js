import { uniqueId } from '@/utils/file'
import SectionBase from './SectionBase'
import { get, set } from '@/utils/localStore'

export default class Articles extends SectionBase {
  TCStoreName = 'TestCase'
  constructor() {
    super('test', 'articles')
    this.testIds =
      get(this.TCStoreName) || this.data.items.map(({ id }) => id).slice(0, 1)
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
          content: require('@/assets/defaultTestArticle.md?raw'),
          dirty: false,
        },
        {
          id: uniqueId(idPrefix),
          name: '默认文章.json',
          content: JSON.stringify(
            require('@/assets/defaultTestArticle.json?raw')
          ),
          dirty: false,
        },
      ],
    }
  }
  save() {
    super.save()
    set(this.TCStoreName, this.testIds)
  }
  getTestIds() {
    return this.testIds
  }
  addTestCase(testCase) {
    this.testIds.push(testCase)
  }
  removeTestCase(testCase) {
    const index = this.testIds.indexOf(testCase)
    this.testIds.splice(index, 1)
  }
}
