<script>
// Fork of https://github.com/egoist/vue-monaco/
import * as monaco from 'monaco-editor'
import assign from 'lodash/merge'

// eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
monaco.editor.defineTheme('github-light', require('@front/assets/github-theme/light.json'))
// eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
monaco.editor.defineTheme('github-dark', require('@front/assets/github-theme/dark.json'))

export default {
  name: 'MonacoEditor',

  props: {
    original: {
      type: String,
      default: null,
    },
    modelValue: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      default: 'vs',
    },
    language: {
      type: String,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
    diffEditor: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'editorWillMount', 'editorDidMount'],

  watch: {
    options: {
      deep: true,
      handler(options) {
        if (this.editor) {
          const editor = this.getModifiedEditor()
          editor.updateOptions(options)
        }
      },
    },

    modelValue(newValue) {
      if (this.editor) {
        const editor = this.getModifiedEditor()
        if (newValue !== editor.getValue()) {
          editor.setValue(newValue)
        }
      }
    },

    original(newValue) {
      if (this.editor && this.diffEditor) {
        const editor = this.getOriginalEditor()
        if (newValue !== editor.getValue()) {
          editor.setValue(newValue)
        }
      }
    },

    language(newVal) {
      if (this.editor) {
        const editor = this.getModifiedEditor()
        this.monaco.editor.setModelLanguage(editor.getModel(), newVal)
      }
    },

    theme(newVal) {
      if (this.editor) {
        this.monaco.editor.setTheme(newVal)
      }
    },
  },

  mounted() {
    this.monaco = monaco
    this.$nextTick(() => {
      this.initMonaco(monaco)
    })
  },

  beforeUnmount() {
    this.editor && this.editor.dispose()
  },

  methods: {
    initMonaco(monaco) {
      this.$emit('editorWillMount', this.monaco)

      const options = assign(
        {
          value: this.modelValue,
          theme: this.theme,
          language: this.language,
        },
        this.options,
      )
      const root = this.$refs.root

      if (this.diffEditor) {
        this.editor = monaco.editor.createDiffEditor(root, options)
        const originalModel = monaco.editor.createModel(
          this.original,
          this.language,
        )
        const modifiedModel = monaco.editor.createModel(
          this.modelValue,
          this.language,
        )
        this.editor.setModel({
          original: originalModel,
          modified: modifiedModel,
        })
      }
      else {
        this.editor = monaco.editor.create(root, options)
      }

      // @event `change`
      const editor = this.getModifiedEditor()
      editor.onDidChangeModelContent((event) => {
        const value = editor.getValue()
        if (this.modelValue !== value) {
          this.$emit('update:modelValue', value, event)
        }
      })

      this.$emit('editorDidMount', this.editor)
    },

    /** @deprecated */
    getMonaco() {
      return this.editor
    },

    getEditor() {
      return this.editor
    },

    getModifiedEditor() {
      return this.diffEditor ? this.editor.getModifiedEditor() : this.editor
    },

    getOriginalEditor() {
      return this.diffEditor ? this.editor.getOriginalEditor() : this.editor
    },

    focus() {
      this.editor.focus()
    },
  },
}
</script>

<template>
  <div ref="root" />
</template>
