const callbacks = []
window.__onThemeChange = function(theme) {
  callbacks.forEach(cb => cb(theme))
}

export const addThemeChangeListener = func => callbacks.push(func)
export const removeThemeChangeListener = func =>
  (callbacks = callbacks.filter(f => f !== func))
