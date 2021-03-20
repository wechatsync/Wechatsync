<template>
  <div id="app" class="app">
    <router-view v-if="extensionInstalled"></router-view>
    <loading v-else :showDownload="checkTimes > 3" />
  </div>
</template>

<script>
import Loading from './components/Explorer/Loading.vue'
import './style/main.scss'

// check Extension installed
export default {
  components: { Loading },
  data() {
    return {
      extensionInstalled: false,
      checkTimes: 0,
    }
  },
  created() {
    this.pollCheckExtension()
  },
  methods: {
    pollCheckExtension() {
      const isInjected =
        Object.prototype.toString.call(window.$syncer) === '[object Object]'

      this.extensionInstalled = isInjected
      this.checkTimes = isInjected ? 0 : this.checkTimes + 1
      setTimeout(this.pollCheckExtension, 800)
    },
  },
}
</script>

<style lang="scss" scoped>
.app {
  height: 100vh;
  overflow: hidden;
}
</style>
