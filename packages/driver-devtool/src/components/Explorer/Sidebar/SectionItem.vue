<template>
  <li
    :class="['select-item', active ? 'active' : '']"
    @click="!active && $emit('on-active', id)"
    tabindex="0"
    @keyup.enter="startRename"
    @keyup.delete="confirmDelete"
    @contextmenu.prevent="onContextmenu"
  >
    <div class="icon">
      <v-icon :name="icon.name" :style="icon.style" />
    </div>
    <div class="content">
      <input
        v-focus
        v-model="editingName"
        type="text"
        ref="editor"
        class="editor"
        v-if="isEditing"
        @keyup.stop
        @keyup.enter="submitModify"
        @keyup.esc="giveupModify"
        @blur="giveupModify"
      />
      <span v-else>{{ name }}</span>
    </div>
    <slot />
  </li>
</template>

<script>
import { getIconInfo } from '@/utils/file'
export default {
  props: {
    name: {
      type: String,
      default: '',
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    id: String,
    active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isEditing: this.isNew,
      editingName: this.name,
    }
  },
  computed: {
    icon() {
      return getIconInfo(this.editingName)
    },
  },
  methods: {
    giveupModify() {
      if (this.isNew) {
        this.$emit('on-create-finish')
      } else {
        this.isEditing = false
        this.editingName = this.name
      }
    },
    submitModify() {
      if (this.editingName && this.editingName !== this.name) {
        this.$emit('on-change', {
          id: this.id,
          name: this.editingName,
        })
      }

      if (this.isNew) {
        this.$emit('on-create-finish')
      } else {
        this.isEditing = false
      }
    },
    confirmDelete() {
      if (window.confirm(`确定删除 “${this.name}” ？此操作不可撤销。`)) {
        this.$emit('on-delete', this.id)
      }
    },
    startRename() {
      this.isEditing = true
    },
    onContextmenu(event) {
      this.$emit('on-contextmenu', event, {
        rename: this.startRename,
        delete: this.confirmDelete,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.select-item {
  list-style: none;
  padding: 0.4em 1em;
  vertical-align: middle;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  &.active {
    background-color: var(--background-color);
  }
}
.icon {
  margin-right: var(--space-width);
  svg {
    height: 1em;
    width: auto;
  }
}
.content {
  display: inline-block;
  flex: 1;
  overflow: hidden;
  overflow-y: visible;
  text-overflow: ellipsis;
}
.editor {
  outline: none;
  border: none;
  display: inline-block;
  width: 100%;
  background-color: inherit;
}
</style>
