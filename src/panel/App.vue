<template>
<div class="app">
  <h1>Vue Devtools</h1>
  <p>{{message}}</p>
  <instance v-for="i in instances" :instance="i"></instance>
</div>
</template>

<script>
import Instance from './Instance.vue'

export default {
  components: { Instance },
  data() {
    return {
      message: 'Looking for Vue.js...',
      instances: [{ name: 'hello' }]
    }
  }
}
</script>

<style scoped>
h1 {
  color: red;
}
</style>
