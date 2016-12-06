<style lang="stylus" src="../global.styl"></style>

<template>
<div id="app" class="app">
  <div class="header">
    <img class="logo" src="../assets/logo.png" alt="Vue">
    <span class="message-container">
      <transition name="slide-up">
        <span class="message" :key="message">{{ message }}</span>
      </transition>
    </span>
    <a class="button components"
      :class="{ active: tab === 'components'}"
      @click="switchTab('components')">
      <i class="material-icons">device_hub</i>
      <span class="pane-name">Components</span>
    </a>
    <a class="button vuex"
      :class="{ active: tab === 'vuex'}"
      @click="switchTab('vuex')">
      <i class="material-icons">restore</i>
      <span class="pane-name">Vuex</span>
    </a>
    <a class="button events"
      :class="{ active: tab === 'events' }"
      @click="switchTab('events')">
      <i class="material-icons">grain</i>
      <span class="pane-name">Events</span>
      <span class="event-count" v-if="newEventCount > 0">{{ newEventCount }}</span>
    </a>
    <a class="button refresh"
      @click="refresh">
      <i class="material-icons">cached</i>
      <span class="pane-name">Refresh</span>
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
@import "../common"

.app
  width 100%
  height 100%
  user-select none
  background-color #fff
  display flex
  flex-direction column
  h1
    color #42b983

.header
  display flex
  align-items center
  border-bottom 1px solid $border-color
  box-shadow 0 0 8px rgba(0, 0, 0, 0.15)
  font-size 14px

.logo
  width 30px
  height 30px
  margin 0 15px

.message-container
  height 1em
  cursor default

.message
  color $active-color
  transition all .3s ease
  position absolute

.button
  padding 15px 10px
  display flex
  align-items center
  cursor pointer
  position relative
  border-bottom-color transparent
  background-color #fff
  color #888
  transition box-shadow .25s ease, border-color .5s ease, opacity .5s

  &:hover
    color #555

  &.active
    border-bottom 3px solid $active-color
    color $active-color

  &.components
    margin-left auto

  .material-icons
    font-size 20px
    margin-right 5px
    color inherit

  .pane-name
    display none

  @media (min-width: $wide)
    padding 20px 15px
    .pane-name
      display block

.container
  overflow hidden
  flex 1

$event-count-bubble-size = 22px

.event-count
  background-color $active-color
  color #fff
  border-radius 50%
  width $event-count-bubble-size
  height $event-count-bubble-size
  text-align center
  line-height $event-count-bubble-size
  font-size $event-count-bubble-size * 0.5
  position absolute
  right 0
  top 3px
</style>
