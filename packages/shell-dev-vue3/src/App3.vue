<template>
  <h1>App 3</h1>

  <Hello />

  <input v-model="msg">

  <p>{{ msg }}</p>

  <Child />
</template>

<script>
import Hello from './Hello.vue'
import Child from './Child.vue'

export default {
  components: {
    Hello,
    Child,
  },

  data () {
    return {
      count: 0,
      msg: 'Hello',
    }
  },
}
</script>
