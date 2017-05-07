<template>
  <scroll-pane scroll-event="routes:init">
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter routes" v-model.trim="filter">
      </div>
    </action-header>
    <div slot="scroll" class="tree">
      <routes-tree-item
        v-for="(route, key) in filteredRoutes"
        ref="instances"
        :key="key"
        :route="route"
        :routeId="key"
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
@import "../../common"
.route-heading
  padding: 0px 10px
.tree
  padding 5px
</style>
