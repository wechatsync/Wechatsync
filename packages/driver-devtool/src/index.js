import Vue from 'vue'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

import contextmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
Vue.use(contextmenu);

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)


// or import all icons if you don't care about bundle size
/* Register component with one of 2 methods */

// import Icon from 'vue-awesome/components/Icon'
var Icon = require('vue-awesome')
// globally (in your main .js file)
Vue.component('v-icon', Icon)
Vue.directive('highlightjs', {
  deep: true,
  bind: function bind(el, binding) {
   hljs.highlightBlock(el);
  },
  componentUpdated: function componentUpdated(el, binding) {
    // after an update, re-fill the content and then highlight
    var targets = el.querySelectorAll('code');
    var target;
    var i;

    for (i = 0; i < targets.length; i += 1) {
      target = targets[i];
      if (typeof binding.value === 'string') {
        target.textContent = binding.value;
      }
      hljs.highlightBlock(target);
    }
  }
});

// use
Vue.use(VueCodemirror, /* {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */)
