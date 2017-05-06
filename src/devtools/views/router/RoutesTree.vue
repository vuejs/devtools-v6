<template>
  <scroll-pane scroll-event="route:init">
    <action-header slot="header">
      <h3 class="route-heading">All routes</h3>
    </action-header>
    <div slot="scroll" class="tree">
      <routes-tree-item
        v-for="route in routes"
        ref="instances"
        :key="route"
        :route="route"
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
    ...mapGetters('router', [
      'routes'
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
