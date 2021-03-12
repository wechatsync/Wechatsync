import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMoment from 'vue-moment'
import { store } from './store'

import Main from './Main.vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import "./styles/boot.css"

// use
Vue.use(mavonEditor)

Vue.use(VueRouter)
Vue.use(VueMoment)

var routes = [
  {
    path: '/',
    component: Main,
    meta: {
      index: 1,
    },
  },
]

// var winBackgroundPage = chrome.extension.getBackgroundPage()
// var db = winBackgroundPage.db
// window.db = db
var router = new VueRouter({
  routes,
})
const app = new Vue({
  router,
  store,
})
app.$mount('#app')
