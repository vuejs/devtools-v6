<template>
  <div>
    <triple-pane v-if="hasRouter">
      <routes-tree slot="left"></routes-tree>
      <routes-history slot="middle"></routes-history>
      <route-meta slot="right"></route-meta>
    </triple-pane>
    <div v-else class="notice">
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
import RouteMeta from './RouteMeta.vue'
import { mapState } from 'vuex'

export default {
  computed: mapState('routes', {
    hasRouter: state => state.hasRouter
  }),
  components: {
    SplitPane,
    TriplePane,
    RoutesHistory,
    RouteMeta,
    RoutesTree
  }
}
</script>
