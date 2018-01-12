<template>
  <div id="date">
    <p>Date: {{ date.toString() }} - Hours: {{ hours }} - Prototype: {{ date | prototypeString }}</p>

    <p>
      <button @click="updateDate">Update Date</button>
    </p>

    <hr>

    <TestComponent ref="component" />

    <p>
      <button @click="sendComponent">Vuex mutation</button>
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    TestComponent: {
      data: () => ({ foo: '42' }),
      props: { bar: { default: 'hey' }},
      render: h => h('div', '<TestComponent />')
    }
  },
  data () {
    return {
      localDate: new Date(),
      testComponent: null
    }
  },
  computed: {
    ...mapState(['date']),
    ...mapGetters(['hours'])
  },
  mounted () {
    this.testComponent = this.$refs.component
  },
  methods: {
    ...mapMutations({
      updateDate: 'UPDATE_DATE'
    }),
    sendComponent () {
      this.$store.commit('TEST_COMPONENT', this.testComponent)
    }
  },
  filters: {
    prototypeString: val => Object.prototype.toString.call(val)
  }
}
</script>
