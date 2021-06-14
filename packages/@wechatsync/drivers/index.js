function importAll(r) {
  const modules = {}
  r.keys().forEach(key => {
    const module = r(key)
    const moduleName = module.default ? module.default.name : null
    if (moduleName && moduleName !== 'BaseAdapter') {
      modules[moduleName] = module.default
    }
    // console.log('moduleName', moduleName)
  })
  return modules
}

export default importAll(require.context('./src', false, /\.js$/))
