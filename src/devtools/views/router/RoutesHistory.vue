<template>
  <scroll-pane scroll-event="route:init">
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input class="" placeholder="Filter routes" v-model.trim="filter">
      </div>
      <a class="button reset" :class="{ disabled: !routeChanges.length }" @click="reset" title="Clear Routes">
        <i class="material-icons small">do_not_disturb</i>
        <span>Clear</span>
      </a>
    </action-header>
    <div slot="scroll" class="">
      <div v-if="filteredRoutes.length === 0" class="no-routes">
        No route transitions found
      </div>
      <div class="entry"
        v-else
        v-for="route in filteredRoutes"
        :class="{ active: inspectedIndex === filteredRoutes.indexOf(route) }"
        @click="inspect(filteredRoutes.indexOf(route))">
        <div class="urls">
          <span><b>From:</b> {{ route.from.path }}</span></br></br>
          <span><b>To:</b> {{ route.to.path }}</span>
        </div>
        <div>
          <span class="redirect" v-if="route.to.redirectedFrom">redirect</span>
          <span class="time">{{ route.timestamp | formatTime }}</span>
        </div>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader
  },
  computed: {
    ...mapState('router', [
      'routeChanges',
      'inspectedIndex'
    ]),
    ...mapGetters('router', [
      'filteredRoutes'
    ]),
    filter: {
      get () {
        return this.$store.state.router.filter
      },
      set (filter) {
        this.$store.commit('router/UPDATE_FILTER', filter)
      }
    }
  },
  methods: mapMutations('router', {
    inspect: 'INSPECT',
    reset: 'RESET'
  })
}
</script>

<style lang="stylus" scoped>
@import "../../common"

.no-routes
  color: #ccc
  text-align: center
  margin-top: 50px
  line-height: 30px

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

.urls
  margin-right: auto

.time
  font-size 11px
  color #999
  float right
  margin-top 3px

.redirect
  color: #fff
  background-color: #af90d5
  padding: 3px 6px
  font-size: 10px
  line-height: 10px
  height: 16px
  border-radius: 3px
  margin-right: 17px
  position: relative
</style>
