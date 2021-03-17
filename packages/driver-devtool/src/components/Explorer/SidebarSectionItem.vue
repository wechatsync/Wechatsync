<template>
  <li
    :class="['select-item', active ? 'active' : '']"
    @click="!active && $emit('on-active', id)"
  >
    <div class="icon">
      <v-icon :name="iconName" />
    </div>
    <div class="content">
      <input
        v-focus
        v-model="editingName"
        type="text"
        ref="editor"
        class="editor"
        v-if="isEditing"
        @keyup.enter="confirmModify"
        @keyup.esc="giveupModify"
        @blur="confirmModify"
      />
      <span v-else>{{ name }}</span>
    </div>
    <slot />
  </li>
</template>

<script>
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
    iconName() {
      const extRegExp = /\.(md|js)$/
      const extType = extRegExp.exec(this.editingName)?.[1]
      const ext2Icon = {
        md: 'brands/markdown',
        js: 'brands/js-square',
      }

      return ext2Icon[extType] || 'stream'
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
    confirmModify() {
      if (this.editingName && this.editingName !== this.name) {
        this.$emit('on-change', {
          id: this.id,
          name: this.editingName,
        })
        this.isEditing = false
      }
      if (this.isNew) {
        this.$emit('on-create-finish')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.select-item {
  list-style: none;
  padding: 0.4em 0.6em;
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
