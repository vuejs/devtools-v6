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

<style lang="stylus" scoped>
.message
  text-align center
  color #ccc
  font-size 14px
  line-height 1.5em
  margin-top 50px
</style>
