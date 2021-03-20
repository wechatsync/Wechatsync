<template>
  <div class="container">
    <tab-bar :active="activeItem"></tab-bar>
    <div class="main" v-if="!!this.activeId">
      <split-pane
        split="horizontal"
        :default-percent="panelPercent"
        :min-percent="10"
        className="split-pane-resizer-content"
        @resize="recordPanelPercent"
      >
        <template slot="paneL">
          <code-editor
            :active="activeItem"
            :theme="theme"
            @toggle-terminal="toggleTerminal"
          ></code-editor>
        </template>
        <template slot="paneR">
          <terminal :theme="theme" @toggle-terminal="toggleTerminal"></terminal>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script>
import CodeEditor from './CodeEditor.vue'
import Terminal from './Terminal.vue'
import TabBar from './TabBar.vue'
import { getById } from '@/store/controller/section'
import {
  addThemeChangeListener,
  removeThemeChangeListener,
} from '@/utils/theme'
import { get, set } from '@/utils/localStore'

export default {
  components: { TabBar, CodeEditor, Terminal },
  props: {
    activeId: String,
  },
  data() {
    this.$preferPanelPercent = get('preference_terminal_panel_percent') ?? 70
    return {
      panelPercent: this.$preferPanelPercent,
      theme: window.__theme,
    }
  },
  computed: {
    activeItem() {
      return getById(this.activeId) || {}
    },
  },
  methods: {
    recordPanelPercent(value) {
      this.$preferPanelPercent = value
      set('preference_terminal_panel_percent', this.$preferPanelPercent)
    },
    toggleTerminal() {
      if (this.panelPercent === 100) {
        this.panelPercent =
          this.$preferPanelPercent === 100 ? 70 : this.$preferPanelPercent
      } else {
        this.panelPercent = 100
      }
    },
    onThemeChange(theme) {
      this.theme = theme
    },
  },
  mounted() {
    addThemeChangeListener(this.onThemeChange)
  },
  beforeDestroy() {
    removeThemeChangeListener(this.onThemeChange)
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
</style>

<style>
.split-pane-resizer-content {
  background: transparent !important;
  border-color: transparent !important;
}
</style>
