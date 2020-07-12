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
      }
    })

    return {
      answer,
      doubleAnswer,
      reactiveObject
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
    }
  }
}
</script>

<template>
  <div>
    Child: {{ answer }} x2: {{ doubleAnswer }}
    <button @click="answer *= 2">
      double it
    </button>
  </div>
</template>
