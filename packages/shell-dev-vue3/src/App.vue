<script>
import Child from './Child.vue'

export default {
  name: 'App',

  components: {
    Child,
  },
}
</script>

<template>
  <h1>Hello from Vue 3</h1>
  <Child question="Life" />
</template>
