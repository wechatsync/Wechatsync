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
          <label class="file-import" @click.stop>
            <v-icon name="folder-open" class="action-icon" />
            <input type="file" @change="importFile" accept="text/*" />
          </label>
        </div>
      </template>
      <template v-slot:default>
        <v-contextmenu
          ref="contextmenu"
          @contextmenu="recordContextMenuTrigger"
        >
          <v-contextmenu-item
            @click="contextMenuTrigger && contextMenuTrigger.startRename()"
            >重命名</v-contextmenu-item
          >
          <v-contextmenu-item
            @click="contextMenuTrigger && contextMenuTrigger.confirmDelete()"
            >删除</v-contextmenu-item
          >
        </v-contextmenu>
        <ul class="select-list">
          <sidebar-section-item
            v-for="item in items"
            :key="item.id"
            :name="item.name"
            :id="item.id"
            :active="activeId === item.id"
            v-contextmenu:contextmenu
          >
            <slot name="item" v-bind:id="item.id" />
          </sidebar-section-item>
        </ul>
        <sidebar-section-item
          v-if="isAdding"
          isNew
          @submit="createNewFile"
          @cancel="isAdding = false"
        />
      </template>
    </collapse>
  </section>
</template>

<script>
import SidebarSectionItem from './SectionItem.vue'
import { create } from '@/store/controller/section'
import { setId as setActiveId } from '@/store/controller/activeItem'
export default {
  components: { SidebarSectionItem },
  data() {
    return {
      isAdding: false,
      sectionStyleObject: {},
      contextMenuTrigger: null,
    }
  },
  props: {
    title: String,
    items: Array,
    activeId: String,
    idPrefix: String,
  },
  methods: {
    recordContextMenuTrigger(vNode) {
      this.contextMenuTrigger = vNode.componentInstance
    },
    adjustHeight(isOpen) {
      this.sectionStyleObject.flex = isOpen ? 1 : 0
    },
    createNewFile({ name }) {
      const newId = create({
        idPrefix: this.idPrefix,
        name,
        content: '',
      })
      this.isAdding = false
      setActiveId(newId)
    },
    importFile(event) {
      const { idPrefix } = this
      const input = event.target
      const fileObject = input.files[0]
      const newFilePayload = {}
      if (fileObject) {
        const fileName = fileObject.name
        const fileReader = new FileReader()

        fileReader.onload = () => {
          try {
            Object.assign(newFilePayload, {
              idPrefix,
              name: fileName || `Untitled-${+new Date()}`,
              content: fileReader.result,
            })
            setActiveId(create(newFilePayload))
          } catch (e) {
            if (e.message === 'Name Duplicate') {
              Object.assign(newFilePayload, {
                idPrefix,
                name: `${fileName}-${+new Date()}`,
                content: fileReader.result,
              })
              setActiveId(create(newFilePayload))
            }
          }
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
