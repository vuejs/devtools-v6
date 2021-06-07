<script>
import { ref, computed, reactive } from 'vue'

export default {
  name: 'Child',

  setup () {
    const answer = ref(42)

    const doubleAnswer = computed(() => answer.value * 2)

    const reactiveObject = reactive({
      foo: 'bar',
      hello: {
        world: 1
      },
      nil: undefined
    })

    function myMethodFromSetup () {
      console.log('foobar')
    }

    const internalComputed = ref(0)

    const writableComputed = computed({
      get: () => internalComputed.value,
      set: value => {
        internalComputed.value = value
      }
    })

    return {
      answer,
      doubleAnswer,
      reactiveObject,
      myMethodFromSetup,
      writableComputed
    }
  },

  data () {
    return {
      classicAnswer: 42
    }
  },

  computed: {
    classicDoubleAnswer () {
      return this.classicAnswer * 2
    },

    classicEditableComputed: {
      get () {
        return this.classicAnswer
      },
      set (value) {
        this.classicAnswer = value
      }
    }
  },

  mounted () {
    this.$emit('child mounted', 'bar')
  }
}
</script>

<template>
  <div>
    Child: {{ answer }} x2: {{ doubleAnswer }}
    <button @click="answer *= 2">
      double it
    </button>
    <button @click="answer--">
      minus one
    </button>
  </div>
</template>
