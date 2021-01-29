<template>
  <Suspense>
    <template #fallback>
      Loading...
    </template>
    <AsyncSetup />
  </Suspense>
</template>

<script>
import AsyncSetup from './AsyncSetup.vue'
export default {
  components: {
    AsyncSetup
  }
}
</script>
