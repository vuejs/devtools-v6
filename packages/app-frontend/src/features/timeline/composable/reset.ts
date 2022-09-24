import { onUnmounted } from 'vue'
import { BridgeEvents, getStorage } from '@vue-devtools/shared-utils'
import { getBridge } from '@front/features/bridge'
import {
  selectedEvent,
  inspectedEvent,
  inspectedEventData,
  inspectedEventPendingId,
  layersPerApp,
  vScrollPerApp,
  hoverLayerId,
  timelineIsEmpty,
  screenshots,
  hiddenLayersPerApp,
  startTime,
  endTime,
  minTime,
  maxTime,
  selectedLayer,
} from './store'
import { fetchLayers } from './layers'

type ResetCb = () => void

const resetCbs: ResetCb[] = []

export function resetTimeline (sync = true) {
  selectedLayer.value = null
  selectedEvent.value = null
  inspectedEvent.value = null
  inspectedEventData.value = null
  inspectedEventPendingId.value = null
  layersPerApp.value = {}
  vScrollPerApp.value = {}
  hoverLayerId.value = null
  timelineIsEmpty.value = true
  screenshots.value = []

  resetTime()

  if (sync) {
    getBridge().send(BridgeEvents.TO_BACK_TIMELINE_CLEAR)
  }

  // Layers
  fetchLayers()
  hiddenLayersPerApp.value = getStorage('hidden-layers', {})

  for (const cb of resetCbs) {
    cb()
  }
}

export function resetTime () {
  const now = 0
  minTime.value = startTime.value = now - 1_000_000
  maxTime.value = endTime.value = now
}

export function onTimelineReset (cb: ResetCb) {
  onUnmounted(() => {
    const index = resetCbs.indexOf(cb)
    if (index !== -1) resetCbs.splice(index, 1)
  })

  resetCbs.push(cb)
}
