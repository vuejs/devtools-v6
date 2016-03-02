<style lang="stylus" src="../global.styl"></style>

<template>
<div class="app">
  <div class="header">
    <img class="logo" src="../assets/logo.png">
    <span class="message-container">
      <span class="message"
        v-for="message in messages"
        transition="slide-up">
        {{ message }}
      </span>
    </span>
    <a class="button"
      @click="refresh">
      <i class="material-icons">autorenew</i>
      <span>Refresh</span>
    </a>
    <a class="button"
      :class="{ active: tab === 'vuex'}"
      @click="switchTab('vuex')">
      <i class="material-icons">restore</i>
      <span>Vuex</span>
    </a>
    <a class="button"
      :class="{ active: tab === 'components'}"
      @click="switchTab('components')">
      <i class="material-icons">list</i>
      <span>Components</span>
    </a>
  </div>
  <div class="container">
    <component :is="tab" keep-alive></component>
  </div>
</div>
</template>

<script>
import ComponentsTab from './ComponentsTab.vue'
import VuexTab from './VuexTab.vue'

export default {
  components: {
    components: ComponentsTab,
    vuex: VuexTab
  },
  vuex: {
    state: {
      messages: state => [state.app.message],
      tab: state => state.app.tab
    },
    actions: {
      setMessage: ({ dispatch }, message) => {
        dispatch('SET_MESSAGE', message)
      },
      switchTab: ({ dispatch }, tab) => {
        dispatch('SWITCH_TAB', tab)
      }
    }
  },
  created () {
    bridge.once('ready', version => {
      this.setMessage('Ready. Detected Vue ' + version + '.')
    })
    bridge.once('proxy-fail', () => {
      this.setMessage('Proxy injection failed. Make sure to load your app over HTTP.')
    })
  },
  methods: {
    refresh () {
      bridge.send('refresh')
    }
  }
}
</script>

<style lang="stylus" scoped>
$header-height = 50px
$border-color = #e3e3e3

.app
  width 100%
  height 100%
  user-select none
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
    margin-right 2px
    color #999

.logo
  width 30px
  height 30px
  margin 10px 15px

.message-container
  display inline-block
  height 1em

.message
  color #aaa
  transition all .3s ease
  display inline-block
  position absolute

.slide-up-enter
  opacity 0
  transform translate(0, 50%)

.slide-up-leave
  opacity 0
  transform translate(0, -50%)

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
    border-bottom 2px solid #44A1FF

.container
  padding-top $header-height
  position relative
  z-index 1
  height 100%
</style>
