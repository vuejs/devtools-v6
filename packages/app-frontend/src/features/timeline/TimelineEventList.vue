<script lang="ts">
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import TimelineEventListItem from './TimelineEventListItem.vue'

import { computed, ref, watch, defineComponent } from '@vue/composition-api'
import { getStorage, setStorage } from '@vue-devtools/shared-utils'
import Defer from '@front/mixins/defer'
import { useRoute, useRouter } from '@front/util/router'
import { onKeyDown } from '@front/util/keyboard'
import { useInspectedEvent, useSelectedEvent, selectEvent, useLayers } from './composable'

const itemHeight = 34

const STORAGE_TAB_ID = 'timeline.event-list.tab-id'

export default defineComponent({
  components: {
    TimelineEventListItem,
    EmptyPane
  },

  mixins: [
    Defer()
  ],

  setup () {
    const route = useRoute()
    const router = useRouter()

    const {
      selectedLayer
    } = useLayers()

    const {
      selectedEvent,
      selectedGroupEvents
    } = useSelectedEvent()

    const {
      inspectedEvent
    } = useInspectedEvent()

    // Tabs

    const tabId = computed({
      get: () => route.value.query.tabId,
      set: value => {
        setStorage(STORAGE_TAB_ID, value)
        router.push({
          query: {
            ...route.value.query,
            tabId: value
          }
        })
      }
    })

    if (!route.value.query.tabId) {
      tabId.value = getStorage(STORAGE_TAB_ID, 'all')
    }

    watch(selectedEvent, value => {
      if (value && !value.group && tabId.value === 'group') {
        tabId.value = 'all'
      }
    })

    const displayedEvents = computed(() => {
      switch (tabId.value) {
        case 'group':
          return selectedGroupEvents.value
        case 'all':
        default:
          return selectedLayer.value?.events ?? []
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
    }, { immediate: true })

    watch(tabId, () => {
      scrollToInspectedEvent()
    }, { immediate: true })

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
    }, { immediate: true })

    function checkScrollToInspectedEvent () {
      requestAnimationFrame(() => {
        if (!scroller.value) return

        const scrollerEl = scroller.value.$el

        const index = filteredEvents.value.indexOf(inspectedEvent.value)
        const minPosition = itemHeight * index
        const maxPosition = minPosition + itemHeight

        if (scrollerEl.scrollTop > minPosition || scrollerEl.scrollTop + scrollerEl.clientHeight < maxPosition) {
          scrollToInspectedEvent()
        }
      })
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
    }, { immediate: true })

    // List interactions

    function inspectEvent (event) {
      inspectedEvent.value = event
    }

    // Keyboard

    onKeyDown(event => {
      const index = filteredEvents.value.indexOf(inspectedEvent.value)
      if (event.key === 'ArrowDown') {
        if (index < filteredEvents.value.length - 1) {
          inspectEvent(filteredEvents.value[index + 1])
        }
      } else if (event.key === 'ArrowUp') {
        if (index > 0) {
          inspectEvent(filteredEvents.value[index - 1])
        }
      } else if (event.key === 'Enter' || event.key === ' ') {
        if (inspectedEvent.value) {
          selectEvent(inspectedEvent.value)
        }
      }
    })

    return {
      selectedEvent,
      selectedLayer,
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
})
</script>

<template>
  <div
    v-if="selectedEvent && selectedLayer"
    class="h-full flex flex-col"
  >
    <div class="flex-none flex flex-col items-stretch border-gray-200 dark:border-gray-800 border-b">
      <VueGroup
        v-if="selectedEvent.group"
        v-model="tabId"
        indicator
        class="accent extend border-gray-200 dark:border-gray-800 border-b"
      >
        <VueGroupButton
          value="all"
          label="All"
          class="flat"
        />
        <VueGroupButton
          value="group"
          label="Group"
          class="flat"
        />
      </VueGroup>

      <VueInput
        v-model="filter"
        icon-left="search"
        :placeholder="`Filter ${selectedLayer.label}`"
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
          :selected="selectedEvent === event"
          @inspect="inspectEvent(event)"
          @select="selectEvent(event)"
        />
      </template>
    </RecycleScroller>
  </div>

  <EmptyPane
    v-else
    :icon="!selectedLayer ? 'layers' : 'inbox'"
  >
    <template v-if="!selectedLayer">
      Select a layer to get started
    </template>
    <template v-else>
      No events
    </template>
  </EmptyPane>
</template>
