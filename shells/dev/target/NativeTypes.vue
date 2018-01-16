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
import CompDef from './Other.vue'

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
      reg: /abc/gi,
      testComponent: null,
      hello: function foo (a, b, c) {},
      hey: function empty () {},
      def: CompDef,
      def2: {
        name: 'MyComponent',
        render () {}
      },
      def3: {
        render () {}
      }
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
