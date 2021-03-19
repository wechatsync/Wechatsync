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
      <div :class="['icon-group', { unsave: slotProps.item.dirty }]">
        <v-icon scale="0.5" class="save-status-icon" name="circle" />
        <v-icon
          :scale="0.75"
          class="close-icon"
          :name="'times'"
          @click.stop="closeFile(slotProps.item.id)"
        />
      </div>
    </template>
  </tabs>
</template>

<script>
import Tabs from '@/ui/Tabs.vue'
import {
  getData as getOpenedFiles,
  remove as removeOpenedFile,
  add as addOpenedFile,
} from '@/store/controller/openedFiles'
import { getById } from '@/store/controller/section'
import { setId as setActiveId } from '@/store/controller/activeItem'
import { getIconInfo } from '@/utils/file'
export default {
  components: { Tabs },
  data() {
    return {
      ids: getOpenedFiles(),
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
          const item = getById(id)
          if (item) {
            return {
              id,
              name: item.name,
              icon: getIconInfo(item.name),
              dirty: item.dirty,
              active: id === this.active.id,
            }
          }
        })
        .filter(Boolean)
    },
  },
  methods: {
    closeFile(id) {
      if (this.active.id === id) {
        const index = this.ids.indexOf(id)
        const nextId = this.ids[index - 1] || this.ids[index + 1]
        setActiveId(nextId || '')
      }
      removeOpenedFile(id)
    },
    openActiveFile(currentId, prevId) {
      if (!currentId) return

      if (this.ids.includes(currentId)) {
        // 滚动定位
      } else {
        const index = prevId ? this.ids.indexOf(prevId) + 1 : this.ids.length
        addOpenedFile(index, currentId)
      }
    },
    activeFile(id) {
      id !== this.active.id && setActiveId(id)
    },
  },
}
</script>

<style scoped lang="scss">
.icon-group {
  position: relative;
  margin-left: 0.5em;
  .save-status-icon {
    visibility: hidden;
    fill: var(--icon-default-color);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .close-icon {
    visibility: hidden;
    fill: var(--icon-default-color);
  }

  &.unsave {
    .save-status-icon {
      visibility: visible;
    }
    .close-icon {
      visibility: hidden;
    }
  }
}

.tabbar {
  background-color: var(--foreground-color);
  & ::v-deep li {
    font-size: 0.875rem;
    border-right: 1px solid var(--line-color);

    .file-icon {
      margin-right: 0.5em;
    }
    &.active {
      background-color: var(--background-color);
      .icon-group:not(.unsave) {
        .close-icon {
          visibility: visible;
        }
      }
    }
    &:hover {
      .icon-group {
        .close-icon {
          visibility: visible;
        }
        .save-status-icon {
          visibility: hidden;
        }
      }
    }
  }
}
</style>
