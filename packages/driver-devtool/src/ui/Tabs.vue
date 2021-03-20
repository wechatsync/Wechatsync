<template>
  <perfect-scrollbar
    :options="{
      suppressScrollY: true,
      wheelPropagation: false,
    }"
  >
    <ul>
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ active: item.active }"
        @click="$emit('click', item.id)"
      >
        <slot name="front" v-bind:icon="item.icon"></slot>
        {{ item.name }}
        <slot name="post" v-bind:item="item"></slot>
      </li>
    </ul>
  </perfect-scrollbar>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: [],
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  height: 2em;
  li {
    padding: 0 1em;
    display: inline-block;
    height: 100%;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
}
</style>

