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
    <section v-show="!hasTarget" slot="scroll" class="notice">
      <div>Select a component instance to inspect.</div>
    </section>
    <section v-show="hasTarget" slot="scroll" class="data">
      <div class="notice" v-if="target.state && !target.state.length">
        <div>This instance has no reactive state.</div>
      </div>
      <div v-else class="data-wrapper">
        <div
          v-for="type in stateGroups"
          v-if="filteredState[type]"
          :class="['data-el', type]">
          <div class="data-type">{{ type === 'undefined' ? 'data' : type }}</div>
          <div class="data-fields">
            <data-field
              v-for="field in filteredState[type]"
              :key="field.key"
              :field="field"
              :depth="0">
            </data-field>
          </div>
        </div>
      </div>
    </section>
  </scroll-pane>
</template>

<script>
import DataField from 'components/DataField.vue'
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import { searchDeepInObject } from 'src/util'
import groupBy from 'lodash.groupBy'

const isChrome = typeof chrome !== 'undefined' && chrome.devtools

export default {
  components: {
    DataField,
    ScrollPane,
    ActionHeader
  },
  props: {
    target: Object
  },
  data () {
    return {
      filter: '',
      stateGroups: [
        'undefined', // data
        'props',
        'computed',
        'vuex',
        'firebase'
      ]
    }
  },
  computed: {
    hasTarget () {
      return this.target.id != null
    },
    filteredState () {
      return groupBy(this.sort(this.target.state.filter(el => searchDeepInObject({[el.key]: el.value}, this.filter))), 'type')
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
    },
    sort (state) {
      return state && state.slice().sort((a, b) => {
        if (a.key < b.key) return -1
        if (a.key > b.key) return 1
        return 0
      })
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

.component-name
  margin 0 10px

.data
  padding: 20px 0px

.data-wrapper
  display flex
  flex-wrap wrap

.data-el
  padding 0px 10px
  flex 1 0 33.33%
  font-size 14px

  .data-type
    color #486887
    padding-left 20px
    margin-bottom -10px
</style>
