<template>
  <scroll-pane scroll-event="routes:init">
    <action-header slot="header">
      <div class="search">
        <VueIcon icon="search" />
        <input
          ref="filterRoutes"
          v-model.trim="filter"
          placeholder="Filter routes"
        >
      </div>
    </action-header>
    <div slot="scroll" class="tree">
      <routes-tree-item
        v-for="(route, index) in filteredRoutes"
        ref="instances"
        :key="route.path"
        :route="route"
        :routeId="index"
        :depth="0">
      </routes-tree-item>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import RoutesTreeItem from './RoutesTreeItem.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader,
    RoutesTreeItem
  },
  computed: {
    filter: {
      get () {
        return this.$store.state.routes.filter
      },
      set (filter) {
        this.$store.commit('routes/UPDATE_FILTER', filter)
      }
    },
    ...mapGetters('routes', [
      'filteredRoutes'
    ])
  }
}
</script>

<style lang="stylus" scoped>
.route-heading
  padding: 0px 10px
.tree
  padding 5px
</style>
