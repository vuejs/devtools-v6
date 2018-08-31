<template>
  <div>
    <split-pane v-if="hasRouter">
      <router-history slot="left"></router-history>
      <router-meta slot="right"></router-meta>
    </split-pane>
    <div v-else class="notice">
      <div>
        No router detected.
      </div>
    </div>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import RouterHistory from './RouterHistory.vue'
import RouterMeta from './RouterMeta.vue'
import { mapState } from 'vuex'

export default {
  computed: mapState('router', {
    hasRouter: state => state.hasRouter
  }),
  components: {
    SplitPane,
    RouterHistory,
    RouterMeta
  }
}
</script>
