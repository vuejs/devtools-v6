<template>
  <scroll-pane>
    <actions v-show="hasTarget" slot="header">
      <span class="component-name">
        <span style="color:#ccc">&lt;</span><span>{{ target.name }}</span><span style="color:#ccc">&gt;</span>
      </span>
      <a class="button inspect" @click="inspectDOM" title="Inspect DOM">
        <i class="material-icons">visibility</i>
        <span>Inspect DOM</span>
      </a>
    </actions>
    <section v-show="!hasTarget" slot="scroll" class="notice">
      <div>Select a component instance to inspect.</div>
    </section>
    <section v-show="hasTarget" slot="scroll">
      <div class="data-fields">
        <data-field v-for="field in sortedState"
          :key="field.key"
          :field="field"
          :depth="0">
        </data-field>
      </div>
      <div class="notice" v-show="target.state && !target.state.length">
        <div>This instance has no reactive state.</div>
      </div>
    </section>
  </scroll-pane>
</template>

<script>
import DataField from './DataField.vue'
import ScrollPane from './ScrollPane.vue'
import Actions from './Actions.vue'

const isChrome = typeof chrome !== 'undefined' && chrome.devtools

export default {
  components: {
    DataField,
    ScrollPane,
    Actions
  },
  props: {
    target: Object
  },
  computed: {
    hasTarget () {
      return this.target.id != null
    },
    sortedState () {
      return this.target.state && this.target.state.slice().sort((a, b) => {
        if (a.key < b.key) return -1
        if (a.key > b.key) return 1
        return 0
      })
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
</script>

<style lang="stylus" scoped>
.no-state
  color #ccc
  text-align center
  font-size 14px

.non-selected
  color #ccc
  text-align center
</style>
