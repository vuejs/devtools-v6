<style lang="stylus" src="./global.styl"></style>

<template>
<div class="app">
  <div class="header">
    <button @click="toggleLiveMode">Toggle Live Mode</button>
    <button @click="refresh">Refresh</button>
    <p class="status">{{ message }}</p>
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
      this.message = 'instance selected: ' + target.instance.name
      bridge.send('select-instance', target.instance.id)
      bridge.once('instance-details', details => {
        this.inspectedInstance = details
      })
    }
  },
  methods: {
    toggleLiveMode () {
      // TODO
    },
    refresh () {
      // TODO
    }
  }
}
</script>

<style lang="stylus" scoped>
.app
  width 100%
  height 100%
  user-select none
  h1
    color #42b983

.header
  padding 10px 20px
  position absolute
  z-index 2
  box-sizing border-box
  width 100%
  height 80px
  border-bottom 1px solid #e3e3e3
  box-shadow 0 0 8px rgba(0,0,0,.15)
  .status
    color blue
    position absolute
    top 10px
    right 20px

.container
  padding-top 80px
  box-sizing border-box
  position relative
  z-index 1
  height 100%
  display flex
  align-items strech

  .column
    width 50%
    box-sizing border-box
    overflow scroll
    &:first-child
      border-right 1px solid #e3e3e3
</style>
