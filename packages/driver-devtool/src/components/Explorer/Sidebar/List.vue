<template>
  <div class="sidebar">
    <v-contextmenu ref="contextmenu" @hide="contextMenuTriggers = []">
      <v-contextmenu-item @click="selectContextMenuItem('rename')"
        >重命名</v-contextmenu-item
      >
      <v-contextmenu-item @click="selectContextMenuItem('delete')"
        >删除</v-contextmenu-item
      >
    </v-contextmenu>
    <sidebar-section
      v-for="section in sections"
      :key="section.key"
      :activeId="activeId"
      v-bind="section"
      v-on="$listeners"
      @on-contextmenu="showContextMenu"
    />
  </div>
</template>

<script>
import SidebarSection from './Section.vue'
export default {
  components: {
    SidebarSection,
  },
  props: {
    activeId: String,
    sections: Array,
  },
  data() {
    return {
      contextMenuTriggers: [],
    }
  },
  methods: {
    showContextMenu(event, trigger) {
      this.$refs.contextmenu.show({
        top: event.clientY,
        left: event.clientX,
      })
      this.contextMenuTriggers = [trigger]
    },
    selectContextMenuItem(type) {
      this.contextMenuTriggers.forEach((trigger) => trigger[type]?.())
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}
section {
  flex: 1;
}
</style>
