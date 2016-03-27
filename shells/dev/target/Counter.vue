<template>
  <div id="counter">
    <p>{{ count }}</p>
    <button class="increment" @click="increment">+1</button>
    <button class="decrement" @click="decrement">-1</button>
  </div>
</template>

<script>
export default {
  vuex: {
    getters: {
      count: state => state.count
    },
    actions: {
      increment: ({ dispatch }) => dispatch('INCREMENT', { a: 1, b: { c: 3 }}),
      decrement: ({ dispatch }) => dispatch('DECREMENT', 2)
    }
  },
  computed: {
    test () { return 1 }
  },
  created () {
    // simulate firebase binding
    this.$firebaseRefs = {
      hello: 'world'
    }
  }
}
</script>
