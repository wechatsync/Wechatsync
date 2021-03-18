export function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch (e) {
    console.log('LocalStorage Get Error', e)
  }
}

export function set(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.log('LocalStorage Get Error', e)
  }
}
