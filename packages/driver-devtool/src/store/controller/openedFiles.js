import { openedFiles } from '@/store/state'

export function getData() {
  return openedFiles.data
}

export const remove = openedFiles.remove.bind(openedFiles)
export const add = openedFiles.add.bind(openedFiles)
