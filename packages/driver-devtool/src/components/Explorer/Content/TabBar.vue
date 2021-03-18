<template>
  <tabs :items="items" class="tabbar" @click="activeFile">
    <template v-slot:front="slotProps">
      <v-icon
        :name="slotProps.icon.name"
        :style="slotProps.icon.style"
        class="file-icon"
      />
    </template>
    <template v-slot:post="slotProps">
      <v-icon
        scale="0.8"
        class="action-icon"
        :name="slotProps.item.dirty ? 'circle' : 'times'"
        @click.stop="closeFile(slotProps.item.id)"
      />
    </template>
  </tabs>
</template>

<script>
import Tabs from '@/ui/Tabs.vue'
import OpenedFiles from '@/state/OpenedFiles'
import { getIconInfo } from '@/utils/file'
export default {
  components: { Tabs },
  data() {
    this.$OpenedFilesInstance = new OpenedFiles()
    return {
      ids: this.$OpenedFilesInstance.data,
    }
  },
  props: {
    active: {
      type: Object,
      default: {},
    },
  },
  created() {
    this.openActiveFile(this.active.id)
  },
  watch: {
    'active.id'(value, oldValue) {
      this.openActiveFile(value, oldValue)
    },
  },
  computed: {
    items() {
      return this.ids
        .map((id) => {
          const { name, dirty } = this.$parent.query(id) ?? {}
          return {
            id,
            name,
            icon: getIconInfo(name),
            dirty,
            active: id === this.active.id,
          }
        })
        .filter(Boolean)
    },
  },
  methods: {
    closeFile(id) {
      let nextId = ''
      if (this.active.id === id) {
        const index = this.ids.indexOf(id)
        nextId = this.ids[index - 1] || this.ids[index + 1]
      }
      this.$OpenedFilesInstance.remove(id)
      if (nextId) {
        this.$emit('on-active', nextId)
      }
    },
    openActiveFile(currentId, prevId) {
      if (this.ids.includes(currentId)) {
      } else {
        this.$OpenedFilesInstance.add(prevId, currentId)
      }
    },
    activeFile(id) {
      id !== this.active.id && this.$emit('on-active', id)
    },
  },
}
</script>

<style scoped lang="scss">
.tabbar {
  background-color: var(--foreground-color);
  & ::v-deep li {
    border-right: 1px solid var(--line-color);

    .action-icon {
      margin-left: 0.5em;
      visibility: hidden;
      fill: var(--icon-default-color);
    }
    .file-icon {
      margin-right: 0.2em;
    }
    &.active {
      background-color: var(--background-color);
    }
    &:hover {
      .action-icon {
        visibility: visible;
      }
    }
  }
}
</style>
