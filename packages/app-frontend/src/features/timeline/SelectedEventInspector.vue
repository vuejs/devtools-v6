<script>
import StateInspector from '../inspector/StateInspector.vue'
import { useSelectedEvent } from '.'

export default {
  components: {
    StateInspector
  },

  setup () {
    return {
      ...useSelectedEvent()
    }
  }
}
</script>

<template>
  <div
    v-if="selectedEvent"
    class="h-full flex flex-col"
  >
    <div class="p-2 border-gray-200 dark:border-gray-800 border-b flex items-center space-x-2">
      <div
        class="w-3 h-3 rounded-full mx-2 flex-none"
        :style="{
          backgroundColor: `#${selectedEvent.layer.color.toString(16)}`
        }"
      />
      <div class="leading-tight flex-1 truncate">
        <div class="text-sm">
          {{ selectedEvent.layer.label }}
        </div>

        <div class="text-xs opacity-75">
          {{ selectedEventTime }}
        </div>
      </div>
    </div>

    <StateInspector
      :state="{
        info: selectedEventData
      }"
      class="flex-1 overflow-y-auto"
    />
  </div>
</template>
