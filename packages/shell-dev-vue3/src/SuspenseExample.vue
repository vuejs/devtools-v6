<script>
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

<template>
  <Suspense>
    <template #fallback>
      <Loading />
    </template>
    <AsyncSetup />
  </Suspense>
</template>
