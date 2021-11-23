<template>
  <Suspense>
    <template #fallback>
      <Loading />
    </template>
    <AsyncSetup />
  </Suspense>
</template>

<script>
import { h } from 'vue'
import AsyncSetup from './AsyncSetup.vue'

export default {
  components: {
    AsyncSetup,
    Loading: {
      render: () => 'Loading...',
    },
  },
}
</script>
