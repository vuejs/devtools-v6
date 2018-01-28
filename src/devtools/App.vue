<template>
<div id="app" class="app">
  <datalist id="special-tokens">
    <option v-for="(value, key) of specialTokens" :key="key" :value="key"></option>
  </datalist>
  <div class="header">
    <img class="logo" src="./assets/logo.png" alt="Vue">
    <span class="message-container">
      <transition name="slide-up">
        <span class="message" :key="message">{{ message }}</span>
      </transition>
    </span>
    <a
      class="button components"
      :class="{ active: tab === 'components'}"
      v-tooltip="$t('App.components.tooltip')"
      @click="switchTab('components')"
    >
      <BaseIcon icon="device_hub"/>
      <span class="pane-name">Components</span>
    </a>
    <a
      class="button vuex"
      :class="{ active: tab === 'vuex'}"
      v-tooltip="$t('App.vuex.tooltip')"
      @click="switchTab('vuex')"
    >
      <BaseIcon icon="restore"/>
      <span class="pane-name">Vuex</span>
    </a>
    <a
      class="button events"
      :class="{ active: tab === 'events' }"
      v-tooltip="$t('App.events.tooltip')"
      @click="switchTab('events')"
    >
      <BaseIcon icon="grain"/>
      <span class="pane-name">Events</span>
      <span class="event-count" v-if="newEventCount > 0">{{ newEventCount }}</span>
    </a>
    <a
      class="button refresh"
      v-tooltip="$t('App.refresh.tooltip')"
      @click="refresh"
    >
      <BaseIcon ref="refresh" icon="refresh"/>
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
import { SPECIAL_TOKENS } from '../util'
import Keyboard from './mixins/keyboard'

import { mapState } from 'vuex'

export default {
  name: 'app',
  mixins: [
    Keyboard({
      onKeyDown ({ key, code, modifiers }) {
        switch (modifiers) {
          case 'ctrl+alt':
            if (key === 'r' || code === 'KeyR') {
              this.refresh()
              return false
            }
            break
          case 'ctrl':
            if (code === 'Digit1') {
              this.switchTab('components')
              return false
            } else if (code === 'Digit2') {
              this.switchTab('vuex')
              return false
            } else if (code === 'Digit3') {
              this.switchTab('events')
              return false
            }
        }
      }
    })
  ],
  components: {
    components: ComponentsTab,
    vuex: VuexTab,
    events: EventsTab
  },
  computed: {
    ...mapState({
      message: state => state.message,
      tab: state => state.tab,
      newEventCount: state => state.events.newEventCount,
      view: state => state.view
    }),
    specialTokens () {
      return SPECIAL_TOKENS
    }
  },
  methods: {
    switchTab (tab) {
      bridge.send('switch-tab', tab)
      this.$store.commit('SWITCH_TAB', tab)
      if (tab === 'events') {
        this.$store.commit('events/RESET_NEW_EVENT_COUNT')
      }
    },
    refresh () {
      const refreshIcon = this.$refs.refresh.$el
      refreshIcon.style.animation = 'none'

      bridge.send('refresh')
      bridge.once('flush', () => {
        refreshIcon.style.animation = 'rotate 1s'
      })
    },
    switchView (mediaQueryEvent) {
      this.$store.commit(
        'SWITCH_VIEW',
        mediaQueryEvent.matches ? 'vertical' : 'horizontal'
      )
    },
    updateActiveBar () {
      const activeButton = this.$el.querySelector('.button.active')
      const activeBar = this.$el.querySelector('.active-bar')
      activeBar.style.left = activeButton.offsetLeft + 'px'
      activeBar.style.width = activeButton.offsetWidth + 'px'
    }
  },
  mounted () {
    this.mediaQuery = window.matchMedia('(min-width: 685px)')
    this.switchView(this.mediaQuery)
    this.mediaQuery.addListener(this.switchView)

    this.updateActiveBar()
    window.addEventListener('resize', this.updateActiveBar)
  },
  destroyed () {
    window.removeEventListener('resize', this.updateActiveBar)
    this.mediaQuery.removeListener(this.switchView)
  },
  watch: {
    tab () {
      this.$nextTick(this.updateActiveBar)
    }
  }
}
</script>

<style lang="stylus" src="./global.styl">
</style>

<style lang="stylus" scoped>
@import "./variables"

.app
  width 100%
  height 100%
  user-select none
  background-color $background-color
  display flex
  flex-direction column
  .dark &
    background-color $dark-background-color

.header
  display flex
  align-items center
  border-bottom 1px solid $border-color
  box-shadow 0 0 8px rgba(0, 0, 0, 0.15)
  font-size 14px
  position relative
  .dark &
    border-bottom 1px solid $dark-border-color

.logo
  width 30px
  height 30px
  margin 0 15px

.message-container
  height 1em
  cursor default
  display none
  @media (min-width: $wide - 300px)
    display block


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
  .dark &
    background-color $dark-background-color

  .svg-icon
    width 20px
    height @width
    margin-right 5px
    >>> svg
      fill @color
      transition fill .35s ease

  &:hover
    color #555
    .svg-icon >>> svg
      fill @color

  &.active
    color $active-color
    .svg-icon >>> svg
      fill @color

  &:first-of-type
    margin-left auto

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
  .dark &
    background-color $dark-background-color

.active-bar
  position absolute
  bottom 0
  width 0px
  height 3px
  background-color $active-color
  transition all .32s cubic-bezier(0,.9,.6,1)
</style>
