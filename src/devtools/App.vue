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

    <div class="actions">
      <VueGroup
        v-model="routeModel"
        class="primary inline"
        indicator
      >
        <VueGroupButton
          :class="{
            'icon-button': !$responsive.wide
          }"
          value="components"
          icon-left="device_hub"
          class="flat"
          v-tooltip="$t('App.components.tooltip')"
        >
          Components
        </VueGroupButton>
        <VueGroupButton
          :class="{
            'icon-button': !$responsive.wide
          }"
          value="vuex"
          icon-left="restore"
          class="flat"
          v-tooltip="$t('App.vuex.tooltip')"
        >
          Vuex
        </VueGroupButton>
        <VueGroupButton
          :tag="newEventCount > 0 ? newEventCount : null"
          :class="{
            'icon-button': !$responsive.wide
          }"
          value="events"
          icon-left="grain"
          class="flat big-tag"
          v-tooltip="$t('App.events.tooltip')"
        >
          Events
        </VueGroupButton>
      </VueGroup>

      <VueButton
        ref="refresh"
        :class="{
          'icon-button': !$responsive.wide
        }"
        icon-left="refresh"
        v-tooltip="$t('App.refresh.tooltip')"
        class="flat"
        @click="refresh"
      >
        Refresh
      </VueButton>
    </div>
  </div>

  <router-view class="container"/>
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
              this.$router.push({ name: 'components' })
              return false
            } else if (code === 'Digit2') {
              this.$router.push({ name: 'vuex' })
              return false
            } else if (code === 'Digit3') {
              this.$router.push({ name: 'events' })
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
      newEventCount: state => state.events.newEventCount,
      view: state => state.view
    }),

    specialTokens () {
      return SPECIAL_TOKENS
    },

    routeModel: {
      get () { return this.$route.name },
      set (value) {
        this.$router.push({ name: value })
      }
    }
  },

  watch: {
    '$route.name' (tab) {
      bridge.send('switch-tab', tab)
      if (tab === 'events') {
        this.$store.commit('events/RESET_NEW_EVENT_COUNT')
      }
    }
  },

  methods: {
    refresh () {
      const refreshIcon = this.$refs.refresh.$el.querySelector('.vue-ui-icon')
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
    }
  },

  mounted () {
    this.mediaQuery = window.matchMedia('(min-width: 685px)')
    this.switchView(this.mediaQuery)
    this.mediaQuery.addListener(this.switchView)
  },

  destroyed () {
    this.mediaQuery.removeListener(this.switchView)
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
  .vue-ui-dark-mode &
    background-color $dark-background-color

.header
  display flex
  align-items center
  border-bottom 1px solid $border-color
  box-shadow 0 0 8px rgba(0, 0, 0, 0.15)
  font-size 14px
  position relative
  .vue-ui-dark-mode &
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

.actions
  flex auto 1 1
  display flex
  justify-content flex-end

.vue-ui-button
  height 38px
  @media (max-width: $wide)
    width 38px
    /deep/
      .button-icon.left
        margin-right 0 !important
      .default-slot
        display none
  @media (min-height: $tall)
    height 48px
    @media (max-width: $wide)
      width @height

.vue-ui-group /deep/ > .indicator
  padding-bottom 0 !important

.container
  overflow hidden
  flex 1
</style>
