<script>
import { ref, computed } from 'vue'

export default {
  name: 'Child',

  setup () {
    const answer = ref(42)

    const doubleAnswer = computed(() => answer.value * 2)

    return {
      answer,
      doubleAnswer
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
  </div>
</template>
