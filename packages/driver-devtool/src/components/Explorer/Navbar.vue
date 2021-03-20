<template>
  <div class="navbar">
    <a href="/" class="logo">
      <v-icon name="logo" />&nbsp;<span>开发者工具</span>
    </a>
    <div class="right-content">
      <div class="help" @click="isModalVisible = true">
        <a><v-icon name="question-circle"></v-icon></a>
      </div>

      <toggle
        :true-value="`dark`"
        :false-value="`light`"
        :value="theme"
        @change="setTheme"
        class="theme-toggle"
      >
        <template v-slot:checked>
          <v-icon name="sun" class="theme-toggle-icon" />
        </template>
        <template v-slot:unchecked>
          <v-icon name="moon" class="theme-toggle-icon" />
        </template>
      </toggle>
      <ul class="links">
        <li v-for="link of links" :key="link.name" class="link-item">
          <a :href="link.url">{{ link.title }}</a>
        </li>
      </ul>
    </div>
    <modal v-if="isModalVisible" class="modal">
      <template v-slot:header>
        <header class="modal-header">
          <h1 class="title">功能介绍</h1>
          <v-icon name="times" @click="closeModal"></v-icon>
        </header>
      </template>
      <template v-slot:body
        ><feature-component class="modal-content"
      /></template>
      <template v-slot:footer>&nbsp;</template>
    </modal>
  </div>
</template>

<script>
import {
  addThemeChangeListener,
  removeThemeChangeListener,
} from '@/utils/theme'
import featureComponent from '@/assets/FEATURES.md'
import { get, set } from '@/utils/localStore'

export default {
  components: {
    featureComponent,
  },

  data() {
    this.$isRookie = !get('lastTimeStamp')
    return {
      theme: window.__theme,
      links: [
        {
          name: 'github',
          title: 'GitHub',
          url: 'https://github.com/wechatsync/Wechatsync',
        },
        {
          name: 'download',
          title: '插件下载',
          url: 'https://www.wechatsync.com/#install',
        },
      ],
      isModalVisible: this.$isRookie,
    }
  },
  mounted() {
    addThemeChangeListener(this.onThemeChange)
  },
  beforeDestroy() {
    removeThemeChangeListener(this.onThemeChange)
  },
  methods: {
    onThemeChange(theme) {
      this.theme = theme
    },
    setTheme(theme) {
      window.__setPreferredTheme(theme)
    },
    closeModal() {
      this.isModalVisible = false
      if (this.$isRookie) set('lastTimeStamp', +new Date())
    },
  },
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  padding: 0.8em var(--h-padding-width);
  align-items: center;
  border-bottom: 1px solid var(--line-color);
  background-color: var(--background-color);
}
.logo {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  > svg {
    width: auto;
    height: 2em; /* or any other relative font sizes */

    /* You would have to include the following two lines to make this work in Safari */
    max-width: 100%;
    max-height: 100%;
  }

  > span {
    font-weight: bold;
  }
}
.right-content {
  flex: 1;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.theme-toggle {
  font-size: 0.6rem;
}
.theme-toggle-icon {
  fill: var(--toggle-icon-color);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 70%;
  width: auto;
}
.links {
  margin: 0;
  padding-left: 1em;
}

.link-item {
  display: inline-block;
  padding: 0.2em 0.5em;
  border-radius: 0.2em;
  color: var(--font-secondary-color);
  > a {
    text-decoration: none;
    color: inherit;
  }
}
.help {
  margin-right: 1em;
  cursor: pointer;
  svg {
    fill: var(--icon-unselected-color);
  }
}
.modal {
  & ::v-deep .modal-container {
    background-color: var(--background-color);
    color: var(--font-primary-color);
  }
}
.modal-header {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  margin-bottom: 0.75em;
  .title {
    margin: 0;
    margin-right: auto;
  }
  svg {
    height: 1.5em;
    width: auto;
    fill: var(--icon-default-color);
    cursor: pointer;
  }
}

.modal-content {
  max-height: 50vh;
  overflow: auto;
  padding-right: 1em;
  font-size: 1rem;
  line-height: 1.5;
  & ::v-deep {
    h1 {
      font-size: 1.25em;
    }
    h2 {
      font-size: 1.2em;
    }
    h3 {
      font-size: 1.1em;
    }
    ul {
      margin: 0;
      list-style-type: disc;
      list-style-position: inside;
      padding: 0;
    }
    hr {
      border: 1px solid var(--foreground-color);
      margin: 1em 0;
    }
  }
}
</style>
