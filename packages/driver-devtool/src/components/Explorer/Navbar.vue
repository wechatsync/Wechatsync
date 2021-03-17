<template>
  <div class="navbar">
    <a href="/" class="logo">
      <v-icon name="logo" />&nbsp;<span>开发者工具</span>
    </a>
    <ul class="links">
      <li v-for="link of links" :key="link.name" class="link-item">
        <a :href="link.url">{{ link.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  padding: 0.8em 2em;
  align-items: center;
  border-bottom: 1px solid var(--line-color);
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
.links {
  flex: 1;
  text-align: right;
  margin: 0;
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
