<script>
import { ref } from 'vue'
import Nested from './Nested.vue'

export default {
  components: {
    Nested
  },

  setup () {
    const count = ref(2)

    return {
      count
    }
  }
}
</script>

<template>
  <button @click="count++">
    +
  </button>
  <button @click="count--">
    -
  </button>

  <Nested
    key="foobar"
    :count="count"
  />
</template>
