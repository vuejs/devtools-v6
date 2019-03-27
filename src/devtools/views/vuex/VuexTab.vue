<template>
  <div>
    <split-pane v-if="hasVuex">
      <vuex-history
        v-if="defer(3)"
        slot="left"
      />
      <vuex-state-inspector slot="right" />
    </split-pane>
    <div
      v-else
      class="notice"
    >
      <div>
        No Vuex store detected.
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Defer from 'mixins/defer'

import SplitPane from 'components/SplitPane.vue'
import VuexHistory from './VuexHistory.vue'
import VuexStateInspector from './VuexStateInspector.vue'

export default {
  components: {
    SplitPane,
    VuexHistory,
    VuexStateInspector
  },

  mixins: [
    Defer()
  ],

  computed: mapState('vuex', {
    hasVuex: state => state.hasVuex
  })
}
</script>
