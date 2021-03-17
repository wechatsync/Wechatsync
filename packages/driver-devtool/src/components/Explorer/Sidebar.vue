<template>
  <div class="sidebar">
    <sidebar-section
      v-for="section in sections"
      :key="section.key"
      :prefix="section.key + '_'"
      :activeId="activeId"
      v-bind="section"
      @on-active="activeItem"
      @on-change="changeItemName"
      @on-create="createnNewItem"
    />
  </div>
</template>

<script>
import SidebarSection from './SidebarSection.vue'
import uniqueId from 'lodash/fp/uniqueId'
export default {
  components: {
    SidebarSection,
  },
  data() {
    return {
      sections: [
        {
          key: 'test',
          title: '测试用例',
          items: [
            {
              id: uniqueId('test_'),
              name: '默认文章.md',
              content: require('@/assets/defaultTestArticle.md'),
            },
          ],
        },
        {
          key: 'adapter',
          title: '适配器',
          items: [
            {
              id: uniqueId('adapter_'),
              name: 'template.js',
              content: require('@wechatsync/drivers/src/BaseAdapter'),
            },
          ],
        },
      ],
      activeId: '',
    }
  },
  methods: {
    activeItem(itemId) {
      this.activeId = itemId
    },
    findSectionByItemId(itemId) {
      const key = /^(.+)_/.exec(itemId)?.[1]
      return this.sections.find((section) => (section.key = key))
    },
    checkNameValid(name, items) {
      if (items.find((item) => item.name === name)) {
        return false
      }
      return true
    },
    changeItemName({ id, name }) {
      const items = this.findSectionByItemId(id)?.items
      if (this.checkNameValid(name, items)) {
        const item = items.find((item) => item.id === id)
        item.name = name
      }
    },
    createnNewItem({ id, name }) {
      const items = this.findSectionByItemId(id)?.items
      if (this.checkNameValid(name, items)) {
        console.log(name)
        items.push({
          id,
          name,
          content: '',
        })
        this.activeId = id
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
}
section {
  max-height: 50%;
  flex: 1;
}
</style>
