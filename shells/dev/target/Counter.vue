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
      increment: ({ dispatch }) => dispatch('INCREMENT'),
      decrement: ({ dispatch }) => dispatch('DECREMENT')
    }
  }
}
</script>
