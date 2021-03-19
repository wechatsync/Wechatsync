<template>
  <div class="container">
    <header>
      <navbar />
    </header>
    <main>
      <split-pane
        split="vertical"
        :default-percent="20"
        :min-percent="0"
        className="split-pane-resizer"
      >
        <template slot="paneL">
          <!-- fix splitpane bug -->
          <sidebar
            :style="{
              marginRight: '-3px',
              height: '100%',
            }"
            :options="sidebarOptions"
            :activeId="activeItem.id"
            @on-active="onActiveItem"
            @on-change="onChangeItem"
            @on-create="onAddItem"
            @on-delete="onDeleteItem"
          />
        </template>
        <template slot="paneR">
          <!-- fix splitpane bug -->
          <div
            :style="{
              marginLeft: '-3px',
              height: '100%',
            }"
          >
            <content-container
              :activeId="activeItem.id"
              :query="queryItemById"
              @on-active="onActiveItem"
              @on-change="onChangeItem"
            ></content-container>
          </div>
        </template>
      </split-pane>
    </main>
    <footer></footer>
  </div>
</template>

<script>
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar/List.vue'
import ContentContainer from './Content/Container.vue'
import { Articles, Adapters, ActiveItem } from '@/state'

export default {
  components: { Navbar, Sidebar, ContentContainer },

  data() {
    this.$articlesInstance = new Articles()
    this.$adaptersInstance = new Adapters()
    this.$activeItemInstance = new ActiveItem()
    return {
      articles: this.$articlesInstance.data,
      adapters: this.$adaptersInstance.data,
      activeItem: this.$activeItemInstance.data,
    }
  },
  computed: {
    sidebarOptions() {
      return {
        sections: [this.articles, this.adapters],
        flex: [0, 1],
      }
    },
  },
  methods: {
    onActiveItem(itemId) {
      this.$activeItemInstance.set({ id: itemId })
    },
    onChangeItem(data) {
      console.trace()
      try {
        const { id } = data
        if (this.$articlesInstance.in(id)) {
          this.$articlesInstance.merge(id, data)
        } else if (this.$adaptersInstance.in(id)) {
          this.$adaptersInstance.merge(id, data)
        }
        this.$activeItemInstance.set({ id })
      } catch (e) {
        window.confirm(e.message)
      }
    },
    onAddItem(data) {
      try {
        const { id } = data
        if (this.$articlesInstance.in(id)) {
          this.$articlesInstance.add(data)
        } else if (this.$adaptersInstance.in(id)) {
          this.$adaptersInstance.add(data)
        }

        this.$activeItemInstance.set({ id })
      } catch (e) {
        window.confirm(e.message)
      }
    },
    onDeleteItem(id) {
      if (this.$articlesInstance.in(id)) {
        this.$articlesInstance.delete(id)
      } else if (this.$adaptersInstance.in(id)) {
        this.$adaptersInstance.delete(id)
      }
    },
    queryItemById(id) {
      return this.$articlesInstance.get(id) ?? this.$adaptersInstance.get(id)
    },
  },
  beforeDestroy() {
    this.$adaptersInstance.save()
    this.$$articlesInstance.save()
  },
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
main {
  flex: 1;
}
</style>

<style>
.split-pane-resizer {
  border-color: transparent !important;
  background-color: transparent !important;
}
</style>
