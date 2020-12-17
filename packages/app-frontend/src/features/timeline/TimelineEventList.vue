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
        scroller.value.scrollTop = 39 * (index + 0.5) - (scroller.value.clientHeight) / 2
      }
    }

    watch(inspectedEvent, () => {
      checkScrollToInspectedEvent()
    })

    function checkScrollToInspectedEvent () {
      if (!scroller.value) return

      const index = displayedEvents.value.indexOf(inspectedEvent.value)
      const minPosition = 39 * index
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
      if (!inspectedEvent.value || !selectedStackedEvents.value.includes(inspectedEvent.value)) {
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
    class="h-full flex flex-col"
  >
    <div class="flex-none border-gray-200 dark:border-gray-900 border-b">
      <VueTabs
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
        <VueTab
          id="all"
          label="All"
        />
      </VueTabs>
    </div>

    <div
      ref="scroller"
      class="flex-1 overflow-y-auto scroll-smooth"
    >
      <TimelineEventListItem
        v-for="(event, index) of displayedEvents"
        :key="index"
        :event="event"
        :selected="tabId !== 'nearby' && selectedStackedEvents.includes(event)"
        @inspect="inspectEvent(event)"
        @select="selectEvent(event)"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.vue-ui-tabs /deep/ .indicator {
  padding-bottom: 0 !important;
}
</style>
