<template>
  <div>
    <split-pane v-if="hasVuex">
      <vuex-history slot="left"></vuex-history>
      <vuex-state-inspector slot="right"></vuex-state-inspector>
    </split-pane>
    <div v-else class="notice">
      <div>
        No Vuex store detected.<br>
        Make sure you are using Vuex 0.5.0 or above.
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
.message
  text-align center
  color #ccc
  font-size 14px
  line-height 1.5em
  margin-top 50px
</style>
