<template>
<div class="app">
  <h1>Vue Devtools</h1>
  <p class="status">{{message}}</p>
  <div class="buttons">
    <a @click="forceUpdate">Force Update</a>
    <a @click="toggleLiveMode">Toggle Live Mode</a>
  </div>
  <instance v-for="i in instances" track-by="id" :instance="i"></instance>
</div>
</template>

<script>
import Instance from './Instance.vue'

export default {
  components: { Instance },
  data() {
    return {
      message: 'Looking for Vue.js...',
      selectedInstance: null,
      instances: []
    }
  },
  events: {
    selected: function (target) {
      if (this.selectedInstance) {
        this.selectedInstance.selected = false
      }
      this.selectedInstance = target
      this.message = 'instance selected: ' + target.instance.name
    }
  },
  methods: {
    forceUpdate () {

    },
    toggleLiveMode () {

    }
  }
}
</script>

<style scoped>
h1 {
  color: red;
}
.status {
  color: blue;
}
</style>
