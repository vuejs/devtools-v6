<style lang="stylus" src="./global.styl"></style>

<template>
<div class="app">
  <div class="header">
    <h1>Vue Devtools</h1>
    <p class="status">{{message}}</p>
    <div class="buttons">
      <button @click="forceUpdate">Force Update</button>
      <button @click="toggleLiveMode">Toggle Live Mode</button>
    </div>
  </div>
  <div class="container">
    <tree class="column" :instances="instances"></tree>
    <inspector class="column" :target="selectedDetails"></inspector>
  </div>
</div>
</template>

<script>
import Tree from './Tree.vue'
import Inspector from './Inspector.vue'

export default {
  components: { Tree, Inspector },
  data() {
    return {
      message: 'Looking for Vue.js...',
      selected: null,
      selectedDetails: {},
      instances: []
    }
  },
  events: {
    selected: function (target) {
      if (this.selected) {
        this.selected.selected = false
      }
      this.selected = target
      this.message = 'instance selected: ' + target.instance.name
      this.bridge.send({
        event: 'select-instance',
        payload: target.instance.id
      })
    }
  },
  methods: {
    init (bridge) {
      this.bridge = bridge
      bridge.on('message', message => {
        this.message = message
      })
      bridge.on('flush', instances => {
        this.instances = instances
      })
      bridge.on('instance-details', details => {
        this.selectedDetails = details
      })
    },
    forceUpdate () {

    },
    toggleLiveMode () {

    }
  }
}
</script>

<style lang="stylus" scoped>
h1
  color #42b983
.status
  color blue
.header
  padding 10px 20px
.container
  border-top 1px solid #ccc
  margin-top 10px
  display flex
  .column
    width 50%
    box-sizing border-box
</style>
