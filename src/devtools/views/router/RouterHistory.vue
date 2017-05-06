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
      <a class="button toggle-recording" @click="toggleRecording" :title="enabled ? 'Stop Recording' : 'Start Recording'">
        <i class="material-icons small" :class="{ enabled }">lens</i>
        <span>{{ enabled ? 'Recording' : 'Paused' }}</span>
      </a>
    </action-header>
    <div slot="scroll" class="">
      <div v-if="filteredRoutes.length === 0" class="no-entries">
        No route transitions found<span v-if="!enabled"><br>(Recording is paused)</span>
      </div>
      <div class="entry"
        v-else
        v-for="route in filteredRoutes"
        :class="{ active: inspectedIndex === filteredRoutes.indexOf(route) }"
        @click="inspect(filteredRoutes.indexOf(route))">
        <div class="urls">
          <span>{{ route.to.path }}</span>
        </div>
        <div>
          <span class="time">{{ route.timestamp | formatTime }}</span>
          <span class="label redirect" v-if="route.to.redirectedFrom">redirect</span>
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
    filter: {
      get () {
        return this.$store.state.router.filter
      },
      set (filter) {
        this.$store.commit('router/UPDATE_FILTER', filter)
      }
    },
    ...mapState('router', [
      'enabled',
      'routeChanges',
      'inspectedIndex'
    ]),
    ...mapGetters('router', [
      'filteredRoutes'
    ])
  },
  methods: {
    ...mapMutations('router', {
      inspect: 'INSPECT',
      reset: 'RESET',
      toggleRecording: 'TOGGLE'
    })
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common"

.entry
  display: flex
  align-items: center

.urls
  margin-right: auto


.label
  float right
  font-size 10px
  padding 4px 8px
  border-radius 6px
  margin-right 8px
  &.redirect
    color: #fff
    background-color: #af90d5
</style>
