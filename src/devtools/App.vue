<template>
  <div
    id="app"
    class="app"
    :class="{
      beta: isBeta
    }"
  >
    <datalist id="special-tokens">
      <option
        v-for="(value, key) of specialTokens"
        :key="key"
        :value="key"
      />
    </datalist>
    <div class="header">
      <img
        class="logo"
        src="./assets/logo.png"
        alt="Vue"
      >
      <span class="message-container">
        <transition name="slide-up">
          <span
            :key="message"
            class="message"
          >
            <span>{{ message }}</span>

            <span class="badges">
              <span
                v-if="isBeta"
                class="badge"
              >
                beta devtools
              </span>
            </span>
          </span>
        </transition>
      </span>

      <div class="actions">
        <VueGroup
          v-model="routeModel"
          class="primary inline"
          indicator
        >
          <VueGroupButton
            v-tooltip="$t('App.components.tooltip')"
            :class="{
              'icon-button': !$responsive.wide
            }"
            value="components"
            icon-left="device_hub"
            class="components-tab flat"
          >
            Components
          </VueGroupButton>
          <VueGroupButton
            v-tooltip="$t('App.vuex.tooltip')"
            :class="{
              'icon-button': !$responsive.wide
            }"
            value="vuex"
            icon-left="restore"
            class="vuex-tab flat"
          >
            Vuex
          </VueGroupButton>
          <VueGroupButton
            v-tooltip="$t('App.events.tooltip')"
            :tag="newEventCount > 0 ? newEventCount : null"
            :class="{
              'icon-button': !$responsive.wide
            }"
            value="events"
            icon-left="grain"
            class="events-tab flat big-tag"
          >
            Events
          </VueGroupButton>
        </VueGroup>

        <VueButton
          ref="refresh"
          v-tooltip="$t('App.refresh.tooltip')"
          class="refresh-button flat"
          :class="{
            'icon-button': !$responsive.wide
          }"
          icon-left="refresh"
          @click="refresh"
        >
          Refresh
        </VueButton>
      </div>
    </div>

    <router-view class="container" />
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
  name: 'App',

  components: {
    components: ComponentsTab,
    vuex: VuexTab,
    events: EventsTab
  },

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
            } else if (key === 'p' || code === 'KeyP') {
              // Prevent chrome devtools from opening the print modal
              return false
            }
        }
      }
    })
  ],

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

  mounted () {
    this.mediaQuery = window.matchMedia('(min-width: 685px)')
    this.switchView(this.mediaQuery)
    this.mediaQuery.addListener(this.switchView)
  },

  destroyed () {
    this.mediaQuery.removeListener(this.switchView)
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
  position relative
  .vue-ui-dark-mode &
    background-color $dark-background-color
  &.beta
    &::after
      display block
      content ''
      position absolute
      top 0
      left 0
      width 100%
      border-top 2px rgba($orange, .4) solid

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
  display flex
  align-items center

.badges
  display flex
  align-items center

.badge
  background rgba($orange, .7)
  color white
  font-size 10px
  line-height 10px
  padding 2px 6px
  border-radius 8px
  margin-left 6px
  .vue-ui-dark-mode &
    opacity .75

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
