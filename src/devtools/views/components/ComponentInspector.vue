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
    </action-header>
    <section v-show="!hasTarget" slot="scroll" class="notice">
      <div>Select a component instance to inspect.</div>
    </section>
    <section v-show="hasTarget" slot="scroll" class="data">
      <div class="notice" v-if="target.state && !target.state.length">
        <div>This instance has no reactive state.</div>
      </div>
      <div v-else class="data-wrapper">
        <div class="data-el">
          <div class="data-type">data</div>
          <div class="data-fields">
            <div v-if="groupedState.undefined">
              <data-field v-for="field in groupedState.undefined" :key="field.key" :field="field" :depth="0"></data-field>
            </div>
            <span v-else class="no-fields">No data</span>
          </div>
        </div>
        <div class="data-el">
          <div class="data-type">computed</div>
          <div class="data-fields">
            <div v-if="groupedState.computed">
              <data-field v-for="field in groupedState.computed" :key="field.key" :field="field" :depth="0"></data-field>
            </div>
            <span v-else class="no-fields">No computed data</span>
          </div>
        </div>
        <div class="data-el">
          <div class="data-type">props</div>
          <div class="data-fields">
            <div v-if="groupedState.prop">
              <data-field v-for="field in groupedState.prop" :key="field.key" :field="field" :depth="0"></data-field>
            </div>
            <span v-else class="no-fields">No props</span>
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
  computed: {
    hasTarget () {
      return this.target.id != null
    },
    groupedState () {
      return groupBy(this.sortedState, 'type')
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

.component-name
  margin 0 10px

.data
  padding: 20px 0px
  
.data-wrapper
  display: flex;
  flex-wrap: wrap;

.data-el
  padding: 0px 10px
  flex: 1 0 33.33%;

  .data-type 
    color: #3ba776
    padding-left: 20px

  .no-fields
    font-size: 14px
    color: #ddd
</style>
