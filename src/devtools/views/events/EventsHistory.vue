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
        @click="step(events.indexOf(event))">
        <div class="event">
          <div class="component-name">
            <span class="angle-bracket">&lt;</span>{{event.instanceName}}<span class="angle-bracket">&gt;</span>
          </div>
          <div class="event-name">
            {{ event.eventName }}
          </div>
        </div>
        <div class="event-meta">
          <span class="time">
            <div>{{ event.timestamp | formatTime }}</div>
          </span>
        </div>
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
    step: 'STEP',
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
  font-size 14px
  background-color #fff
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  &.active
    color #fff
    background-color $active-color
    .time
      color lighten($active-color, 75%)
    .event, .event-name
      color: #fff
  .mutation-type
    display inline-block
    vertical-align middle

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

.event
  width: 82%
  color: #0062c3
  span
    color: #ccc

.event-meta
  position: absolute
  right: 8px
  top: 10px

.event-name
  margin-top: 5px
  font-size: 12px
  color #881391

.time
  font-size 11px
  color #999
  float right
  margin-top 3px

.component-name
  color $component-color

.active .component-name
  color #fff
</style>
