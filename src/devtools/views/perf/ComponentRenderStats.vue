<template>
  <SplitPane>
    <ScrollPane slot="left">
      <ActionHeader slot="header">
        <div
          class="search"
        >
          <VueIcon icon="search" />
          <input
            v-model.trim="filter"
            placeholder="Filter components"
          >
        </div>
      </ActionHeader>

      <RecycleScroller
        v-if="filteredItems"
        slot="scroll"
        :items="filteredItems"
        :item-size="highDensity ? 22 : 34"
        class="components"
        :class="{
          'high-density': highDensity
        }"
      >
        <template slot-scope="{ item: entry, index, active }">
          <div
            :data-active="active"
            :data-index="index"
            class="component selectable-item"
            :class="{
              selected: selectedEntry === entry
            }"
            @click="selectedEntry = entry"
          >
            <div class="name">
              &lt;{{ getComponentName(entry) }}&gt;
            </div>

            <div class="total-time">
              {{ Math.round(entry.totalTime) }} ms
            </div>

            <div class="bar-wrapper">
              <div
                :style="getTotalTimeBarStyle(entry)"
                class="bar"
              />
            </div>
          </div>
        </template>
      </RecycleScroller>
    </ScrollPane>

    <ComponentRenderDetails
      slot="right"
      :entry="selectedEntry"
    />
  </SplitPane>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { scaleLinear, extent } from 'd3'
import { classify } from 'src/util'

import SplitPane from 'components/SplitPane.vue'
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import ComponentRenderDetails from './ComponentRenderDetails.vue'

export default {
  components: {
    SplitPane,
    ScrollPane,
    ActionHeader,
    ComponentRenderDetails
  },

  data () {
    return {
      filter: '',
      selectedEntry: null
    }
  },

  computed: {
    ...mapState('perf', [
      'currentBenchmark'
    ]),

    ...mapGetters('perf', [
      'metrics'
    ]),

    highDensity () {
      const pref = this.$shared.displayDensity
      return (pref === 'auto' && this.metrics.componentRender.length > 8) || pref === 'high'
    },

    totalTimes () {
      return this.metrics.componentRender.map(metric => metric.totalTime)
    },

    totalTimesScale () {
      return scaleLinear()
        .domain(extent([0].concat(this.totalTimes)))
        .range([0, 100])
    },

    filteredItems () {
      let list = this.metrics.componentRender

      if (!list) return

      if (this.filter) {
        const reg = new RegExp(this.filter, 'i')
        list = list.filter(entry => reg.test(entry.id))
      }

      list.sort((a, b) => b.totalTime - a.totalTime)

      return list
    }
  },

  watch: {
    currentBenchmark () {
      this.selectedEntry = null
    }
  },

  methods: {
    getTotalTimeBarStyle (entry) {
      return {
        width: `${this.totalTimesScale(entry.totalTime)}%`
      }
    },

    getComponentName (entry) {
      return (this.$shared.classifyComponents ? classify(entry.id) : entry.id) || 'Anonymous Component'
    }
  }
}
</script>

<style lang="stylus" scoped>
.components
  height 100%

.component
  display flex
  align-items center
  padding 0 20px
  width 100%
  height 34px
  font-size 14px

  .high-density &
    height 22px

  .name
    flex 300px 0 0
    font-family Menlo, Consolas, monospace
    color $green

  .total-time
    flex 100px 0 0
    text-align right
    margin-right 6px

  .bar-wrapper
    flex 100% 1 1
    .bar
      height 6px
      background $green

  &.selected
    &,
    .name
      color $md-white

    .bar
      background $md-white
</style>
