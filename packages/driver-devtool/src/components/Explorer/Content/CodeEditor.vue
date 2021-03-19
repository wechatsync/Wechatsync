<template>
  <codemirror
    :key="active.id"
    :value="active.content || ''"
    :options="options"
    @input="onCmCodeChange"
  >
  </codemirror>
</template>

<script>
import CodeMirror from 'codemirror'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
// language
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/xml/xml.js'
// theme css
import './theme/codemirror-light.scss'
import './theme/codemirror-dark.scss'
// require active-line.js
import 'codemirror/addon/selection/active-line.js'
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js'
import 'codemirror/addon/search/searchcursor.js'
// hint
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/javascript-hint.js'
import 'codemirror/addon/selection/active-line.js'
// highlightSelectionMatches
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/match-highlighter.js'
// keyMap
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
import 'codemirror/keymap/sublime.js'
// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/xml-fold.js'

import { getEditorMode } from '@/utils/file'

export default {
  components: {
    codemirror,
  },
  props: {
    active: Object,
  },
  computed: {
    options() {
      const isMac = CodeMirror.keyMap.default == CodeMirror.keyMap.macDefault
      const save = this.onSave.bind(this)
      return {
        tabSize: 2,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        mode: getEditorMode(this.active.name),
        // hint.js options
        hintOptions: {
          // 当匹配只有一项的时候是否自动补全
          completeSingle: false,
        },
        //快捷键 可提供三种模式 sublime、emacs、vim
        keyMap: 'sublime',
        matchBrackets: false,
        showCursorWhenSelecting: true,
        theme: 'light',
        extraKeys: isMac
          ? {
              'Cmd-S': save,
            }
          : {
              'Ctrl-S': save,
            },
      }
    },
  },

  methods: {
    onCmCodeChange(newCode) {
      this.$emit('on-change', {
        id: this.active.id,
        content: newCode,
        dirty: true,
      })
    },
    onSave() {
      this.$emit('on-change', {
        id: this.active.id,
        dirty: false,
      })
    },
  },
}
</script>

<style lang="scss">
.vue-codemirror {
  &,
  & > * {
    height: 100%;
  }
}
</style>

