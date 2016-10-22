<template>
  <div>
    <template v-if="hasEvents">
      <split-pane class="pane">
        <events-history slot="left"></events-history>
        <event-inspector slot="right"></event-inspector>
      </split-pane>
    </template>
    <p v-else class="message">
      No events detected.
    </p>
  </div>
</template>

<script>
import SplitPane from './SplitPane.vue'
import EventsHistory from './EventsHistory.vue'
import EventInspector from './EventInspector.vue'
import { mapGetters } from 'vuex'

export default {
  computed: mapGetters([
    'hasEvents'
  ]),
  components: {
    SplitPane,
    EventsHistory,
    EventInspector
  }
}
</script>

<style lang="stylus" scoped>
.pane
  height 100%

.message
  text-align center
  color #ccc
  font-size 14px
  line-height 1.5em
  margin-top 50px
</style>
