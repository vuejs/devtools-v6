<script lang="ts">
import StateInspector from '@front/features/inspector/StateInspector.vue'
import EmptyPane from '@front/features/layout/EmptyPane.vue'

import { computed, defineComponent } from '@vue/composition-api'
import { useDarkMode } from '@front/util/theme'
import { toStrHex, dimColor, boostColor } from '@front/util/color'
import { useInspectedEvent, useSelectedEvent } from './composable'

export default defineComponent({
  components: {
    StateInspector,
    EmptyPane
  },

  setup () {
    const {
      inspectedEvent,
      inspectedEventState,
      time,
      loading
    } = useInspectedEvent()

    const {
      selectedEvent
    } = useSelectedEvent()

    const isSelected = computed(() => selectedEvent.value === inspectedEvent.value)

    const { darkMode } = useDarkMode()

    const color = computed(() => toStrHex(inspectedEvent.value?.layer.color))
    const dimmedColor = computed(() => toStrHex(dimColor(inspectedEvent.value?.layer.color, darkMode.value)))
    const boostedColor = computed(() => toStrHex(boostColor(inspectedEvent.value?.layer.color, darkMode.value)))

    return {
      inspectedEvent,
      inspectedEventState,
      time,
      loading,
      isSelected,
      color,
      dimmedColor,
      boostedColor
    }
  }
})
</script>

<template>
  <div
    v-if="inspectedEvent && inspectedEventState"
    class="flex flex-col h-full"
  >
    <div class="header flex-none flex items-center border-b border-gray-200 dark:border-gray-800 p-2 pl-3 text-bluegray-900 dark:text-bluegray-100 space-x-2">
      <div
        class="flex-none w-2.5 h-2.5 rounded-full border-2"
        :style="{
          borderColor: `#${isSelected ? boostedColor : color}`,
          backgroundColor: `#${isSelected ? dimmedColor : color}`
        }"
      />

      <span class="flex-1 font-mono truncate text-xs">
        <span
          class="font-medium"
          :style="{
            color: `#${boostedColor}`
          }"
        >
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
        'event info': inspectedEventState,
        ...inspectedEvent.group ? {
          'group info': {
            events: inspectedEvent.group.events.length,
            duration: {
              _custom: {
                value: inspectedEvent.group.duration,
                display: `${inspectedEvent.group.duration} ms`
              }
            }
          }
        } : {}
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

  <EmptyPane
    v-else
    icon="subject"
  >
    Select an event to display details
  </EmptyPane>
</template>
