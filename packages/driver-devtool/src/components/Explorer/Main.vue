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
          <sidebar
            :style="{
              marginRight: '-3px',
            }"
          />
        </template>
        <template slot="paneR">
          <div
            :style="{
              marginLeft: '-3px',
            }"
          >
            <code-editor />
          </div>
        </template>
      </split-pane>
    </main>
    <footer></footer>
  </div>
</template>

<script>
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'
import CodeEditor from './CodeEditor.vue'
export default {
  components: { Navbar, Sidebar, CodeEditor },
}
</script>

<style scoped>
.container {
  height: 100vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.split-pane-resizer {
  border-color: var(--line-color);
}
main {
  flex: 1;
}
</style>
