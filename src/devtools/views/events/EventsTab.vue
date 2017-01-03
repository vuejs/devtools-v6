<template>
  <div>
    <template v-if="hasEvents">
      <split-pane v-if="hasEvents">
        <events-history slot="left"></events-history>
        <event-inspector slot="right"></event-inspector>
      </split-pane>
    </template>
    <div v-else class="notice">
      <div>No events detected.</div>
    </div>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import EventsHistory from './EventsHistory.vue'
import EventInspector from './EventInspector.vue'

import { mapGetters } from 'vuex'

export default {
  computed: mapGetters('events', [
    'hasEvents'
  ]),
  components: {
    SplitPane,
    EventsHistory,
    EventInspector
  }
}
</script>
