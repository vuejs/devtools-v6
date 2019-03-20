<template>
  <div class="framerate-marker-inspector">
    <div
      v-if="!marker"
      class="vue-ui-empty"
    >
      No marker selected
    </div>
    <SplitPane v-else>
      <div
        slot="left"
        class="entries"
      >
        <div
          v-for="bubble of marker.bubbles"
          :key="bubble.type"
          class="group"
          :class="{
            'high-density': finalHighDensity
          }"
        >
          <div class="group-title">
            {{ bubble.type }}
          </div>
          <div
            v-for="(entry, index) of bubble.entries"
            :key="index"
            class="entry list-item"
            :class="{
              selected: selectedEntry === entry
            }"
            @click="selectedEntry = entry"
          >
            <div class="label">
              {{ entry.label }}
            </div>
            <div class="time">
              {{ entry.timestamp | formatTime }}
            </div>
          </div>
        </div>
      </div>

      <StateInspector
        v-if="selectedEntry"
        slot="right"
        :state="selectedEntry.state"
        class="state-inspector"
      />
    </SplitPane>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import StateInspector from 'components/StateInspector.vue'

export default {
  components: {
    SplitPane,
    StateInspector
  },

  props: {
    marker: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      selectedEntry: null
    }
  },

  computed: {
    totalEntriesCount () {
      let result = 0
      for (const bubble of this.marker.bubbles) {
        result += bubble.entries.length
      }
      return result
    },

    finalHighDensity () {
      const pref = this.$shared.displayDensity
      return (pref === 'auto' && this.totalEntriesCount > 8) || pref === 'high'
    }
  },

  watch: {
    marker () {
      this.selectedEntry = null
    }
  }
}
</script>

<style lang="stylus" scoped>
.framerate-marker-inspector
  height 100%
  overflow hidden

.entries,
.state-inspector
  height 100%
  overflow-y auto

.group-title,
.entry
  padding 7px 12px 6px
  .high-density &
    padding 3px 12px 2px

.group
  &:not(:first-child)
    margin-top 12px

.group-title
  color $blueishGrey
  font-size 15px

.entry
  font-size 12px
  font-family Menlo, Consolas, monospace
  display flex
  .label
    flex auto 1 1
  .time
    color $md-grey-500
  &.selected
    .time
      color $white
</style>
