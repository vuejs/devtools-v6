<template>
  <scroll-pane>
    <action-header v-show="hasTarget" slot="header">
      <span class="component-name">
        <span style="color:#ccc">&lt;</span>
        <span>{{ target.name }}</span>
        <span style="color:#ccc">&gt;</span>
      </span>
      <a class="button inspect" @click="inspectDOM" title="Inspect DOM">
        <i class="material-icons">visibility</i>
        <span>Inspect DOM</span>
      </a>
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter data" v-model.trim="filter">
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
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import StateInspector from 'components/StateInspector.vue'
import { searchDeepInObject } from 'src/util'
import groupBy from 'lodash.groupBy'

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
    hasTarget () {
      return this.target.id != null
    },
    filteredState () {
      return groupBy(sort(this.target.state.filter(el => {
        return searchDeepInObject({
          [el.key]: el.value
        }, this.filter)
      })), 'type')
    }
  },
  methods: {
    inspectDOM () {
      if (!this.hasTarget) return
      if (isChrome) {
        chrome.devtools.inspectedWindow.eval(
          `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get(${this.target.id}).$el)`
        )
      } else {
        window.alert('DOM inspection is not supported in this shell.')
      }
    }
  }
}

function sort (state) {
  return state && state.slice().sort((a, b) => {
    if (a.key < b.key) return -1
    if (a.key > b.key) return 1
    return 0
  })
}
</script>

<style lang="stylus" scoped>
.no-state
  color #ccc
  text-align center
  font-size 14px

.non-selected
  color #ccc
  text-align center

.component-name
  margin 0 10px
</style>
