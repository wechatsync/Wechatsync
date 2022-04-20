const maxTaskLength = 25

export default class Store {
  constructor(engine) {}

  getAccounts() {
    var accounts = localStorage.getItem('accounts')
    if (accounts == null) {
      accounts = []
    } else {
      accounts = JSON.parse(accounts)
      accounts = accounts.map(function (t) {
        if (t.type == 'wordpress') {
          t.icon = chrome.extension.getURL('images/wordpress.ico')
        }
        if (t.type == 'typecho') {
          t.icon = chrome.extension.getURL('images/typecho.ico')
        }
        return t
      })
    }
    return accounts
  }

  getList(key) {
    var accounts = localStorage.getItem(key)
    if (accounts == null) {
      accounts = []
    } else {
      accounts = JSON.parse(accounts)
      accounts.forEach((a, index) => {
        a.index = index
      })
    }
    return accounts
  }

  addAccount({ uid, type, params, title }) {
    var accounts = this.getAccounts()
    var has = accounts.filter((r) => {
      return r.uid == uid
    })

    if (has.length) {
      return false
    }

    accounts.push({
      uid,
      type,
      params,
      title,
    })

    localStorage.setItem('accounts', JSON.stringify(accounts))
    return true
  }

  getTasks() {
    return this.getList('tasks')
  }

  getTask(tid) {
    var tasks = this.getTasks()
    return tasks[tid]
  }

  editTask(tid, obj) {
    var tasks = this.getTasks()
    if (!tasks[tid]) return
    tasks[tid] = Object.assign(tasks[tid], obj)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    if (typeof window.syncer != 'undefined') {
      console.log('send message to task submmiter')
      var sender = window.syncer.getSender(tasks[tid].guid)
      if (sender) {
        try {
          // console.log(chrome.runtime.lastError);
          chrome.tabs.sendMessage(
            sender.tab.id,
            { method: 'taskUpdate', task: tasks[tid] },
            function (response) {}
          )
        } catch (e) {}
      }
    }
  }

  addTask(t) {
    console.log('store.addTask', t)
    var tasks = this.getTasks()
    tasks.push(t)
    if (tasks.length > maxTaskLength) {
      tasks.shift()
    }

    localStorage.setItem('tasks', JSON.stringify(tasks))
  }
}
