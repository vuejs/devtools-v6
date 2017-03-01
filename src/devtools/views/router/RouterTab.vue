<template>
  <div>
    <split-pane v-if="hasRouter">
      <routes-history slot="left"></routes-history>
      <route-meta slot="right"></route-meta>
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
import RoutesHistory from './RoutesHistory.vue'
import RouteMeta from './RouteMeta.vue'
import { mapState } from 'vuex'

export default {
  computed: mapState('router', {
    hasRouter: state => state.hasRouter
  }),
  components: {
    SplitPane,
    RoutesHistory,
    RouteMeta
  }
}
</script>
