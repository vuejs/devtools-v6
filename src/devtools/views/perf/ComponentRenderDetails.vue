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
          v-for="entry of entries"
          :key="entry.id"
          class="metric selectable-item"
        >
          <div
            class="type"
            :class="{
              dim: entry.count === 0
            }"
          >
            {{ entry.id }}
          </div>

          <div
            class="count"
            :class="{
              dim: entry.count === 0
            }"
          >
            {{ entry.count }}
          </div>

          <div
            class="total-time"
            :class="{
              dim: entry.totalTime === 0
            }"
          >
            {{ Math.round(entry.totalTime) }} ms
          </div>

          <div
            class="average-time"
            :class="{
              dim: entry.totalTime === 0
            }"
          >
            {{ Math.round(entry.totalTime / Math.max(entry.count, 1)) }} ms
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

.header,
.metric
  display flex
  /deep/ > *
    flex 25% 0 0
    padding 4px 10px
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
