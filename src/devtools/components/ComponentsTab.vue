<template>
  <div id="components-tab">
    <div class="search">
      <i class="search-icon material-icons">search</i>
      <input class="search-box" placeholder="Filter components" @input="filter">
    </div>
    <split-pane class="bottom">
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

<style lang="stylus" scoped>
.search
  padding 10px 20px
  height 50px
  box-sizing border-box
  border-bottom 1px solid #e3e3e3

.material-icons
  display inline-block
  vertical-align middle

.search-icon
  font-size 24px
  color #999

.search-box
  font-family Roboto
  box-sizing border-box
  color #666
  position relative
  z-index 0
  height 30px
  line-height 30px
  font-size 13px
  border none
  outline none
  padding-left 15px
  background transparent
  width calc(100% - 200px)
  margin-right -100px

.bottom
  height calc(100% - 50px)
</style>
