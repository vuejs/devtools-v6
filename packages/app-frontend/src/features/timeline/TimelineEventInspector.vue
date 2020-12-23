<script>
import StateInspector from '../inspector/StateInspector.vue'

import { computed } from '@vue/composition-api'
import { useInspectedEvent, useSelectedEvent } from '.'

export default {
  components: {
    StateInspector
  },
  setup () {
    const {
      inspectedEvent,
      inspectedEventState,
      time,
      loading
    } = useInspectedEvent()

    const {
      selectedStackedEvents
    } = useSelectedEvent()

    const isSelected = computed(() => selectedStackedEvents.value.includes(inspectedEvent.value))

    return {
      inspectedEvent,
      inspectedEventState,
      time,
      loading,
      isSelected
    }
  }
}
</script>

<template>
  <div
    v-if="inspectedEventState"
    class="flex flex-col h-full"
  >
    <div class="header flex-none flex items-center border-b border-gray-200 dark:border-gray-900 p-2 pl-3 text-bluegray-900 dark:text-bluegray-100 space-x-2">
      <div
        class="flex-none w-2 h-2 rounded-full border"
        :style="{
          borderColor: `#${inspectedEvent.layer.color.toString(16)}`,
          ... isSelected ? {} : {
            backgroundColor: `#${inspectedEvent.layer.color.toString(16)}`
          }
        }"
      />

      <span class="flex-1 font-mono truncate text-xs">
        <span class="font-medium">
          {{ inspectedEvent.title || 'Event' }}
        </span>

        <VueIcon
          v-if="inspectedEvent.logType === 'error'"
          icon="error"
          class="w-4 h-4 text-red-500"
        />

        <VueIcon
          v-if="inspectedEvent.logType === 'warning'"
          icon="warning"
          class="w-4 h-4 text-yellow-500"
        />

        <span
          v-if="inspectedEvent.subtitle"
          class="opacity-75"
          v-html="inspectedEvent.subtitle"
        />
      </span>

      <span class="event-time flex-none flex items-center space-x-0.5 text-2xs font-mono px-2 py-1 rounded-full border border-gray-100 dark:border-gray-900 text-bluegray-700 dark:text-bluegray-300">
        <VueIcon
          icon="schedule"
          class="w-3 h-3 opacity-50"
        />
        <span>{{ time }}</span>
      </span>
    </div>

    <VueLoadingBar
      v-if="loading"
      unknown
      class="primary ghost"
    />

    <StateInspector
      :state="{
        'event info': inspectedEventState
      }"
      class="flex-1 overflow-x-auto"
      :class="{
        'grayscale': loading
      }"
    />
  </div>

  <div
    v-else-if="loading"
    class="relative h-full"
  >
    <VueLoadingIndicator class="primary overlay big" />
  </div>
</template>
