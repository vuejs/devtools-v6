<script>
import Child from './Child.vue'
import NestedMore from './NestedMore.vue'
import NativeTypes from './NativeTypes.vue'

export default {
  name: 'MyApp',

  components: {
    Child,
    NestedMore,
    NativeTypes
  }
}
</script>

<template>
  <h1>Hello from Vue 3</h1>
  <Child question="Life" />
  <NestedMore />
  <NativeTypes />
</template>
