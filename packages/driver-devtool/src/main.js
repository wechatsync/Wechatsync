import './plugins'
import './register-icons'
import './register-components'
import './register-directives'

import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
Vue.config.devtools = true

const app = new Vue({
  router,
  ...App,
})

app.$mount('#app')
