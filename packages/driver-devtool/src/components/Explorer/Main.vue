<template>
  <div class="container">
    <header>
      <navbar />
    </header>
    <main>
      <split-pane
        split="vertical"
        :default-percent="20"
        :min-percent="0"
        className="split-pane-resizer"
      >
        <template slot="paneL">
          <!-- fix splitpane bug -->
          <sidebar
            :activeId="activeItem.id"
            :style="{
              marginRight: '-3px',
              height: '100%',
            }"
          />
        </template>
        <template slot="paneR">
          <!-- fix splitpane bug -->
          <div
            :style="{
              marginLeft: '-3px',
              height: '100%',
            }"
          >
            <content-container :activeId="activeItem.id"></content-container>
          </div>
        </template>
      </split-pane>
    </main>
    <footer></footer>
  </div>
</template>

<script>
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar/List.vue'
import ContentContainer from './Content/Container.vue'
import { save as saveSection } from '@/store/controller/section'
import { getData as getActiveItem } from '@/store/controller/activeItem'
import log from '@/utils/log'

export default {
  components: { Navbar, Sidebar, ContentContainer },
  data() {
    return {
      activeItem: getActiveItem(),
    }
  },
  mounted() {
    window.addEventListener('beforeunload', function () {
      saveSection()
    })
    window.$syncer.startInspect(function (args) {
      log.addInspectLog(args)
      // console.log('log', args)
    })
  },
  errorCaptured(err) {
    const errorMap = new Map([
      ['Name Empty', '文件名为空，请重新设置'],
      ['Name Duplicate', '文件名已存在，请重新设置'],
    ])
    if (errorMap.has(err.message)) {
      window.alert(errorMap.get(err.message))
      return false
    }
  },
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
main {
  flex: 1;
}
</style>

<style>
.split-pane-resizer {
  border-color: transparent !important;
  background-color: transparent !important;
}
</style>
