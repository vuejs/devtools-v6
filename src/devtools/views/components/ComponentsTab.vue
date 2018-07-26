<template>
  <div>
    <split-pane>
      <component-tree
        slot="left"
        :instances="instances"
      />
      <component-inspector
        slot="right"
        :target="inspectedInstance"
      />
    </split-pane>
  </div>
</template>

<script>
import SplitPane from 'components/SplitPane.vue'
import ComponentTree from './ComponentTree.vue'
import ComponentInspector from './ComponentInspector.vue'

import { mapState } from 'vuex'

const superDef = {
  data () {
    return {
      foo: 'bar'
    }
  }
}

export default {
  components: {
    ComponentTree,
    ComponentInspector,
    SplitPane
  },

  extends: superDef,

  computed: mapState('components', {
    instances: state => state.instances,
    inspectedInstance: state => state.inspectedInstance
  }),

  methods: {
    filter (e) {
      bridge.send('filter-instances', e.target.value)
    }
  }
}
</script>
