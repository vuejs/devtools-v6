<script>
import { useError } from '.'

export default {
  setup () {
    const {
      error,
      clearError
    } = useError()

    return {
      error,
      clearError
    }
  }
}
</script>

<template>
  <div
    v-if="error"
    class="absolute bottom-0 left-0 right-0 flex justify-center pb-4"
  >
    <div class="flex items-center bg-red-200 text-red-600 dark:bg-red-800 dark:text-red-400 px-4 py-2 rounded space-x-4 shadow-md">
      <VueIcon
        :icon="error.icon || 'error'"
        class="w-6 h-6"
      />
      <div>
        {{ error.message }}
      </div>
      <VueButton
        class="icon-button flat danger"
        icon-left="close"
        @click="clearError()"
      />
    </div>
  </div>
</template>
