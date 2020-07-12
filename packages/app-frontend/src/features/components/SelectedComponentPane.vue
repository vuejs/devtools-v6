<script>
import StateInspector from '@front/features/inspector/StateInspector.vue'
import { useSelectedComponent } from '.'

export default {
  components: {
    StateInspector
  },

  setup () {
    const {
      data,
      state
    } = useSelectedComponent()

    return {
      data,
      state
    }
  }
}
</script>

<template>
  <div v-if="data">
    <div class="px-2 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center">
      <div class="flex items-baseline">
        <span class="text-gray-500">&lt;</span>
        <span class="text-green-500">
          {{ data.name }}
        </span>
        <span class="text-gray-500">&gt;</span>
      </div>
    </div>

    <StateInspector
      :state="state"
    />
  </div>
</template>
