class Log {
  formatter(args) {
    const type = Object.prototype.toString
      .call(args)
      .match(/\[object (.+)\]/)?.[1]
      ?.toLowerCase()
    if (type === 'string') {
      return {
        title: args,
      }
    }
    if (type === 'object') {
      return {
        title: args.title,
        content: args.info,
      }
    }
    if (type === 'array') {
      return {
        title: args[0],
        content: args.slice(1),
      }
    }
  }
  addInfoLog(args) {
    return this.#addLog(args, 'info')
  }
  addErrorLog(args) {
    return this.#addLog(args, 'error')
  }
  addSuccessLog(args) {
    return this.#addLog(args, 'success')
  }
  addInspectLog(args) {
    return this.#addLog(
      {
        title: args[0],
        info: args
          .slice(1)
          .map(_ => {
            if (typeof _ == 'object') return JSON.stringify(_, null, '\t')
            return _
          })
          .join('\t'),
      },
      'inspect'
    )
  }
  getLogs() {
    return this.#logs
  }
  clearLogs() {
    this.#logs.splice(0, this.#logs.length)
  }
  #genId = 0
  #logs = []
  #addLog(_args, level = 'info') {
    const log = {
      uid: this.#genId++,
      time: Date.now(),
      level,
      ...this.formatter(_args),
    }
    this.#logs.push(log)
  }
}

export default new Log()
