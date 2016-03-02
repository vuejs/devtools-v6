<template>
  <div id="components-tab">
    components
<!--     <split-pane class="container">
      <tree slot="left" :instances="instances"></tree>
      <inspector slot="right" :target="inspectedInstance"></inspector>
    </split-pane> -->
  </div>
</template>

<script>
import Tree from './Tree.vue'
import Inspector from './Inspector.vue'
import SplitPane from './SplitPane.vue'

export default {
  components: {
    Tree,
    Inspector,
    SplitPane
  }
}
</script>
