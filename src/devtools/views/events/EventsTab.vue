<template>
  <div>
    <split-pane>
      <events-history slot="left" />
      <event-inspector slot="right" />
    </split-pane>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import EventsHistory from './EventsHistory.vue'
import EventInspector from './EventInspector.vue'

import { mapState } from 'vuex'

export default {
  components: {
    SplitPane,
    EventsHistory,
    EventInspector
  },

  computed: mapState('events', [
    'enabled'
  ])
}
</script>
