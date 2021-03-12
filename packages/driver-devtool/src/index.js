import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMoment from 'vue-moment'

//
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import "./main.css";

import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
Vue.use(contentmenu);

import Main from './App.vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import './styles/boot.css'

// or import all icons if you don't care about bundle size
// import 'vue-awesome/icons'
/* Register component with one of 2 methods */

// import Icon from 'vue-awesome/components/Icon'
var Icon = require('vue-awesome')
// globally (in your main .js file)
Vue.component('v-icon', Icon)

// use
Vue.use(mavonEditor)
Vue.use(VueRouter)
Vue.use(VueMoment)
Vue.use(VueCodemirror, /* {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */)

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
})
app.$mount('#app')
