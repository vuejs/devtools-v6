<style lang="stylus" src="./global.styl"></style>

<template>
<div class="app">
  <div class="header">
    <h1>Vue Devtools</h1>
    <button @click="toggleLiveMode">Toggle Live Mode</button>
    <button @click="refresh">Refresh</button>
    <p class="status">{{message}}</p>
  </div>
  <div class="container">
    <tree class="column" :instances="instances"></tree>
    <inspector class="column" :target="inspectedInstance"></inspector>
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
      inspectedInstance: {},
      instances: []
    }
  },
  ready () {
    bridge.once('ready', () => {
      this.message = 'Ready.'
    })
    bridge.on('flush', payload => {
      this.instances = payload.instances
      this.inspectedInstance = payload.inspectedInstance
    })
    bridge.on('instance-details', details => {
      this.inspectedInstance = details
    })
  },
  events: {
    selected (target) {
      if (this.selected === target) {
        return
      }
      if (this.selected) {
        this.selected.selected = false
      }
      this.selected = target
      this.message = 'instance selected: ' + target.instance.name
      bridge.send('select-instance', target.instance.id)
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
h1
  color #42b983
.app
  width 100%
.header
  padding 10px 20px
  position relative
.status
  color blue
  position absolute
  top 10px
  right 20px
.container
  border-top 1px solid #ccc
  margin-top 10px
  display flex
  .column
    width 50%
    box-sizing border-box
</style>
