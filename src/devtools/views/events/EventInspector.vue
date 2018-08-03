<template>
  <scroll-pane>
    <div
      v-if="activeEvent"
      slot="scroll"
    >
      <state-inspector :state="{ 'event info': sortedEventData }" />
    </div>
    <div
      v-else
      slot="scroll"
      class="no-event-data"
    >
      No event selected
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import StateInspector from 'components/StateInspector.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    StateInspector
  },

  computed: {
    ...mapGetters('events', [
      'activeEvent'
    ]),

    sortedEventData () {
      if (!this.activeEvent) {
        return {}
      }
      return {
        name: this.activeEvent.eventName,
        type: this.activeEvent.type,
        source: '<' + this.activeEvent.instanceName + '>',
        payload: this.activeEvent.payload
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
section:not(:last-child)
  border-bottom 1px solid $border-color
  .vue-ui-dark-mode &
    border-bottom 1px solid $dark-border-color

.component-name
  margin 0 10px

.string
  color: $red

.literal
  color: #03c

.no-event-data
  color: #ccc;
  text-align: center;
  margin-top: 50px;
  line-height: 30px;
</style>
