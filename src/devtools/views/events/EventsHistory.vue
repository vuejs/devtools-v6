<template>
  <scroll-pane scroll-event="event:emit">
    <action-header slot="header">
      <div
        class="search"
        v-tooltip="searchTooltip"
      >
        <i class="search-icon material-icons">search</i>
        <input placeholder="Filter events" v-model.trim="filter">
      </div>
      <a class="button reset" :class="{ disabled: !events.length }" @click="reset" v-tooltip="'Clear Log'">
        <i class="material-icons small">do_not_disturb</i>
        <span>Clear</span>
      </a>
      <a class="button toggle-recording" @click="toggleRecording" v-tooltip="enabled ? 'Stop Recording' : 'Start Recording'">
        <i class="material-icons small" :class="{ enabled }">lens</i>
        <span>{{ enabled ? 'Recording' : 'Paused' }}</span>
      </a>
    </action-header>
    <div slot="scroll" class="history">
      <div v-if="filteredEvents.length === 0" class="no-events">
        No events found<span v-if="!enabled"><br>(Recording is paused)</span>
      </div>
      <div class="entry list-item"
        v-else
        v-for="event in filteredEvents"
        :class="{ active: inspectedIndex === events.indexOf(event) }"
        @click="inspect(events.indexOf(event))">
        <span class="event-name">{{ event.eventName }}</span>
        <span class="event-type">{{ event.type }}</span>
        <span class="event-source">
          by
          <span>&lt;</span>
          <span class="component-name">{{ displayComponentName(event.instanceName) }}</span>
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
import { classify } from 'src/util'

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
    ]),
    ...mapState('components', [
      'classifyComponents'
    ]),
    searchTooltip () {
      return `To filter on components, type '<span class="mono">&lt;MyComponent&gt;</span>' or just '<span class="mono">&lt;mycomp</span>'.`
    }
  },
  methods: {
    ...mapMutations('events', {
      inspect: 'INSPECT',
      reset: 'RESET',
      toggleRecording: 'TOGGLE'
    }),
    displayComponentName (name) {
      return this.classifyComponents ? classify(name) : name
    }
  },
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../variables"

.no-events
  color #ccc
  text-align center
  margin-top 50px
  line-height 30px

.entry
  position relative;
  font-family Menlo, Consolas, monospace
  cursor pointer
  padding 10px 20px
  font-size 12px
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
    .time, .event-type, .component-name
      color lighten($active-color, 75%)
    .event-name
      color: #fff
    .event-source
      color #ddd

.time
  font-size 11px
  color #999
  float right
</style>
