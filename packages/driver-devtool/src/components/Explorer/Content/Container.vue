<template>
  <div class="container">
    <tab-bar :active="activeItem" v-on="$listeners"></tab-bar>
    <div class="main">
      <split-pane
        split="horizontal"
        :default-percent="80"
        :min-percent="10"
        className="split-pane-resizer-content"
      >
        <template slot="paneL">
          <code-editor :fileName="activeItem.name"></code-editor>
        </template>
        <template slot="paneR">
          <console></console>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script>
import CodeEditor from './CodeEditor.vue'
import Console from './Console.vue'
import TabBar from './TabBar.vue'
export default {
  components: { TabBar, CodeEditor, Console },
  props: {
    activeId: String,
    query: Function,
  },
  computed: {
    activeItem() {
      return this.query(this.activeId) || {}
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
