<template>
  <div>
    <div class="buttons">
      <a class="button" @click="reset">
        <i class="material-icons">cached</i>
        <span>Reset</span>
      </a>
    </div>
    <div class="history">
      <div class="entry" 
        v-for="(event, index) in events"
        :class="{ active: activeIndex === index }"
        @click="step(index)">
        <div class="event">
          <div>
            <span class="angle-bracket">&lt;</span>{{event.instanceName}}<span class="angle-bracket">&gt;</span>
          </div>
          <div class="event-name">
            {{ event.eventName }}
          </div>
        </div>
        <div class="event-meta">
          <span class="time">
            <div>{{ event.timestamp | formatTime }}</div>
            <div v-if="activeIndex === index" class="action-wrapper">
              <a class="action" @click.stop="emitSelected(event)">
                <i class="material-icons">flare</i>
                <span>Emit</span>
              </a>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState({
    events: state => state.events.emitted,
    activeIndex: state => state.events.activeIndex
  }),
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  },
  methods: {
    step (index) {
      this.$store.commit('events/STEP', index)
    },
    reset () {
      this.$store.commit('events/RESET')
    },
    emitSelected (event) {
      bridge.send('trigger-event', event)
    }
  }
}
</script>

<style lang="stylus" scoped>
$blue = #44A1FF

.buttons
  padding 15px 30px 5px 20px
  border-bottom 1px solid #eee

.button
  color #555
  cursor pointer
  display inline-block
  font-size 13px
  margin 0 20px 10px 0
  transition color .2s ease
  &:hover
    color $blue
  &.disabled
    color #aaa
    cursor not-allowed
  .material-icons
    font-size 16px
  .material-icons, span
    vertical-align middle

.history
  height calc(100% - 48px)
  overflow-x hidden
  overflow-y auto

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
    background-color $blue
    .time
      color lighten($blue, 75%)
    .event, .event-name 
      color: #fff
  .mutation-type
    display inline-block
    vertical-align middle

.action-wrapper
  margin-top: 5px;

.action
  color lighten($blue, 75%)
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
</style>
