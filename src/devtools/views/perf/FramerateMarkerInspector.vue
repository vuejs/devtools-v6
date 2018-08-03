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
        >
          <div class="group-title">
            {{ bubble.type }}
          </div>
          <div
            v-for="(entry, index) of bubble.entries"
            :key="index"
            class="entry selectable-item"
            :class="{
              selected: selectedEntry === entry
            }"
            @click="selectedEntry = entry"
          >
            {{ entry.label }}
          </div>
        </div>
      </div>

      <StateInspector
        v-if="selectedEntry"
        slot="right"
        :state="selectedEntry.state"
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

  watch: {
    marker () {
      this.selectedEntry = null
    }
  }
}
</script>

<style lang="stylus" scoped>
.group-title,
.entry
  padding 7px 12px 6px

.group
  &:not(:first-child)
    margin-top 12px

.group-title
  color $blueishGrey
  font-size 15px

.entry
  font-size 12px
  color $pink
  font-family Menlo, Consolas, monospace
  &.selected
    color $white
</style>
