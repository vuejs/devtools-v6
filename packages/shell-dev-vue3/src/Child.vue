<script>
import { ref } from 'vue'

export default {
  name: 'Child',

  setup () {
    const answer = ref(42)

    return {
      answer
    }
  }
}
</script>

<template>
  <div>
    Child: {{ answer }}
  </div>
</template>
