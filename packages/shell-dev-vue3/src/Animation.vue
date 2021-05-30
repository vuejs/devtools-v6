<script>
import { onUnmounted, reactive, ref } from 'vue'

export default {
  setup () {
    const animate = ref(false)

    const size = reactive({
      width: 10,
      height: 10
    })

    const timer = setInterval(() => {
      if (!animate.value) return
      size.width = Math.round(Math.random() * 100)
      size.height = Math.round(Math.random() * 100)
    }, 1000)

    onUnmounted(() => {
      clearInterval(timer)
    })

    return {
      size,
      animate
    }
  }
}
</script>

<template>
  <div
    class="animation"
    :style="{
      width: `${size.width * 10}px`,
      height: `${size.height * 10}px`,
    }"
    @click="animate = !animate"
  />
</template>

<style lang="postcss" scoped>
.animation {
  transition: all 1s linear;
  background: #42B983;
}
</style>
