<template>
  <label class="toggle" tabindex="0">
    <input
      type="checkbox"
      v-model="toggle"
      :true-value="trueValue"
      :false-value="falseValue"
      @change="$emit('change', toggle)"
    />
    <div class="toggle-track">
      <div class="toggle-track-checked">
        <slot name="checked" />
      </div>
      <div class="toggle-track-unchecked">
        <slot name="unchecked" />
      </div>
    </div>
    <div class="toggle-thumb"></div>
  </label>
</template>

<script>
export default {
  inheritAttrs: false,
  props: ['value', 'trueValue', 'falseValue'],
  data() {
    return {
      toggle: this.value,
    }
  },
  watch: {
    value(v) {
      if (v !== this.toggle) {
        this.toggle = v
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.toggle {
  position: relative;
  input {
    display: none;
  }
  input:checked ~ .toggle-thumb {
    transform: translateX(0.1em);
  }
  &:focus {
    outline: none;
    .toggle-thumb {
      box-shadow: 0 0 2px 3px #c0c0c0;
    }
  }
}
.toggle-track {
  width: 5em;
  height: 2.5em;
  border-radius: 2.5em;
  background-color: #000;
  position: relative;
}

[class*='toggle-track-'] {
  position: absolute;
  width: 2.3em;
  height: 2.3em;
  top: 0.1em;
}

.toggle-track-checked {
  left: 0.2em;
}
.toggle-track-unchecked {
  right: 0.2em;
}
.toggle-thumb {
  position: absolute;
  top: 0.1em;
  left: 0.1em;
  width: 2.3em;
  height: 2.3em;
  border-radius: 50%;
  background-color: #fff;
  transform: translateX(2.4em);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms;
}
</style>
