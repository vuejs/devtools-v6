<script>
import { formatTime } from '@front/util/format'
import { computed } from '@vue/composition-api'
import { useInspectedEvent } from '.'
export default {
  props: {
    event: {
      type: Object,
      required: true
    },

    selected: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const time = computed(() => formatTime(props.event.time))

    const {
      inspectedEvent
    } = useInspectedEvent()

    const isInspected = computed(() => inspectedEvent.value === props.event)

    return {
      time,
      isInspected
    }
  }
}
</script>

<template>
  <div
    class="event border-gray-200 dark:border-gray-900 border-b flex items-center space-x-2 px-2 text-xs cursor-pointer select-none"
    :class="{
      'inspected bg-green-500 text-white': isInspected,
      'hover:bg-blue-100 dark-hover:bg-blue-900 text-gray-800 dark:text-gray-200': !isInspected
    }"
    @click="$emit('inspect')"
    @dblclick="$emit('select')"
  >
    <span class="flex-1 font-mono truncate">
      <span
        class="font-medium"
        :class="{
          'text-purple-600 dark:text-purple-400': !isInspected,
        }"
      >
        {{ event.title || 'Event' }}
      </span>

      <span
        v-if="event.subtitle"
        class="opacity-75"
        v-html="event.subtitle"
      />
    </span>

    <span
      v-if="selected"
      class="flex-none text-2xs px-1 py-0.5 leading-none rounded-full text-green-500 border"
      :class="{
        'bg-white border-transparent': isInspected,
        'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800': !isInspected
      }"
    >
      selected
    </span>

    <span class="event-time flex-none text-2xs font-mono opacity-50">
      {{ time }}
    </span>

    <!-- <span class="event-time flex-none flex items-center space-x-0.5 text-2xs font-mono p-1 rounded-full border border-gray-200 dark:border-gray-800">
      <VueIcon
        icon="schedule"
        class="w-3 h-3 opacity-50"
      />
      <span>{{ time }}</span>
    </span> -->
  </div>
</template>

<style lang="postcss" scoped>
.event {
  height: 39px;
}
</style>
