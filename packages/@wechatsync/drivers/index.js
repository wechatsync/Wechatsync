function importAll(r) {
  const modules = {}
  r.keys().forEach(key => {
    const module = r(key)
    const moduleName = module?.default?.name
    if (moduleName && moduleName !== 'BaseAdapter') {
      modules[moduleName] = module.default
    }
  })
  return modules
}

export default importAll(require.context('./src', false, /\.js$/))
