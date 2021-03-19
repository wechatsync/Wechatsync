<template>
  <div class="sidebar">
    <sidebar-section
      v-for="(section, index) in options.sections"
      :key="section.key"
      :activeId="activeId"
      :style="{ flex: options.flex[index] }"
      v-bind="section"
      v-on="$listeners"
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
    options: Object,
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--foreground-color);
}
</style>
