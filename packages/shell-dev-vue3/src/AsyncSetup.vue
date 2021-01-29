<template>
  {{ message }}
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue'

export default {
  setup () {
    const vm = getCurrentInstance()
    onMounted(() => {
      console.log('Im alive', vm)
    })

    return new Promise(resolve => {
      setTimeout(() => {
        const message = ref('Async setup')

        resolve({
          message
        })
      }, 2000)
    })
  }
}
</script>
