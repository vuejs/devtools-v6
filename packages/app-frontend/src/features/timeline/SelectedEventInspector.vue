<script>
import StateInspector from '../inspector/StateInspector.vue'
import { useSelectedEvent } from '.'
import Defer from '@front/mixins/defer'

export default {
  components: {
    StateInspector
  },

  mixins: [
    Defer()
  ],

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
    class="h-full overflow-y-auto"
  >
    <div class="p-2 flex items-center space-x-2">
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
          {{ selectedStackedEvents.length }} event{{ selectedStackedEvents.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <template v-for="(event, index) of selectedStackedEvents">
      <StateInspector
        v-if="defer(index + 1)"
        :key="index"
        class="border-gray-200 dark:border-gray-900 border-t"
        :state="{
          [`Event - ${event.time}`]: event.data
        }"
      />
    </template>
  </div>
</template>
