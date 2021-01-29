<template>
  <BeAsync />
</template>

<script>
import { defineAsyncComponent } from 'vue'

const BeAsync = defineAsyncComponent(() => new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      name: 'BeAsync',
      data () {
        return {
          message: 'I am async!'
        }
      },
      template: '<div>{{ message }}</div>'
    })
  }, 500)
}))

export default {
  components: {
    BeAsync
  }
}
</script>
