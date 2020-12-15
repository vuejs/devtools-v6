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
      if (value && !value.group && tabId.value === 'group') {
        tabId.value = 'nearby'
      }
    })

    const displayedEvents = computed(() => {
      switch (tabId.value) {
        case 'group':
          return selectedGroupEvents.value
        case 'all':
          return selectedEvent.value ? selectedEvent.value.layer.events : []
        case 'nearby':
        default:
          return selectedStackedEvents.value
      }
    })

    const {
      inspectedEvent
    } = useInspectedEvent()

    const scroller = ref()

    watch(tabId, () => {
      scrollToInspectedEvent()
    })

    function scrollToInspectedEvent () {
      if (!scroller.value) return

      const index = displayedEvents.value.indexOf(inspectedEvent.value)
      if (index !== -1) {
        scroller.value.scrollTop = 39 * (index + 0.5) - (scroller.value.clientHeight) / 2 + 81
      }
    }

    watch(inspectedEvent, () => {
      checkScrollToInspectedEvent()
    })

    function checkScrollToInspectedEvent () {
      if (!scroller.value) return

      const index = displayedEvents.value.indexOf(inspectedEvent.value)
      const minPosition = 39 * index + 81
      const maxPosition = minPosition + 39

      if (scroller.value.scrollTop > minPosition || scroller.value.scrollTop + scroller.value.clientHeight < maxPosition) {
        scrollToInspectedEvent()
      }
    }

    // List interactions

    function inspectEvent (event) {
      inspectedEvent.value = event
    }

    watch(selectedEvent, value => {
      if (!inspectedEvent.value || !displayedEvents.value.includes(inspectedEvent.value)) {
        inspectedEvent.value = value
      }
    })

    function selectEvent (event) {
      if (event.stackParent) {
        selectedEvent.value = event.stackParent
      } else {
        selectedEvent.value = event
      }
    }

    return {
      selectedEvent,
      selectedStackedEvents,
      tabId,
      scroller,
      displayedEvents,
      inspectedEvent,
      inspectEvent,
      selectEvent
    }
  }
}
</script>

<template>
  <div
    v-if="selectedEvent"
    ref="scroller"
    class="h-full overflow-y-auto scroll-smooth"
  >
    <div class="header px-2 flex items-center space-x-2 border-gray-200 dark:border-gray-900 border-b">
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
      </div>
    </div>

    <VueTabs
      :tab-id.sync="tabId"
      class="sticky top-0 bg-white dark:bg-black z-10 border-gray-200 dark:border-gray-900 border-b"
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
      <VueTab
        id="all"
        label="All"
      />
    </VueTabs>

    <TimelineEventListItem
      v-for="(event, index) of displayedEvents"
      :key="index"
      :event="event"
      :selected="tabId !== 'nearby' && selectedStackedEvents.includes(event)"
      @inspect="inspectEvent(event)"
      @select="selectEvent(event)"
    />
  </div>
</template>

<style lang="postcss" scoped>
.header {
  height: 42px;
}

.vue-ui-tabs /deep/ .indicator {
  padding-bottom: 0 !important;
}
</style>
