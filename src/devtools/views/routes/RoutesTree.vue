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
    <div
      slot="scroll"
      class="tree"
      :class="{
        'high-density': finalHighDensity
      }"
    >
      <routes-tree-item
        v-for="(route, index) in filteredRoutes"
        ref="instances"
        :key="route.path"
        :route="route"
        :route-id="index"
        :depth="0"
      />
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
    ...mapGetters('routes', [
      'filteredRoutes'
    ]),

    filter: {
      get () {
        return this.$store.state.routes.filter
      },
      set (filter) {
        this.$store.commit('routes/UPDATE_FILTER', filter)
      }
    },

    finalHighDensity () {
      if (this.$shared.displayDensity === 'auto') {
        // TODO auto density
        return true
      }
      return this.$shared.displayDensity === 'high'
    }
  }
}
</script>

<style lang="stylus" scoped>
.route-heading
  padding 0px 10px

.tree
  padding 5px
</style>
