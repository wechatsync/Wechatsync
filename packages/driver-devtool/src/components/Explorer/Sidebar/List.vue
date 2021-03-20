<template>
  <div class="sidebar">
    <sidebar-section
      :activeId="activeId"
      :style="{ flex: 0 }"
      v-bind="articles"
    >
      <template v-slot:item="slotProps">
        <label class="testcase-checker" @click.stop tabindex="-1">
          <input
            type="checkbox"
            :checked="testCases.includes(slotProps.id)"
            @change.prevent="selectTestCase(slotProps.id, $event)"
          />
          <v-icon scale="0.8" name="check" />
        </label>
      </template>
    </sidebar-section>
    <sidebar-section
      :activeId="activeId"
      :style="{ flex: 1 }"
      v-bind="adapters"
      :sectionType="articles.key"
    />
  </div>
</template>

<script>
import SidebarSection from './Section.vue'
import {
  getArticles,
  getAdapters,
  getTestCaseIds,
  removeTestCase,
  addTestCase,
} from '@/store/controller/section'
export default {
  components: {
    SidebarSection,
  },
  data() {
    return {
      articles: getArticles(),
      adapters: getAdapters(),
      testCases: getTestCaseIds(),
    }
  },
  props: {
    activeId: String,
  },
  methods: {
    selectTestCase(id, event) {
      if (event.target.checked) {
        addTestCase(id)
      } else {
        removeTestCase(id)
      }
    },
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

.testcase-checker {
  outline: none;
  cursor: pointer;
  input {
    display: none;
    & + svg {
      fill: var(--icon-unselected-color);
    }
    &:checked + svg {
      fill: var(--icon-selected-color);
    }
  }
}
</style>
