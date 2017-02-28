<template>
  <div class="vuex box">
    <h2>Vuex</h2>
    <p>Component for testing vuex and firebase ref (see <b>Vuex Tab</b> in Dev-Tools).</p>
    <div class="actions">
      <p>Counter: <b>{{ count }}</b></p>
      <button class="increment" @click="increment">Increment</button>
      <button class="decrement" @click="decrement">Decrement</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  created () {
    // simulate firebase binding
    this.$firebaseRefs = {
      hello: 'world'
    }
  },
  computed: {
    test () { return 1 },
    ...mapState({
      count: state => state.count
    })
  },
  methods: {
    increment () {
      this.$store.commit('INCREMENT', { a: 1, b: { c: 3 }})
    },
    decrement () {
      this.$store.commit('DECREMENT', 2)
    }
  }
}
</script>
