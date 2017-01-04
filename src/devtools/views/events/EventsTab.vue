<template>
  <div>
    <split-pane>
      <events-history slot="left"></events-history>
      <event-inspector slot="right"></event-inspector>
    </split-pane>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import EventsHistory from './EventsHistory.vue'
import EventInspector from './EventInspector.vue'

import { mapState } from 'vuex'

export default {
  computed: mapState('events', [
    'enabled'
  ]),
  components: {
    SplitPane,
    EventsHistory,
    EventInspector
  }
}
</script>
