class Log {
  addDebugLog(args) {
    return this.#addLog(args, 'debug')
  }
  addInspectLog(args) {
    return this.#addLog(args, 'inspect')
  }
  addLog(args) {
    return this.#addLog(args)
  }
  #logs = []
  #addLog(_args, category = 'normal') {
    const args = Array.isArray(_args) ? _args : [_args]
    const format = {
      uid: Date.now() + Math.floor(Math.random() * 10000),
      time: Date.now(),
      cat: category,
      content: args
        .map(_ => {
          if (typeof _ == 'object') return JSON.stringify(_)
          return _
        })
        .join('\t'),
    }
    this.#logs.push(format)

    console.log(this.#logs)
  }
}

export default new Log()
