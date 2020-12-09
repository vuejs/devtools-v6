<script>
import StateInspector from '../inspector/StateInspector.vue'
import { useSelectedEvent } from '.'
import Defer from '@front/mixins/defer'
import DataField from '../inspector/DataField.vue'

export default {
  components: {
    StateInspector,
    DataField
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
    <div class="p-2 flex items-center space-x-2 border-gray-200 dark:border-gray-900 border-b">
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
        class="border-gray-200 dark:border-gray-900 border-b"
        :state="{
          data: event.data
        }"
      >
        <template #key>
          <div class="flex items-center space-x-2 leading-none -mr-2">
            <span class="flex-1">
              {{ event.title || 'Event' }}
            </span>
            <span class="event-time flex-none flex items-center space-x-0.5 text-2xs font-mono p-1 rounded-full border border-gray-200 dark:border-gray-800">
              <VueIcon
                icon="schedule"
                class="w-3 h-3 opacity-50"
              />
              <span>{{ event.time }}</span>
            </span>
          </div>
        </template>
      </StateInspector>
    </template>
  </div>
</template>

<style lang="postcss" scoped>
.selectable-item:hover {
  .event-time {
    @apply border-transparent;
  }
}
</style>
