<style lang="stylus" src="./global.styl"></style>

<template>
<div id="app" :class="{ app: true, dark: isDark }">
  <div class="header">
    <img class="logo" src="./assets/logo.png" alt="Vue">
    <span class="message-container">
      <transition name="slide-up">
        <span class="message" :key="message">{{ message }}</span>
      </transition>
    </span>
    <a class="button components"
      :class="{ active: tab === 'components'}"
      @click="switchTab('components')"
      title="Switch to Components">
      <i class="material-icons">device_hub</i>
      <span class="pane-name">Components</span>
    </a>
    <a class="button vuex"
      :class="{ active: tab === 'vuex'}"
      @click="switchTab('vuex')"
      title="Switch to Vuex">
      <i class="material-icons">restore</i>
      <span class="pane-name">Vuex</span>
    </a>
    <a class="button events"
      :class="{ active: tab === 'events' }"
      @click="switchTab('events')"
      title="Switch to Events">
      <i class="material-icons">grain</i>
      <span class="pane-name">Events</span>
      <span class="event-count" v-if="newEventCount > 0">{{ newEventCount }}</span>
    </a>
    <a class="button refresh"
      @click="refresh"
      title="Force Refresh">
      <i class="material-icons">cached</i>
      <span class="pane-name">Refresh</span>
    </a>
    <span class="active-bar"></span>
  </div>
  <component :is="tab" class="container"></component>
</div>
</template>

<script>
import ComponentsTab from './views/components/ComponentsTab.vue'
import EventsTab from './views/events/EventsTab.vue'
import VuexTab from './views/vuex/VuexTab.vue'

import { mapState } from 'vuex'

export default {
  name: 'app',
  data () {
    return {
      isDark: typeof chrome !== 'undefined' &&
        typeof chrome.devtools !== 'undefined' &&
        chrome.devtools.panels.themeName === 'dark'
    }
  },
  components: {
    components: ComponentsTab,
    vuex: VuexTab,
    events: EventsTab
  },
  computed: mapState({
    message: state => state.message,
    tab: state => state.tab,
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
    },
    updateActiveBar () {
      const activeButton = this.$el.querySelector('.button.active')
      const activeBar = this.$el.querySelector('.active-bar')
      activeBar.style.left = activeButton.offsetLeft + 'px'
      activeBar.style.width = activeButton.offsetWidth + 'px'
    }
  },
  mounted () {
    this.updateActiveBar()
    window.addEventListener('resize', this.updateActiveBar)
  },
  destroyed () {
    window.removeEventListener('resize', this.updateActiveBar)
  },
  watch: {
    tab () {
      this.$nextTick(this.updateActiveBar)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "./common"

.app
  width 100%
  height 100%
  user-select none
  background-color $background-color
  display flex
  flex-direction column
  h1
    color #42b983
  &.dark
    background-color $dark-background-color

.header
  display flex
  align-items center
  border-bottom 1px solid $border-color
  box-shadow 0 0 8px rgba(0, 0, 0, 0.15)
  font-size 14px
  position relative
  .app.dark &
    border-bottom 1px solid $dark-border-color

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
  padding 10px
  display flex
  align-items center
  cursor pointer
  position relative
  border-bottom-color transparent
  background-color $background-color
  color #888
  transition color .35s ease
  .app.dark &
    background-color $dark-background-color

  &:hover
    color #555

  &.active
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
    padding-right 20px
    padding-left 20px
    .pane-name
      display block

  @media (min-height: $tall)
    padding-top 20px
    padding-bottom 20px

.container
  overflow hidden
  flex 1

$event-count-bubble-size = 18px

.event-count
  background-color $active-color
  color #fff
  border-radius 50%
  width $event-count-bubble-size
  height $event-count-bubble-size
  text-align center
  padding-top 4px
  font-size $event-count-bubble-size * 0.5
  position absolute
  right 0
  top 12px
  .app.dark &
    background-color $dark-background-color

.active-bar
  position absolute
  bottom 0
  width 0px
  height 3px
  background-color $active-color
  transition all .32s cubic-bezier(0,.9,.6,1)
</style>
