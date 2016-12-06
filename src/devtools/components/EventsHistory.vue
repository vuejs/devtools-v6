<template>
  <scroll-pane>
    <actions slot="header">
      <div class="search">
        <i class="search-icon material-icons">search</i>
        <input placeholder="Filter events" v-model.trim="filter" @input="filterEvents">
      </div>  
      <a class="button reset" @click="reset">
        <i class="material-icons">cached</i>
        <span>Reset</span>
      </a>
    </actions>
    <div slot="scroll" class="history">
      <div v-if="events.length === 0" class="no-events">
        No events found
      </div>
      <div class="entry" 
        v-else
        v-for="(event, index) in events"
        :class="{ active: activeEventIndex === index }"
        @click="step(index)">
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
import ScrollPane from './ScrollPane.vue'
import Actions from './Actions.vue'
import { mapState } from 'vuex'

export default {
  components: {
    ScrollPane,
    Actions,
  },
  computed: {
    ...mapState({
      events: state => state.events.filteredEvents,
      activeEventIndex: state => state.events.activeFilteredEventIndex
    })
  },
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  },
  data () {
    return {
      filter: ''
    }
  },
  methods: {
    step (index) {
      this.$store.commit('events/STEP', index)
    },
    reset () {
      this.$store.commit('events/RESET')
    },
    filterEvents () {
      this.$store.commit('events/FILTER_EVENTS', this.filter)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../common"

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
