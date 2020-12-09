<script>
import StateInspector from '../inspector/StateInspector.vue'
import { useSelectedEvent } from '.'
import Defer from '@front/mixins/defer'
import { computed, ref, watch } from '@vue/composition-api'

export default {
  components: {
    StateInspector
  },

  mixins: [
    Defer()
  ],

  setup () {
    const {
      selectedEvent,
      selectedStackedEvents,
      selectedGroupEvents
    } = useSelectedEvent()

    const tabId = ref('nearby')

    watch(selectedEvent, value => {
      if (value && !value.group) {
        tabId.value = 'nearby'
      }
    })

    const displayedEvents = computed(() => tabId.value === 'nearby' ? selectedStackedEvents.value : selectedGroupEvents.value)

    // Expand/Collapse

    const inspectors = ref(null)

    function setExpandToAll (isExpanded) {
      inspectors.value.forEach(inspector => {
        inspector.setExpandToAll(isExpanded)
      })
    }

    return {
      selectedEvent,
      selectedStackedEvents,
      tabId,
      displayedEvents,
      inspectors,
      setExpandToAll
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
          {{ selectedStackedEvents.length }} selected event{{ selectedStackedEvents.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <VueTabs
      v-if="selectedEvent.group && selectedEvent.group.events.length"
      :tab-id.sync="tabId"
      group-class="accent extend"
      tab-class="flat"
    >
      <VueTab
        id="nearby"
        :label="selectedStackedEvents.length > 1 ? 'Nearby' : 'Selected'"
      />
      <VueTab
        v-if="selectedEvent.group"
        id="group"
        label="Group"
      />
    </VueTabs>

    <template v-for="(event, index) of displayedEvents">
      <StateInspector
        v-if="defer(index + 1)"
        :key="index"
        ref="inspectors"
        class="border-gray-200 dark:border-gray-900 border-b"
        :state="{
          data: event.data
        }"
        :data-event="event"
        @expand-all="setExpandToAll(true)"
        @collapse-all="setExpandToAll(false)"
      >
        <template #key>
          <div class="flex items-center space-x-2 leading-none -mr-2">
            <span class="flex-1">
              {{ event.title || 'Event' }}
            </span>

            <span
              v-if="tabId === 'group' && selectedStackedEvents.find(e => e.time === event.time)"
              class="flex-none text-2xs p-1 rounded-full bg-green-100 dark:bg-green-900 text-green-500 border border-green-200 dark:border-green-800"
            >
              selected
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
