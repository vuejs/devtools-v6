<template>
  <scroll-pane>
    <action-header v-show="hasTarget" slot="header">
      <span class="title">
        <span class="title-bracket">&lt;</span>
        <span>{{ targetName }}</span>
        <span class="title-bracket">&gt;</span>
      </span>
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter inspected data" v-model.trim="filter">
      </div>
      <a
        v-if="$isChrome"
        class="button inspect"
        v-tooltip="'Inspect DOM'"
        @click="inspectDOM"
      >
        <i class="material-icons">code</i>
        <span>Inspect DOM</span>
      </a>
      <a
        v-if="target.file"
        class="button"
        v-tooltip="openEditorTooltip"
        @click="openInEditor"
      >
        <i class="material-icons">launch</i>
        <span>Open in editor</span>
      </a>
    </action-header>
    <template slot="scroll">
      <section v-if="!hasTarget" class="notice">
        <div>Select a component instance to inspect.</div>
      </section>
      <div v-else-if="!target.state || !target.state.length" class="notice">
        <div>This instance has no reactive state.</div>
      </div>
      <section v-else class="data">
        <state-inspector :state="filteredState" />
      </section>
    </template>
  </scroll-pane>
</template>

<script>
import { mapState } from 'vuex'
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import StateInspector from 'components/StateInspector.vue'
import { searchDeepInObject, sortByKey, classify } from 'src/util'
import groupBy from 'lodash.groupby'

export default {
  components: {
    ScrollPane,
    ActionHeader,
    StateInspector
  },
  props: {
    target: Object
  },
  data () {
    return {
      filter: ''
    }
  },
  computed: {
    ...mapState('components', [
      'classifyComponents'
    ]),
    hasTarget () {
      return this.target.id != null
    },
    targetName () {
      return this.classifyComponents ? classify(this.target.name) : this.target.name
    },
    filteredState () {
      return groupBy(sortByKey(this.target.state.filter(el => {
        return searchDeepInObject({
          [el.key]: el.value
        }, this.filter)
      })), 'type')
    },
    openEditorTooltip () {
      return this.target.file && `Open <span class="mono green"><i class="material-icons">insert_drive_file</i>${this.target.file}</span> in editor`
    }
  },
  methods: {
    inspectDOM () {
      if (!this.hasTarget) return
      if (this.$isChrome) {
        chrome.devtools.inspectedWindow.eval(
          `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get("${this.target.id}").$el)`
        )
      } else {
        window.alert('DOM inspection is not supported in this shell.')
      }
    },
    openInEditor () {
      const file = this.target.file
      // Console display
      const fileName = file.replace(/\\/g, '\\\\')
      const src = `fetch('/__open-in-editor?file=${encodeURI(file)}').then(response => {
        if (response.ok) {
          console.log('File ${fileName} opened in editor')
        } else {
          const msg = 'Opening component ${fileName} failed'
          if (__VUE_DEVTOOLS_TOAST__) {
            __VUE_DEVTOOLS_TOAST__(msg, 'error')
          } else {
            console.log('%c' + msg, 'color:red')
          }
          console.log('Check the setup of your project, see https://github.com/vuejs/vue-devtools/blob/master/docs/open-in-editor.md')
        }
      })`
      if (this.$isChrome) {
        chrome.devtools.inspectedWindow.eval(src)
      } else {
        // eslint-disable-next-line no-eval
        eval(src)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  white-space nowrap
</style>
