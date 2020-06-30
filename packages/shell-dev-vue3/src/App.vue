<script>
import Child from './Child.vue'
import NestedMore from './NestedMore.vue'

export default {
  name: 'MyApp',

  components: {
    Child,
    NestedMore
  }
}
</script>

<template>
  <h1>Hello from Vue 3</h1>
  <Child question="Life" />
  <NestedMore />
</template>
