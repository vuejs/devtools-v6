<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <i class="search-icon material-icons">search</i>
        <input placeholder="Filter events" v-model.trim="filter">
      </div>
      <a class="button reset" :class="{ disabled: !events.length }" @click="reset" title="Clear Log">
        <i class="material-icons small">do_not_disturb</i>
        <span>Clear</span>
      </a>
      <a class="button toggle-recording" @click="toggleRecording" :title="enabled ? 'Stop Recording' : 'Start Recording'">
        <i class="material-icons small" :class="{ enabled: enabled }">lens</i>
        <span>{{ enabled ? 'Recording' : 'Paused' }}</span>
      </a>
    </action-header>
    <div slot="scroll" class="history">
      <div v-if="filteredEvents.length === 0" class="no-events">
        No events found
      </div>
      <div class="entry"
        v-else
        v-for="event in filteredEvents"
        :class="{ active: inspectedIndex === events.indexOf(event) }"
        @click="inspect(events.indexOf(event))">
        <span class="event-name">{{ event.eventName }}</span>
        <span class="event-source">
          by
          <span>&lt;</span>
          <span class="component-name">{{ event.instanceName }}</span>
          <span>&gt;</span>
        </span>
        <span class="time">{{ event.timestamp | formatTime }}</span>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader
  },
  computed: {
    filter: {
      get () {
        return this.$store.state.events.filter
      },
      set (filter) {
        this.$store.commit('events/UPDATE_FILTER', filter)
      }
    },
    ...mapState('events', [
      'enabled',
      'events',
      'inspectedIndex'
    ]),
    ...mapGetters('events', [
      'filteredEvents'
    ])
  },
  methods: mapMutations('events', {
    inspect: 'INSPECT',
    reset: 'RESET',
    toggleRecording: 'TOGGLE'
  }),
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  }
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
  background-color #fff
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  .event-source
    color #999
  .component-name
    color $component-color
  &.active
    color #fff
    background-color $active-color
    .time
      color lighten($active-color, 75%)
    .event-name
      color: #fff
    .component-name
      color lighten($active-color, 75%)
    .event-source
      color #ddd

.action-wrapper
  margin-top: 5px;

.action
  color lighten($active-color, 75%)
  font-size 11px
  dispatch inline-block
  vertical-align middle
  margin-left 8px
  white-space nowrap
  .material-icons
    font-size 14px
    margin-right -4px
  .material-icons, span
    vertical-align middle
  &:hover
    color #fff

.time
  font-size 11px
  color #999
  float right
  margin-top 3px
</style>
