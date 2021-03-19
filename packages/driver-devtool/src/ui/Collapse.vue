<template>
  <div :class="['collapse', isActive ? 'active' : '']">
    <div class="header" @click="isActive = !isActive">
      <v-icon name="chevron-down" class="icon" />&nbsp;
      <span class="title">{{ title }}</span>
      <div class="right-content">
        <slot name="header" />
      </div>
    </div>
    <transition name="collapse">
      <div class="content">
        <slot name="default" />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    defaultActive: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  data() {
    return {
      isActive: this.defaultActive,
    }
  },
  watch: {
    isActive() {
      this.$emit('collapse-toggle', this.isActive)
    },
  },
}
</script>

<style lang="scss" scoped>
$transition: transform 0.2s ease-in-out;
.collapse {
  display: flex;
  flex-direction: column;
  height: 100%;
  .header {
    padding: 0.2em var(--h-padding-width);
    background-color: var(--background-color);
    display: flex;
    align-items: center;
    box-shadow: var(--shadow-color) 0px 1px 2px;
    margin-bottom: 2px;
    cursor: pointer;
    .icon {
      fill: var(--icon-default-color);
      height: 0.8em;
      width: auto;
      transform-origin: center;
      transform: rotate(-90deg);
      transition: $transition;
    }
    .title {
      font-size: 0.8rem;
      font-weight: bold;
    }
    .right-content {
      margin-left: auto;
      display: none;
    }
    &:hover {
      .right-content {
        display: block;
      }
    }
  }
  .content {
    height: 0;
    overflow: hidden;
    background-color: var(--foreground-color);
  }
}

.collapse.active {
  .header {
    .icon {
      transform: rotate(0deg);
    }
  }
  .content {
    flex: 1;
    height: auto;
    overflow: auto;
  }
}
</style>
