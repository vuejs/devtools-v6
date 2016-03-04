<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script>
export default {
  vuex: {
    state: {
      count: state => state.count
    },
    actions: {
      increment: ({ dispatch }) => dispatch('INCREMENT', { a: 1, b: { c: 3 }}),
      decrement: ({ dispatch }) => dispatch('DECREMENT', 2)
    }
  }
}
</script>
