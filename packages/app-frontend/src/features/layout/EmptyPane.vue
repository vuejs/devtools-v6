<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    icon: {
      type: String,
      default: null
    }
  }
})
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center space-y-6 p-12 text-gray-400 dark:text-gray-600 text-center">
    <VueIcon
      v-if="icon"
      :icon="icon"
      class="w-10 h-10 opacity-50"
    />
    <div><slot /></div>
  </div>
</template>
