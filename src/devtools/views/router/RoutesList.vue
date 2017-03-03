<template>
  <scroll-pane scroll-event="route:init">
    <action-header slot="header">
      <h2>Route List</h2>
    </action-header>
    <div slot="scroll">
      <div class="entry" v-for="route in routes">{{ route.path }}</div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader
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

.entry
  display: flex
  align-items: center
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

</style>
