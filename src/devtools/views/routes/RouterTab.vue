<template>
  <div>
    <triple-pane v-if="hasRouter">
      <routes-tree slot="left" />
      <routes-history slot="middle" />
      <routes-meta slot="right" />
    </triple-pane>
    <div
      v-else
      class="notice"
    >
      <div>
        No routes detected.
      </div>
    </div>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import TriplePane from 'components/TriplePane.vue'
import RoutesHistory from './RoutesHistory.vue'
import RoutesTree from './RoutesTree.vue'
import RoutesMeta from './RoutesMeta.vue'
import { mapState } from 'vuex'

export default {
  components: {
    SplitPane,
    TriplePane,
    RoutesHistory,
    RoutesMeta,
    RoutesTree
  },
  computed: mapState('routes', {
    hasRouter: state => state.hasRouter
  })
}
</script>
