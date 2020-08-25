import { ref, computed, onUnmounted } from '@vue/composition-api'
import { BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { formatTime } from '@front/util/format'
import { useApps, getApps } from '../apps'

const startTime = ref(0)
const endTime = ref(0)
const minTime = ref(0)
const maxTime = ref(0)

const layersPerApp = ref({})

const selectedEvent = ref(null)

function builtinLayersFactory () {
  return [
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

const resetCbs = []

export function resetTimeline () {
  const now = Date.now()
  startTime.value = now - 1000
  endTime.value = now
  minTime.value = now - 1000
  maxTime.value = now
  layersPerApp.value = {}

  for (const cb of resetCbs) {
    cb()
  }
}

export function onTimelineReset (cb) {
  onUnmounted(() => {
    const index = resetCbs.indexOf(cb)
    if (index !== -1) resetCbs.splice(cb)
  })

  resetCbs.push(cb)
}

export function useTime () {
  return {
    startTime,
    endTime,
    minTime,
    maxTime
  }
}

function getLayers (appId) {
  let layers = layersPerApp.value[appId]
  if (!layers) {
    layers = layersPerApp.value[appId] = builtinLayersFactory()
  }
  return layers
}

export function useLayers () {
  const { currentAppId } = useApps()

  return {
    layers: computed(() => getLayers(currentAppId.value))
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

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT, ({ appId, layerId, event }) => {
    const appIds = appId === 'all' ? getApps().map(app => app.id) : [appId]
    for (const appId of appIds) {
      const layer = getLayers(appId).find(l => l.id === layerId)
      if (!layer) {
        console.error(`Layer ${layerId} not found`)
        return
      }

      // Update scrollbar
      const scrollTime = event.time + 100
      if (scrollTime > maxTime.value) {
        if (endTime.value === maxTime.value) {
          if (endTime.value - startTime.value > 10000 || startTime.value !== 0) {
            // Autoscroll
            const size = endTime.value - startTime.value
            startTime.value = scrollTime - size
          }
          endTime.value = scrollTime
        }
        maxTime.value = scrollTime
      }

      layer.events.push(event)
    }
  })
}
