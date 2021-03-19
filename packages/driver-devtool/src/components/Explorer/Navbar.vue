<template>
  <div class="navbar">
    <a href="/" class="logo">
      <v-icon name="logo" />&nbsp;<span>开发者工具</span>
    </a>
    <div class="right-content">
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
  </div>
</template>

<script>
import {
  addThemeChangeListener,
  removeThemeChangeListener,
} from '@/utils/theme'
export default {
  data() {
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
</style>
