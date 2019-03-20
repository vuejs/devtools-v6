<template>
  <div id="counter">
    <p>{{ count }}</p>
    <button class="increment" @click="increment">+1</button>
    <button class="decrement" @click="decrement">-1</button>

    <br>

    <button @click="doLotMutations">Do a lot of mutations</button>

    <p>Your counter is {{ $store.getters.isPositive ? 'positive' : 'negative' }}</p>

    <h3>Vuex Module</h3>

    <div>
      <p>foo: {{ foo }}</p>
      <p>twoFoos: {{ twoFoos }}</p>
      <button @click="addBar">Add bar</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

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
    }),

    ...mapState('nested', [
      'foo'
    ]),

    ...mapGetters('nested', [
      'twoFoos'
    ])
  },
  watch: {
    count (value) {
      console.log('%ccount new value', 'font-weight: bold;', value)
    }
  },
  methods: {
    increment () {
      this.$store.commit('INCREMENT', { a: 1, b: { c: 3 }})
    },

    decrement () {
      this.$store.commit('DECREMENT', 2)
    },

    doLotMutations () {
      for (let i = 0; i < 10000; i++) {
        this.increment()
      }
      for (let i = 0; i < 10000; i++) {
        this.decrement()
      }
    },

    ...mapMutations('nested', {
      addBar: 'ADD_BAR'
    })
  }
}
</script>
