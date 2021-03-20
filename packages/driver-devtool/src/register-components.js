/**
 * We register all the components so future cli-ui plugins
 * could use them directly
 */

import Vue from 'vue'

// vue-codemirror
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
Vue.use(VueCodemirror)

// splitPane
import splitPane from 'vue-splitpane'
Vue.component('split-pane', splitPane)

// contextmenu
import contextmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
Vue.use(contextmenu)

// prefect-scrollbar
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'
Vue.use(PerfectScrollbar)

// https://webpack.js.org/guides/dependency-management/#require-context
// https://cn.vuejs.org/v2/guide/components-registration.html#基础组件的自动化全局注册
const requireComponent = require.context(
  './ui',
  true,
  /[a-z0-9]+\.(jsx?|vue)$/i
)

// For each matching file name...
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)
  const componentName = fileName
    .substr(fileName.lastIndexOf('/') + 1)
    // Remove the file extension from the end
    .replace(/\.\w+$/, '')
  // Globally register the component
  Vue.component(componentName, componentConfig.default || componentConfig)
})
