<template>
  <div id="target">
    <h1>{{msg}}</h1>
    <input v-model="msg">
    <other></other>
  </div>
</template>

<script>
import Other from './Other.vue'

export default {
  components: { Other },
  data() {
    return {
      msg: 'hello'
    }
  }
}
</script>
