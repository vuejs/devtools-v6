<template>
<div class="app">
  <h1>Vue Devtools</h1>
  <p class="status">{{message}}</p>
  <div class="buttons">
    <a @click="forceUpdate">Force Update</a>
    <a @click="toggleLiveMode">Toggle Live Mode</a>
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

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>

<style lang="stylus" scoped>
h1
  color red
.status
  color blue
.container
  border-top 1px solid #ccc
  margin-top 10px
  display flex
  .column
    width 50%
    padding 10px 20px
</style>
