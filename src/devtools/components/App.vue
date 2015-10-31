<style lang="stylus" src="../global.styl"></style>

<template>
<div class="app">
  <div class="header">
    <img class="logo" src="../assets/logo.png">
    <i class="search-icon material-icons">search</i>
    <input class="search-box" :placeholder="message" v-model="filter" debounce="100">
    <a class="button toggle" @click="toggleLiveMode">
      <span class="live-mode-indicator" :class="{ off: !isLiveMode }"></span>
      <span>Live Mode</span>
    </a>
    <a class="button refresh" @click="refresh" v-show="!isLiveMode" transition="fade">
      <i class="material-icons">autorenew</i>
      <span>Refresh</span>
    </a>
  </div>
  <div class="container">
    <Tree class="column" :instances="instances"></Tree>
    <Inspector class="column" :target="inspectedInstance"></Inspector>
  </div>
</div>
</template>

<script>
import Tree from './Tree.vue'
import Inspector from './Inspector.vue'

export default {
  components: { Tree, Inspector },
  data () {
    return {
      message: 'Looking for Vue.js...',
      isLiveMode: true,
      filter: '',
      selected: null,
      hovered: null,
      inspectedInstance: {},
      instances: [],
      snapshots: []
    }
  },
  ready () {
    bridge.once('ready', version => {
      this.message = 'Ready. Detected Vue ' + version + '.'
    })
    bridge.on('flush', payload => {
      this.instances = payload.instances
      this.inspectedInstance = payload.inspectedInstance
    })
    bridge.on('instance-details', details => {
      this.inspectedInstance = details
    })
  },
  beforeDestroy () {
    bridge.removeAllListeners('flush')
    bridge.removeAllListeners('instance-details')
  },
  events: {
    selected (target) {
      if (this.selected === target) {
        return
      }
      if (this.selected) {
        this.selected.selected = false
      }
      target.selected = true
      this.selected = target
      this.message = 'Instance selected: ' + target.instance.name
      bridge.send('select-instance', target.instance.id)
    }
  },
  watch: {
    filter (val) {
      // TODO
    }
  },
  methods: {
    toggleLiveMode () {
      this.isLiveMode = !this.isLiveMode
      bridge.send('toggle-live-mode')
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

.button
  float right
  cursor pointer
  height $header-height
  line-height $header-height
  border-left 1px solid $border-color
  border-bottom 1px solid $border-color
  background-color #fff
  font-size 13px
  color #666
  padding 0 20px 0 18px
  transition all .25s ease
  &:hover
    box-shadow 0 0 16px rgba(0,0,0,.1)

.live-mode-indicator
  width 12px
  height 12px
  box-shadow 0 0 12px rgba(51, 204, 51, .25)
  background-color #85E085
  transition background-color .2s ease
  border-radius 50%
  margin-right 4px
  &.off
    background-color #ccc
    box-shadow none

.search-icon
  font-size 24px

.search-box
  font-family Roboto
  color #333
  height $header-height - 1px
  line-height $header-height - 1px
  font-size 13px
  border none
  outline none
  padding-left 50px
  margin-left -50px
  background transparent
  width calc(100% - 300px)

.container
  padding-top $header-height
  position relative
  z-index 1
  height 100%
  display flex
  align-items strech

  .column
    width 50%
    overflow scroll
    &:first-child
      border-right 1px solid $border-color

.fade-enter, .fade-leave
  opacity 0
</style>
