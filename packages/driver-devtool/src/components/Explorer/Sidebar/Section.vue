<template>
  <section :style="sectionStyleObject">
    <collapse :title="title" @collapse-toggle="adjustHeight">
      <template v-slot:header>
        <div class="actions">
          <v-icon
            name="plus"
            class="action-icon"
            @click.stop="isAdding = !isAdding"
          />
          <label for="file-import" class="file-import" @click.stop>
            <v-icon name="folder-open" class="action-icon" />
            <input
              type="file"
              id="file-import"
              @change="importFile"
              accept="text/*"
            />
          </label>
        </div>
      </template>
      <template v-slot:default>
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
import { uniqueId } from '@/utils/file'
import SidebarSectionItem from './SectionItem.vue'
export default {
  components: { SidebarSectionItem },
  data() {
    return {
      isAdding: false,
      sectionStyleObject: {
        flex: 1,
      },
    }
  },
  props: {
    title: String,
    items: Array,
    activeId: String,
    idPrefix: String,
  },
  methods: {
    adjustHeight(isOpen) {
      this.sectionStyleObject.flex = isOpen ? 1 : 0
    },
    createNewFile({ name }) {
      this.$emit('on-create', {
        id: uniqueId(this.idPrefix),
        name,
        content: '',
      })
    },
    importFile(event) {
      const input = event.target
      const fileObject = input.files[0]
      if (fileObject) {
        const fileName = fileObject.name
        const fileReader = new FileReader()

        fileReader.onload = () => {
          this.$emit('on-create', {
            id: uniqueId(this.idPrefix),
            name: fileName,
            content: fileReader.result,
          })
        }
        fileReader.readAsText(fileObject)
      }
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
.file-import {
  cursor: inherit;
  svg {
    vertical-align: 0;
  }
  input {
    display: none;
  }
}
</style>
