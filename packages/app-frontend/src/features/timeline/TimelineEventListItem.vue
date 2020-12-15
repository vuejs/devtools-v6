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
    class="event border-gray-200 dark:border-gray-900 border-b p-2 text-xs cursor-pointer select-none"
    :class="{
      'inspected bg-green-500 text-white': isInspected,
      'hover:bg-blue-100 dark-hover:bg-blue-900 text-gray-800 dark:text-gray-200': !isInspected
    }"
    @click="$emit('inspect')"
    @dblclick="$emit('select')"
  >
    <div class="flex items-center space-x-2 leading-none">
      <span class="flex-1 font-mono">
        {{ event.title || 'Event' }}

        <span
          v-if="event.subtitle"
          class="opacity-50"
          v-html="event.subtitle"
        />
      </span>

      <span
        v-if="selected"
        class="flex-none text-2xs p-1 rounded-full bg-green-100 dark:bg-green-900 text-green-500 border border-green-200 dark:border-green-800"
      >
        selected
      </span>

      <span class="event-time flex-none flex items-center space-x-0.5 text-2xs font-mono p-1 rounded-full border border-gray-200 dark:border-gray-800">
        <VueIcon
          icon="schedule"
          class="w-3 h-3 opacity-50"
        />
        <span>{{ time }}</span>
      </span>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.event {
  &:hover,
  &.inspected {
    .event-time {
      @apply border-transparent;
    }
  }
}
</style>
