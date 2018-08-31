<template>
  <div>
    <split-pane v-if="hasRouter">
      <routes-tree slot="left"></routes-tree>
      <routes-meta slot="right"></routes-meta>
    </split-pane>
    <div v-else class="notice">
      <div>
        No routes detected.
      </div>
    </div>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import RoutesTree from './RoutesTree.vue'
import RoutesMeta from './RoutesMeta.vue'
import { mapState } from 'vuex'

export default {
  computed: mapState('routes', {
    hasRouter: state => state.hasRouter
  }),
  components: {
    SplitPane,
    RoutesMeta,
    RoutesTree
  }
}
</script>
