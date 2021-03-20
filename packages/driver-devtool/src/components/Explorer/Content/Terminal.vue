<template>
  <div class="termial">
    <div class="headerbar">
      <tabs
        class="tabbar"
        :items="[
          {
            id: 'console',
            name: 'Console',
            active: true,
          },
        ]"
      >
      </tabs>
      <ul class="action-group">
        <li title="收起面板 ⌘ O" @click="$emit('toggle-terminal')">
          <v-icon name="chevron-down"></v-icon>
        </li>
        <li
          @click="inspectVisible = !inspectVisible"
          :title="`${inspectVisible ? '隐藏' : '显示'} inspect 信息`"
        >
          <v-icon :name="inspectVisible ? `eye-slash` : `eye`"></v-icon>
        </li>
        <li @click="clearLogs" title="清空">
          <v-icon name="ban"></v-icon>
        </li>
      </ul>
    </div>

    <div class="logs">
      <codemirror :value="formattedLog" :options="options"> </codemirror>
    </div>
  </div>
</template>

<script>
import log from '@/utils/log'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/foldgutter.css'

export default {
  props: {
    theme: String,
  },
  data() {
    return {
      logs: log.getLogs(),
      inspectVisible: true,
    }
  },
  computed: {
    formattedLog() {
      return (this.inspectVisible
        ? this.logs
        : this.logs.filter(({ level }) => level !== 'inspect')
      )
        .map(({ level, title, content }) => {
          return [
            `${level}: ${title}`,
            typeof content === 'string'
              ? content
              : JSON.stringify(content, null, '\t'),
          ].join('\r')
        })
        .join('\n')
    },
    options() {
      return {
        mode: {
          name: 'javascript',
          json: true,
        },
        theme: this.theme,
        readOnly: true,
        foldGutter: true,
        gutters: ['CodeMirror-foldgutter'],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        lineWrapping: true,
        tabSize: 2,
      }
    },
  },
  methods: {
    clearLogs() {
      log.clearLogs()
    },
  },
}
</script>

<style lang="scss" scoped>
.termial {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.headerbar {
  display: flex;
}
.tabbar {
  background-color: var(--foreground-color);
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.action-group {
  list-style: none;
  margin: 0 0.5em;
  padding: 0;
  flex: none;
  display: flex;
  align-items: center;
  > li {
    margin: 0 0.5em;
    display: inline-block;
    cursor: pointer;
  }
}
.logs {
  flex: 1;
  overflow: hidden;
}
</style>
