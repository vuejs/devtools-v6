<template>
  <ScrollPane class="component-render-details">
    <div
      v-if="!entry"
      class="vue-ui-empty"
    >
      No component selected
    </div>

    <template v-else>
      <ActionHeader slot="header">
        <span class="title">
          <span class="title-bracket">&lt;</span>
          <span>{{ componentName }}</span>
          <span class="title-bracket">&gt;</span>
        </span>
      </ActionHeader>

      <div
        slot="scroll"
        class="metrics"
        :class="{
          'high-density': highDensity
        }"
      >
        <div class="header">
          <div
            v-for="column of columns"
            :key="column"
            class="column"
          >
            {{ column }}
          </div>
        </div>
        <div
          v-for="e of entries"
          :key="e.id"
          class="metric selectable-item"
        >
          <div
            class="type"
            :class="{
              dim: e.count === 0
            }"
          >
            {{ e.id }}
          </div>

          <div
            class="count"
            :class="{
              dim: e.count === 0
            }"
          >
            {{ e.count }}
          </div>

          <div
            class="total-time"
            :class="{
              dim: e.totalTime === 0
            }"
          >
            {{ Math.round(e.totalTime) }} ms
          </div>

          <div
            class="average-time"
            :class="{
              dim: e.totalTime === 0
            }"
          >
            {{ Math.round(e.totalTime / Math.max(e.count, 1)) }} ms
          </div>
        </div>
      </div>
    </template>
  </ScrollPane>
</template>

<script>
import { classify } from 'src/util'

import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

const ENTRIES = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mountRender',
  'mounted',
  'beforeUpdate',
  'updateRender',
  'updated',
  'beforeDestroyed',
  'destroyed'
]

const COLUMNS = [
  'type',
  'count',
  'total time',
  'average time'
]

export default {
  components: {
    ScrollPane,
    ActionHeader
  },

  props: {
    entry: {
      type: Object,
      default: null
    }
  },

  computed: {
    entries () {
      return ENTRIES.map(type => ({
        id: type,
        ...this.entry.hooks[type] || { totalTime: 0, count: 0 }
      }))
    },

    componentName () {
      return (this.$shared.classifyComponents ? classify(this.entry.id) : this.entry.id) || 'Anonymous Component'
    },

    highDensity () {
      const pref = this.$shared.displayDensity
      return (pref === 'auto' && this.entries.length > 8) || pref === 'high'
    }
  },

  created () {
    this.columns = COLUMNS
  }
}
</script>

<style lang="stylus" scoped>
.title
  white-space nowrap
  position relative
  top -1px

.metrics
  padding 6px 0
  font-size 14px
  &.high-density
    font-size 12px

.header,
.metric
  display flex
  /deep/ > *
    flex 25% 0 0
    padding 4px 10px
    .high-density &
      padding 2px 10px
    &:not(:first-child)
      text-align right

  .dim
    opacity .4

.header
  color $blueishGrey
  margin-bottom 6px

.metric
  font-family Menlo, Consolas, monospace

.type
  color $green
</style>
