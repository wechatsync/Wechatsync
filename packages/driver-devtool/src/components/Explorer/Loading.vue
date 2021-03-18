<template>
  <div class="container">
    <div class="download-tip" v-if="showDownload">
      <h1>未检测到插件</h1>
      <h3>请安装同步助手Chrome插件</h3>
      <p>
        <a href="https://www.wechatsync.com/#install" target="_blank"
          >https://www.wechatsync.com/#install</a
        >
      </p>
    </div>
    <loading-bar v-else></loading-bar>
  </div>
</template>

<script>
import LoadingBar from '@/ui/LoadingBar.vue'
export default {
  components: { LoadingBar },
  props: {
    showDownload: Boolean,
  },
}
</script>

<style scoped lang="scss">
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.download-tip {
  text-align: center;
  padding: 3em 6em;
  box-shadow: var(--shadow-color) 0px 0px 20px 2px;
  border-radius: 0.5em;
  a {
    color: var(--theme-primary-color);
  }
}
</style>
