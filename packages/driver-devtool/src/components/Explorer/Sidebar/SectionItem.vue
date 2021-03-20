<template>
  <li
    :class="['select-item', active ? 'active' : '']"
    @click="doActive"
    tabindex="0"
    @keyup.enter="startRename"
    @keyup.delete="confirmDelete"
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
        @keyup.esc="cancelModify"
        @blur="cancelModify"
      />
      <span :label="name" v-else>{{ name }}</span>
    </div>
    <slot />
  </li>
</template>

<script>
import { getIconInfo } from '@/utils/file'
import { rename, trash } from '@/store/controller/section'
import { setId as setActiveId } from '@/store/controller/activeItem'
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
    cancelModify() {
      if (this.isNew) {
        this.$emit('cancel')
      } else {
        this.isEditing = false
        this.editingName = this.name
      }
    },
    submitModify() {
      if (this.isNew) {
        this.$emit('submit', { name: this.editingName })
      } else {
        if (this.editingName && this.editingName !== this.name) {
          rename({
            id: this.id,
            name: this.editingName,
          })
          setActiveId(this.id)
        }
        this.isEditing = false
      }
    },
    confirmDelete() {
      if (window.confirm(`确定删除 “${this.name}” ？此操作不可撤销。`)) {
        trash(this.id)
        if (this.active) {
          setActiveId('')
        }
      }
    },
    startRename() {
      this.isEditing = true
    },
    doActive() {
      !this.active && setActiveId(this.id)
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
  font-size: 0.875rem;
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
  text-overflow: ellipsis;
  white-space: nowrap;
}
.editor {
  outline: none;
  border: none;
  display: inline-block;
  width: 100%;
  background-color: inherit;
  padding: 0;
}
</style>
