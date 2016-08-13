<template>
  <div>
    <split-pane v-if="hasVuex" class="pane">
      <vuex-history slot="left"></vuex-history>
      <vuex-state-inspector slot="right"></vuex-state-inspector>
    </split-pane>
    <p v-else class="message">
      No Vuex store detected.
      <br>
      Make sure you are using Vuex 0.5.0 or above.
    </p>
  </div>
</template>

<script>
import SplitPane from './SplitPane.vue'
import VuexHistory from './VuexHistory.vue'
import VuexStateInspector from './VuexStateInspector.vue'
import { mapState } from 'vuex'

export default {
  computed: mapState({
    hasVuex: state => state.vuex.hasVuex
  }),
  components: {
    SplitPane,
    VuexHistory,
    VuexStateInspector
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
