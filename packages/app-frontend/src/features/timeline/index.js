import { ref, computed } from '@vue/composition-api'
import { BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { formatTime } from '@front/util/format'

const startTime = ref(0)
const endTime = ref(0)
const minTime = ref(0)
const maxTime = ref(0)

const layers = ref([])

const selectedEvent = ref(null)

export function resetTimeline () {
  const now = Date.now()
  startTime.value = now - 1000
  endTime.value = now
  minTime.value = now - 1000
  maxTime.value = now

  layers.value = [
    {
      id: 'mouse',
      label: 'Mouse',
      color: 0xA451AF,
      events: []
    },
    {
      id: 'keyboard',
      label: 'Keyboard',
      color: 0x8151AF,
      events: []
    },
    {
      id: 'component-event',
      label: 'Component events',
      color: 0x41B883,
      events: []
    }
  ]
}

export function useTime () {
  return {
    startTime,
    endTime,
    minTime,
    maxTime
  }
}

export function useLayers () {
  return {
    layers
  }
}

export function useSelectedEvent () {
  return {
    selectedEvent,
    selectedEventData: computed(() => parse(selectedEvent.value.data)),
    selectedEventTime: computed(() => formatTime(selectedEvent.value.time, 'ms'))
  }
}

export function setupTimelineBridgeEvents (bridge) {
  resetTimeline()

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT, ({ layerId, event }) => {
    const layer = layers.value.find(l => l.id === layerId)
    if (!layer) {
      console.error(`Layer ${layerId} not found`)
      return
    }

    // Update scrollbar
    const scrollTime = Math.round(event.time + (maxTime.value - minTime.value) * 0.02)
    if (scrollTime > maxTime.value) {
      if (endTime.value === maxTime.value) {
        if (endTime.value - startTime.value > 10000) {
          // Autoscroll
          const size = endTime.value - startTime.value
          startTime.value = scrollTime - size
        }
        endTime.value = scrollTime
      }
      maxTime.value = scrollTime
    }

    layer.events.push(event)
  })
}
