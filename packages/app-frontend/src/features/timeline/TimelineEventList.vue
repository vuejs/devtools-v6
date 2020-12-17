<script>
import { useInspectedEvent, useSelectedEvent } from '.'
import Defer from '@front/mixins/defer'
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import TimelineEventListItem from './TimelineEventListItem.vue'

const itemHeight = 34

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

    const {
      inspectedEvent
    } = useInspectedEvent()

    const layer = computed(() => selectedEvent.value.layer)

    // Tabs

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

    // Filter

    const filter = ref('')

    const filteredEvents = computed(() => {
      // Prevent crash on the filteredEvents.length watcher
      if (!selectedEvent.value) {
        return []
      }

      const rawFilter = filter.value.trim()
      if (rawFilter) {
        const reg = new RegExp(rawFilter, 'i')
        return displayedEvents.value.filter(event =>
          (event.title && reg.test(event.title)) ||
          (event.subtitle && reg.test(event.subtitle))
        )
      } else {
        return displayedEvents.value
      }
    })

    // Scrolling

    const scroller = ref()

    const isAtScrollBottom = ref(false)

    function onScroll () {
      const scrollerEl = scroller.value.$el
      isAtScrollBottom.value = scrollerEl.scrollTop + scrollerEl.clientHeight >= scrollerEl.scrollHeight - 100
    }

    watch(scroller, value => {
      if (value) {
        onScroll()
      }
    })

    watch(tabId, () => {
      scrollToInspectedEvent()
    })

    function scrollToInspectedEvent () {
      if (!scroller.value) return

      const scrollerEl = scroller.value.$el

      const index = filteredEvents.value.indexOf(inspectedEvent.value)
      if (index !== -1) {
        // We need to first disable auto bottom scroll
        isAtScrollBottom.value = false
        scrollerEl.scrollTop = itemHeight * (index + 0.5) - (scrollerEl.clientHeight) / 2
      }
    }

    watch(inspectedEvent, () => {
      checkScrollToInspectedEvent()
    })

    function checkScrollToInspectedEvent () {
      if (!scroller.value) return

      const scrollerEl = scroller.value.$el

      const index = filteredEvents.value.indexOf(inspectedEvent.value)
      const minPosition = itemHeight * index
      const maxPosition = minPosition + itemHeight

      if (scrollerEl.scrollTop > minPosition || scrollerEl.scrollTop + scrollerEl.clientHeight < maxPosition) {
        scrollToInspectedEvent()
      }
    }

    // Auto bottom scroll

    function scrollToBottom () {
      if (!scroller.value) return

      const scrollerEl = scroller.value.$el
      scrollerEl.scrollTop = scrollerEl.scrollHeight
    }

    // Important: Watch this after the scroll to inspect event watchers
    watch(() => filteredEvents.value.length, () => {
      if (isAtScrollBottom.value) {
        scrollToBottom()
      }
    })

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
      layer,
      selectedStackedEvents,
      tabId,
      scroller,
      filter,
      filteredEvents,
      itemHeight,
      inspectedEvent,
      inspectEvent,
      selectEvent,
      onScroll
    }
  }
}
</script>

<template>
  <div
    v-if="selectedEvent"
    class="h-full flex flex-col"
  >
    <div class="flex-none flex flex-col items-stretch border-gray-200 dark:border-gray-900 border-b">
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

      <VueInput
        v-model="filter"
        icon-left="search"
        :placeholder="`Filter ${layer.label}`"
        class="search flat"
      />
    </div>

    <RecycleScroller
      ref="scroller"
      :items="filteredEvents"
      :item-size="itemHeight"
      class="flex-1"
      @scroll.native="onScroll()"
    >
      <template #default="{ item: event }">
        <TimelineEventListItem
          :event="event"
          :selected="tabId !== 'nearby' && selectedStackedEvents.includes(event)"
          @inspect="inspectEvent(event)"
          @select="selectEvent(event)"
        />
      </template>
    </RecycleScroller>
  </div>
</template>
