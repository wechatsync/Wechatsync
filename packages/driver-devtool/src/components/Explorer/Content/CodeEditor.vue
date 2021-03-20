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
// language
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/xml/xml.js'
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
import {
  deployCode,
  runAccountTest,
  runArticleSyncTest,
  runImageSyncTest,
} from '@/utils/debug'

import { changeProperty, isAdapter } from '@/store/controller/section'
export default {
  props: {
    active: Object,
    theme: String,
  },
  computed: {
    options() {
      const { name } = this.active
      const isMac = CodeMirror.keyMap.default == CodeMirror.keyMap.macDefault
      const save = this.onSave.bind(this)

      const testAccount = function () {
        runAccountTest(name)
      }
      const testImage = function () {
        runImageSyncTest(name)
      }
      const testArticle = function () {
        runArticleSyncTest(name)
      }
      const openTerminal = () => {
        this.$emit('toggle-terminal')
      }
      return {
        tabSize: 2,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        mode: getEditorMode(name),
        // hint.js options
        hintOptions: {
          // 当匹配只有一项的时候是否自动补全
          completeSingle: false,
        },
        //快捷键 可提供三种模式 sublime、emacs、vim
        keyMap: 'sublime',
        matchBrackets: false,
        showCursorWhenSelecting: true,
        theme: this.theme,
        lineWrapping: true,
        extraKeys: isMac
          ? {
              'Cmd-S': save,
              'Cmd-1': testAccount,
              'Cmd-2': testImage,
              'Cmd-3': testArticle,
              'Cmd-O': openTerminal,
            }
          : {
              'Ctrl-S': save,
              'Ctrl-1': testAccount,
              'Ctrl-2': testImage,
              'Ctrl-3': testArticle,
              'Ctrl-O': openTerminal,
            },
      }
    },
  },
  methods: {
    onCmCodeChange(newCode) {
      changeProperty({
        id: this.active.id,
        content: newCode,
        dirty: true,
      })
    },
    onSave() {
      changeProperty({
        id: this.active.id,
        dirty: false,
      })
      if (isAdapter(this.active)) {
        deployCode(this.active)
      }
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

