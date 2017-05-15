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
      <div v-if="filteredRoutes.length === 0" class="no-entries">
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

.entry
  display: flex
  align-items: center

.urls
  margin-right: auto

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
