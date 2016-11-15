<style lang="stylus" src="../global.styl"></style>

<template>
<div id="app" class="app">
  <div class="header">
    <img class="logo" src="../assets/logo.png">
    <span class="message-container">
      <transition name="slide-up">
        <span class="message" :key="message">{{ message }}</span>
      </transition>
    </span>
    <a class="button refresh"
      @click="refresh">
      <i class="material-icons">cached</i>
      <span>Refresh</span>
    </a>
    <a class="button events"
      :class="{ active: tab === 'events' }"
      @click="switchTab('events')">
      <i class="material-icons">grain</i>
      <span>Events</span>
      <span class="new-event-count" v-if="newEventCount > 0">{{ newEventCount }}</span>
    </a>
    <a class="button vuex"
      :class="{ active: tab === 'vuex'}"
      @click="switchTab('vuex')">
      <i class="material-icons">restore</i>
      <span>Vuex</span>
    </a>
    <a class="button components"
      :class="{ active: tab === 'components'}"
      @click="switchTab('components')">
      <i class="material-icons">device_hub</i>
      <span>Components</span>
    </a>
  </div>
  <component :is="tab" class="container"></component>
</div>
</template>

<script>
import ComponentsTab from './ComponentsTab.vue'
import EventsTab from './EventsTab.vue'
import VuexTab from './VuexTab.vue'
import { mapState } from 'vuex'

export default {
  components: {
    components: ComponentsTab,
    vuex: VuexTab,
    events: EventsTab
  },
  computed: mapState({
    message: state => state.app.message,
    tab: state => state.app.tab,
    newEventCount: state => state.events.newEventCount
  }),
  methods: {
    switchTab (tab) {
      bridge.send('switch-tab', tab)
      this.$store.commit('SWITCH_TAB', tab)
      if (tab === 'events') {
        this.$store.commit('events/RESET_NEW_EVENT_COUNT')
      }
    },
    refresh () {
      bridge.send('refresh')
    }
  }
}
</script>

<style lang="stylus" scoped>
$header-height = 50px
$border-color = #e3e3e3
$blue = #44A1FF

.app
  width 100%
  height 100%
  user-select none
  background-color #fff
  h1
    color #42b983

.header
  position absolute
  z-index 2
  width 100%
  height $header-height
  border-bottom 1px solid $border-color
  box-shadow 0 0 8px rgba(0,0,0,.15)
  font-size 13px
  img, span, a, .material-icons
    display inline-block
    vertical-align middle
  .material-icons
    margin-right 3px
    position relative
    top -1px
    color #999

.logo
  width 30px
  height 30px
  margin 10px 15px

.message-container
  display inline-block
  height 1em
  cursor default

.message
  color $blue
  transition all .3s ease
  display inline-block
  position absolute

.button
  float right
  position relative
  z-index 1
  cursor pointer
  height $header-height
  line-height $header-height
  border-left 1px solid $border-color
  border-bottom 1px solid $border-color
  background-color #fff
  font-size 13px
  color #666
  padding 0 22px 0 20px
  transition box-shadow .25s ease, border-color .5s ease
  &:hover
    box-shadow 0 2px 12px rgba(0,0,0,.1)
  &:active
    box-shadow 0 2px 16px rgba(0,0,0,.25)
  &.active
    border-bottom 2px solid $blue

.container
  padding-top $header-height
  position relative
  z-index 1
  height 100%

.new-event-count
  background-color: #44a1ff;
  color: #fff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  text-align: center;
  line-height: 15px;
  font-size: 9px;
  position: absolute;
  right: 7px;
  top: 7px;
  padding-right: 0.6px;
</style>
