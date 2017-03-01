<template>
  <scroll-pane scroll-event="route:init">
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input class="" placeholder="Filter routes" v-model.trim="filter">
      </div>
    </action-header>
    <div slot="scroll" class="">
      <div v-if="routeChanges.length === 0" class="no-routes">
        No route chnages found
      </div>
      <div class="entry"
        v-else
        v-for="routeChange in routeChanges"
        :class="{ active: inspectedIndex === routeChanges.indexOf(routeChange) }"
        @click="inspect(routeChanges.indexOf(routeChange))">
        <div class="">From: {{ routeChange.from.fullPath }}</span>
        <div class="">To: {{ routeChange.to.fullPath }}</span>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader
  },
  computed: { 
    ...mapState('router', [
      'routeChanges',
      'inspectedIndex'
    ])
  },
  data () {
    return {
      filter: ''
    }
  },
  methods: mapMutations('router', {
    inspect: 'INSPECT'
  })
}
</script>

<style lang="stylus" scoped>
@import "../../common"

.no-events
  color: #ccc
  text-align: center
  margin-top: 50px
  line-height: 30px

.entry
  position: relative;
  font-family Menlo, Consolas, monospace
  color #881391
  cursor pointer
  padding 10px 20px
  font-size 12px
  background-color $background-color
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  .event-name
    font-weight 600
  .event-source
    color #999
  .component-name
    color $component-color
  .event-type
    color #999
    margin-left 8px
  &.active
    color #fff
    background-color $active-color
    .time, .event-type, .component-name
      color lighten($active-color, 75%)
    .event-name
      color: #fff
    .event-source
      color #ddd
  .app.dark &
    background-color $dark-background-color

.time
  font-size 11px
  color #999
  float right
  margin-top 3px
</style>
