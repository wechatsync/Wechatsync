/**
 * We register all the components so future cli-ui plugins
 * could use them directly
 */

import Vue from 'vue'
import splitPane from 'vue-splitpane'

Vue.component('split-pane', splitPane)

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
