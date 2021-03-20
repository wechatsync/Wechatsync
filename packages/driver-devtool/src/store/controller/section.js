import { articles, adapters } from '@/store/state'
import { uniqueId } from '@/utils/file'

export function save() {
  articles.save()
  adapters.save()
}

export function getById(id) {
  if (articles.is(id)) {
    return articles.get(id)
  } else if (adapters.is(id)) {
    return adapters.get(id)
  }

  return null
}

export function getArticles() {
  return articles.data
}

export function getAdapters() {
  return adapters.data
}

export function getTestCases() {
  const { data, testIds } = articles
  return data.items.filter(({ id }) => testIds.includes(id))
}

export function getTestCaseIds() {
  return articles.testIds
}

export const removeTestCase = articles.removeTestCase.bind(articles)
export const addTestCase = articles.addTestCase.bind(articles)

export function create(data) {
  data.id = uniqueId(data.idPrefix)
  delete data.idPrefix
  if (articles.is(data.id) && articles.check(data)) {
    articles.add(data)
  } else if (adapters.is(data.id) && adapters.check(data)) {
    adapters.add(data)
  }
  return data.id
}

export function rename(data) {
  const { id } = data
  if (!id) return
  if (articles.is(id) && articles.check(data)) {
    articles.merge(id, data)
  } else if (adapters.is(id) && adapters.check(data)) {
    adapters.merge(id, data)
  }
}

export function trash(id) {
  if (articles.is(id)) {
    articles.delete(id)
  } else if (adapters.is(id)) {
    adapters.delete(id)
  }
}

export function changeProperty(data) {
  const { id } = data
  if (!id) return
  if (articles.is(id)) {
    articles.merge(id, data)
  } else if (adapters.is(id)) {
    adapters.merge(id, data)
  }
}

export function isAdapter(data) {
  const { id } = data
  return adapters.is(id)
}
