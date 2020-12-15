<script>
import { useInspectedEvent, useSelectedEvent } from '.'
import Defer from '@front/mixins/defer'
import { computed, ref, watch } from '@vue/composition-api'
import TimelineEventListItem from './TimelineEventListItem.vue'

export default {
  components: { TimelineEventListItem },
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

    const {
      inspectedEvent
    } = useInspectedEvent()

    function inspectEvent (event) {
      inspectedEvent.value = event
    }

    watch(selectedEvent, value => {
      inspectedEvent.value = value
    })

    return {
      selectedEvent,
      selectedStackedEvents,
      tabId,
      displayedEvents,
      inspectedEvent,
      inspectEvent
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

    <TimelineEventListItem
      v-for="(event, index) of displayedEvents"
      :key="index"
      :event="event"
      :selected="tabId === 'group' && selectedStackedEvents.some(e => e.time === event.time)"
      @inspect="inspectEvent(event)"
    />
  </div>
</template>
