<template>
  <scroll-pane>
    <action-header v-show="hasTarget" slot="header">
      <span class="title" @click="onTitleClick">
        <span style="color:#ccc">&lt;</span>
        <span v-tooltip="titleTooltip">{{ targetName }}</span>
        <span style="color:#ccc">&gt;</span>
      </span>
      <a class="button inspect" @click="inspectDOM" v-tooltip="'Inspect DOM'">
        <i class="material-icons">find_in_page</i>
        <span>Inspect DOM</span>
      </a>
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter inspected data" v-model.trim="filter">
      </div>
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

const isChrome = typeof chrome !== 'undefined' && chrome.devtools

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
    titleTooltip () {
      return this.target.file && `Open <i class="material-icons">insert_drive_file</i> <span class="mono">${this.target.file}</span>`
    }
  },
  methods: {
    inspectDOM () {
      if (!this.hasTarget) return
      if (isChrome) {
        chrome.devtools.inspectedWindow.eval(
          `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get("${this.target.id}").$el)`
        )
      } else {
        window.alert('DOM inspection is not supported in this shell.')
      }
    },
    onTitleClick () {
      const file = this.target.file
      if (file) {
        const src = `fetch('/__open-in-editor?file=${file}').then(() => {
          console.log('File ${file} opened in editor')
        }).catch(e => {
          console.warn(e)
        })`
        if (chrome && chrome.devtools) {
          chrome.devtools.inspectedWindow.eval(src)
        } else {
          // eslint-disable-next-line no-eval
          eval(src)
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  cursor pointer
  white-space nowrap
</style>

