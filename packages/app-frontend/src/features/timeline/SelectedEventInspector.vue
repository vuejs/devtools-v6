<script>
import StateInspector from '../inspector/StateInspector.vue'

import { useInspectedEvent } from '.'

export default {
  components: {
    StateInspector
  },
  setup () {
    return {
      ...useInspectedEvent()
    }
  }
}
</script>

<template>
  <div
    v-if="inspectedEventState"
    class="flex flex-col h-full"
  >
    <div class="header flex-none flex items-center border-b border-gray-200 dark:border-gray-900 px-2 text-bluegray-900 dark:text-bluegray-100">
      <span
        class="flex-1 truncate font-medium text-purple-600 dark:text-purple-400"
      >
        {{ inspectedEvent.title || 'Event' }}
      </span>

      <span class="event-time flex-none flex items-center space-x-0.5 text-2xs font-mono px-2 py-1 rounded-full border border-gray-100 dark:border-gray-900 text-bluegray-700 dark:text-bluegray-300">
        <VueIcon
          icon="schedule"
          class="w-3 h-3 opacity-50"
        />
        <span>{{ time }}</span>
      </span>
    </div>

    <StateInspector
      :state="{
        'event info': inspectedEventState
      }"
      class="flex-1 overflow-x-auto"
    />
  </div>
</template>

<style lang="postcss" scoped>
.header {
  height: 42px;
}
</style>
