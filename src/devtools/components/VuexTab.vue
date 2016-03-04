<template>
  <div>
    <split-pane class="pane">
      <vuex-history slot="left"></vuex-history>
      <vuex-state-inspector slot="right"></vuex-state-inspector>
    </split-pane>
  </div>
</template>

<script>
import SplitPane from './SplitPane.vue'
import VuexHistory from './VuexHistory.vue'
import VuexStateInspector from './VuexStateInspector.vue'

export default {
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
</style>
