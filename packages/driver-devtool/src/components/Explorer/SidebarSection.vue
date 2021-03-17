<template>
  <section>
    <collapse :title="title">
      <template slot="header">
        <div class="actions">
          <v-icon
            name="plus"
            class="action-icon"
            @click.stop="isAdding = !isAdding"
          />
          <v-icon name="folder-open" class="action-icon" />
        </div>
      </template>
      <template slot="default">
        <ul class="select-list">
          <sidebar-section-item
            v-for="item in items"
            :key="item.id"
            :name="item.name"
            :id="item.id"
            :active="activeId === item.id"
            v-on="$listeners"
          >
          </sidebar-section-item>
        </ul>
        <sidebar-section-item
          v-if="isAdding"
          isNew
          @on-change="createNewFile"
          @on-create-finish="isAdding = false"
        />
      </template>
    </collapse>
  </section>
</template>

<script>
import uniqueId from 'lodash/fp/uniqueId'
import SidebarSectionItem from './SidebarSectionItem.vue'
export default {
  components: { SidebarSectionItem },
  data() {
    return {
      isAdding: false,
      newFileName: '',
    }
  },
  props: {
    title: String,
    items: Array,
    activeId: String,
    prefix: String,
  },
  methods: {
    createNewFile({ name }) {
      this.$emit('on-create', { id: uniqueId(this.prefix), name })
    },
  },
}
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  align-items: center;
  svg {
    fill: var(--icon-default-color);
    height: 0.8em;
    margin-left: 0.4em;
  }
}
.select-list {
  margin: 0;
  padding: 0;
}
</style>
