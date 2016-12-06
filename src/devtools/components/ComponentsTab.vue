<template>
  <div>
    <split-pane>
      <component-tree slot="left" :instances="instances"></component-tree>
      <component-inspector slot="right" :target="inspectedInstance"></component-inspector>
    </split-pane>
  </div>
</template>

<script>
import ComponentTree from './ComponentTree.vue'
import ComponentInspector from './ComponentInspector.vue'
import SplitPane from './SplitPane.vue'

import { mapState } from 'vuex'

export default {
  components: {
    ComponentTree,
    ComponentInspector,
    SplitPane
  },
  computed: mapState({
    instances: state => state.components.instances,
    inspectedInstance: state => state.components.inspectedInstance
  }),
  methods: {
    filter (e) {
      bridge.send('filter-instances', e.target.value)
    }
  }
}
</script>
