<template>
  <div>
    <split-pane>
      <events-history
        v-if="defer(3)"
        slot="left"
      />
      <event-inspector slot="right" />
    </split-pane>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Defer from 'mixins/defer'

import SplitPane from 'components/SplitPane.vue'
import EventsHistory from './EventsHistory.vue'
import EventInspector from './EventInspector.vue'

export default {
  components: {
    SplitPane,
    EventsHistory,
    EventInspector
  },

  mixins: [
    Defer()
  ],

  computed: mapState('events', [
    'enabled'
  ])
}
</script>
