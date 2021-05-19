import { onUnmounted, computed, watch } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { getBridge } from '@front/features/bridge'
import { formatTime } from '@front/util/format'
import {
  timelineIsEmpty,
  minTime,
  maxTime,
  startTime,
  endTime,
  selectedEvent,
  inspectedEvent,
  inspectedEventData,
  inspectedEventPendingId,
  TimelineEvent,
  Layer,
  selectedLayer
} from './store'
import { resetTime } from './reset'
import { takeScreenshot } from './screenshot'

const STACK_DURATION = 50
const AUTOSCROLL_DURATION = 10000

type AddEventCb = (event: TimelineEvent) => void

const addEventCbs: AddEventCb[] = []

export function onEventAdd (cb: AddEventCb) {
  onUnmounted(() => {
    const index = addEventCbs.indexOf(cb)
    if (index !== -1) addEventCbs.splice(index, 1)
  })

  addEventCbs.push(cb)
}

export function addEvent (appId: number, event: TimelineEvent, layer: Layer) {
  if (timelineIsEmpty.value) {
    timelineIsEmpty.value = false
    resetTime()
  }

  event.layer = layer
  event.appId = appId
  layer.events.push(event)
  event.stackedEvents = []

  const wasStacked = stackEvent(event)

  // Groups
  if (event.groupId != null) {
    let group = layer.groupsMap[event.groupId]
    if (!group) {
      group = layer.groupsMap[event.groupId] = {
        id: event.groupId,
        events: [],
        firstEvent: event,
        lastEvent: event,
        y: 0,
        duration: 0
      }
      layer.groups.push(group)
    }
    group.events.push(event)
    group.lastEvent = event
    group.duration = event.time - group.firstEvent.time
    event.group = group
  }

  // Update scrollbar
  if (!wasStacked) {
    const scrollTime = event.time + 100
    if (scrollTime > maxTime.value) {
      if (endTime.value === maxTime.value) {
        if (startTime.value !== minTime.value) {
          // Autoscroll
          startTime.value = scrollTime - (endTime.value - startTime.value)
        } else if (endTime.value - startTime.value > AUTOSCROLL_DURATION) {
          // Autoscroll
          startTime.value = scrollTime - AUTOSCROLL_DURATION
        }
        endTime.value = scrollTime
      }
      maxTime.value = scrollTime
    }

    takeScreenshot(event)
  } else {
    if (event.stackParent.screenshot) {
      event.stackParent.screenshot.events.push(event)
    }
  }

  for (const cb of addEventCbs) {
    cb(event)
  }
}

function stackEvent (event: TimelineEvent) {
  const roundedTime = Math.round(event.time / STACK_DURATION)
  const wasStacked = _stackEvent(event, roundedTime)
  if (!wasStacked) {
    event.layer.eventTimeMap[roundedTime] = event
    event.layer.displayedEvents.push(event)
    event.stackedEvents = [event]
  }
  return wasStacked
}

function _stackEvent (event: TimelineEvent, roundedTime: number) {
  const existingEvent = event.layer.eventTimeMap[roundedTime]
  if (existingEvent && existingEvent.groupId === event.groupId) {
    existingEvent.stackedEvents.push(event)
    event.stackParent = existingEvent
    return true
  }
  return false
}

export function useSelectedEvent () {
  return {
    selectedEvent: computed(() => selectedEvent.value),
    selectedStackedEvents: computed(() => selectedEvent.value?.stackedEvents ?? []),
    selectedGroupEvents: computed(() => selectedEvent.value?.group?.events ?? [])
  }
}

export function useInspectedEvent () {
  watch(inspectedEvent, event => {
    if (event) {
      loadEvent(event.id)
      event.layer.lastInspectedEvent = event
    }
  }, {
    immediate: true
  })

  return {
    inspectedEvent,
    inspectedEventState: computed(() => inspectedEventData.value),
    time: computed(() => formatTime(inspectedEvent.value.time, 'ms')),
    loading: computed(() => !!inspectedEventPendingId.value)
  }
}

function loadEvent (id: TimelineEvent['id']) {
  if (!id || inspectedEventPendingId.value === id) return
  inspectedEventPendingId.value = id
  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, { id })
}

export function selectEvent (event: TimelineEvent) {
  if (event.stackParent) event = event.stackParent
  selectedEvent.value = inspectedEvent.value = event
  selectedLayer.value = event.layer
}
