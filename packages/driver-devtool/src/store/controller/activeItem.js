import { activeItem } from '@/store/state'

export function setId(id) {
  activeItem.set({ id })
}

export function getId() {
  return activeItem.data.id
}

export function getData() {
  return activeItem.data
}
