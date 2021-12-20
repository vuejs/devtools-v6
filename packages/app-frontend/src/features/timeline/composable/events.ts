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
  selectedLayer,
} from './store'
import { resetTime } from './reset'
import { takeScreenshot } from './screenshot'
import { addGroupAroundPosition } from './layers'
import { currentSession, EventGroup } from '.'
import { addNonReactiveProperties } from '@front/util/reactivity'
import { createSessionFromCurrentState, getSessionAtTime, loadSession } from './session'

const AUTOSCROLL_DURATION = 10000
const CREATE_SESSION_DELAY = 10000

type AddEventCb = (event: TimelineEvent) => void

const addEventCbs: AddEventCb[] = []

export function onEventAdd (cb: AddEventCb) {
  onUnmounted(() => {
    const index = addEventCbs.indexOf(cb)
    if (index !== -1) addEventCbs.splice(index, 1)
  })

  addEventCbs.push(cb)
}

export function addEvent (appId: string, eventOptions: TimelineEvent, layer: Layer) {
  // Non-reactive content
  const event = {} as TimelineEvent
  addNonReactiveProperties(event, eventOptions)

  if (layer.eventsMap[event.id]) return

  if (timelineIsEmpty.value) {
    timelineIsEmpty.value = false
    resetTime()
  }

  addNonReactiveProperties(event, {
    layer,
    appId,
  })
  layer.events.push(event)
  layer.eventsMap[event.id] = event

  // Groups
  if (event.groupId != null) {
    let group = layer.groupsMap[event.groupId]
    if (!group) {
      group = layer.groupsMap[event.groupId] = {
        events: [],
        duration: 0,
      } as EventGroup
      addNonReactiveProperties(group, {
        id: event.groupId,
        y: 0,
        firstEvent: event,
        lastEvent: event,
        nonReactiveDuration: 0,
        oldSize: null,
        oldSelected: null,
      })
      layer.groups.push(group)
    }
    addGroupAroundPosition(layer, group, event.time)
    group.events.push(event)
    group.lastEvent = event
    group.duration = group.nonReactiveDuration = event.time - group.firstEvent.time
    event.group = group
  }

  const session = getSessionAtTime(event.time)

  // Min time
  if (!session && minTime.value > event.time) {
    const stick = minTime.value === startTime.value
    minTime.value = event.time - 100
    if (stick) {
      startTime.value = minTime.value
    }
  }

  // Update scrollbar
  const scrollTime = event.time + 100
  if (scrollTime > maxTime.value) {
    const stick = endTime.value === maxTime.value

    if (!session) {
      if (scrollTime > endTime.value + CREATE_SESSION_DELAY) {
        createSessionFromCurrentState()
      }

      if (stick) {
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
  }

  takeScreenshot(event)

  if (session === currentSession.value) {
    for (const cb of addEventCbs) {
      cb(event)
    }
  }
}

export function useSelectedEvent () {
  return {
    selectedEvent: computed(() => selectedEvent.value),
    selectedGroupEvents: computed(() => selectedEvent.value?.group?.events ?? []),
  }
}

export function useInspectedEvent () {
  watch(inspectedEvent, event => {
    if (event) {
      loadEvent(event.id)
      event.layer.lastInspectedEvent = event
    }
  }, {
    immediate: true,
  })

  return {
    inspectedEvent,
    inspectedEventState: computed(() => inspectedEventData.value),
    time: computed(() => formatTime(inspectedEvent.value.time, 'ms')),
    loading: computed(() => inspectedEventPendingId.value != null),
  }
}

function loadEvent (id: TimelineEvent['id']) {
  if (id == null || inspectedEventPendingId.value === id) return
  inspectedEventPendingId.value = id
  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, { id })
}

export function selectEvent (event: TimelineEvent) {
  selectedEvent.value = inspectedEvent.value = event
  selectedLayer.value = event.layer
}
