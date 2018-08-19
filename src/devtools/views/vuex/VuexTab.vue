<template>
  <div>
    <split-pane v-if="hasVuex">
      <vuex-history slot="left" />
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
import SplitPane from 'components/SplitPane.vue'
import VuexHistory from './VuexHistory.vue'
import VuexStateInspector from './VuexStateInspector.vue'
import { mapState } from 'vuex'

export default {
  components: {
    SplitPane,
    VuexHistory,
    VuexStateInspector
  },

  computed: mapState('vuex', {
    hasVuex: state => state.hasVuex
  })
}
</script>
