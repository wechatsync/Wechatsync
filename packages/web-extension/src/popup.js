import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMoment from 'vue-moment'
import { store } from './store/store'
import EntryView from './views/EntryView.vue'
import Option from './views/Option.vue'
import AddAccount from './views/AddAccount.vue'
import TaskDetail from './views/TaskDetail.vue'
import Mint from 'mint-ui'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

Vue.use(Mint)
Vue.use(VueRouter)
Vue.use(VueMoment)

var routes = [
  {
    path: '/options',
    component: Option,
  },
  {
    path: '/',
    component: EntryView,
    meta: {
      index: 1,
    },
  },
  {
    name: 'AddAccount',
    path: '/add-account',
    component: AddAccount,
    meta: {
      index: 1,
    },
  },
  {
    name: 'TaskDetail',
    path: '/task-detail',
    component: TaskDetail,
    meta: {
      index: 1,
    },
  },
]

import {
  initializeDriver,
  getDriverProvider,
  initDevRuntimeEnvironment,
} from '@/runtime'

// var serviceFactory = require('./providers/factory')
initDevRuntimeEnvironment()

var winBackgroundPage = chrome.extension.getBackgroundPage()
var db = winBackgroundPage.db
window.db = db

var router = new VueRouter({
  routes,
})
const app = new Vue({
  router,
  store,
})
app.$mount('#app')
