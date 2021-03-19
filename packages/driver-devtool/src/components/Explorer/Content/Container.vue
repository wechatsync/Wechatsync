<template>
  <div class="container">
    <tab-bar :active="activeItem"></tab-bar>
    <div class="main" v-if="!!this.activeId">
      <split-pane
        split="horizontal"
        :default-percent="100"
        :min-percent="10"
        className="split-pane-resizer-content"
      >
        <template slot="paneL">
          <code-editor :active="activeItem"></code-editor>
        </template>
        <!-- <template slot="paneR">
          <console></console>
        </template> -->
      </split-pane>
    </div>
  </div>
</template>

<script>
import CodeEditor from './CodeEditor.vue'
import Console from './Console.vue'
import TabBar from './TabBar.vue'
import { getById } from '@/store/controller/section'
export default {
  components: { TabBar, CodeEditor, Console },
  props: {
    activeId: String,
  },
  computed: {
    activeItem() {
      return getById(this.activeId) || {}
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
}
.main {
  flex: 1;
}
.split-pane-resizer-content {
  background-color: var(--line-color);
}
</style>
