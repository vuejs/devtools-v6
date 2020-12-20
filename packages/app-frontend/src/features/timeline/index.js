import { ref, computed, onUnmounted, watch } from '@vue/composition-api'
import { BridgeEvents, getStorage, parse, setStorage } from '@vue-devtools/shared-utils'
import SharedData from '@utils/shared-data'
import cloneDeep from 'lodash/cloneDeep'
import Vue from 'vue'
import { formatTime } from '@front/util/format'
import { useApps, getApps } from '../apps'
import { getBridge, useBridge } from '../bridge'

const STACK_DURATION = 50
const AUTOSCROLL_DURATION = 10000

const startTime = ref(0)
const endTime = ref(0)
const minTime = ref(0)
const maxTime = ref(0)

const timelineIsEmpty = ref(true)

const cursorTime = ref(null)

const layersPerApp = ref({})
const hiddenLayersPerApp = ref({})
const vScrollPerApp = ref({})

const selectedEvent = ref(null)
const hoverLayerId = ref(null)

const inspectedEvent = ref(null)
const inspectedEventData = ref(null)
const inspectedEventPendingId = ref(null)

const resetCbs = []

const screenshots = ref([])
let nextScreenshotId = 0

export function resetTimeline () {
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

  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_CLEAR)

  // Layers
  fetchLayers()
  hiddenLayersPerApp.value = getStorage('hidden-layers', {})

  for (const cb of resetCbs) {
    cb()
  }
}

function resetTime () {
  const now = Date.now()
  startTime.value = now - 1000
  endTime.value = now
  minTime.value = now - 1000
  maxTime.value = now
}

export function onTimelineReset (cb) {
  onUnmounted(() => {
    const index = resetCbs.indexOf(cb)
    if (index !== -1) resetCbs.splice(cb)
  })

  resetCbs.push(cb)
}

const addEventCbs = []

export function onEventAdd (cb) {
  onUnmounted(() => {
    const index = addEventCbs.indexOf(cb)
    if (index !== -1) addEventCbs.splice(cb)
  })

  addEventCbs.push(cb)
}

function addEvent (appId, event, layer) {
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
  if (event.groupId) {
    let group = layer.groupsMap[event.groupId]
    if (!group) {
      group = layer.groupsMap[event.groupId] = {
        id: event.groupId,
        events: [],
        firstEvent: event,
        lastEvent: event,
        y: 0
      }
      layer.groups.push(group)
    }
    group.events.push(event)
    group.lastEvent = event
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

function stackEvent (event) {
  const roundedTime = Math.round(event.time / STACK_DURATION)
  const wasStacked = _stackEvent(event, roundedTime)
  if (!wasStacked) {
    event.layer.eventTimeMap[roundedTime] = event
    event.layer.displayedEvents.push(event)
    event.stackedEvents = [event]
  }
  return wasStacked
}

function _stackEvent (event, roundedTime) {
  const existingEvent = event.layer.eventTimeMap[roundedTime]
  if (existingEvent && existingEvent.groupId === event.groupId) {
    existingEvent.stackedEvents.push(event)
    event.stackParent = existingEvent
    return true
  }
  return false
}

export function useTime () {
  return {
    startTime,
    endTime,
    minTime,
    maxTime
  }
}

function layerFactory (options) {
  return {
    ...options,
    events: [],
    displayedEvents: [],
    eventTimeMap: {},
    groupsMap: {},
    groups: [],
    height: 1
  }
}

function builtinLayersFactory () {
  return [
    {
      id: 'mouse',
      label: 'Mouse',
      color: 0xA451AF
    },
    {
      id: 'keyboard',
      label: 'Keyboard',
      color: 0x8151AF
    },
    {
      id: 'component-event',
      label: 'Component events',
      color: 0x41B883
    }
  ].map(options => layerFactory(options))
}

function getLayers (appId) {
  let layers = layersPerApp.value[appId]
  if (!layers) {
    layers = builtinLayersFactory()
    Vue.set(layersPerApp.value, appId, layers)
    // Read the property again to make it reactive
    layers = layersPerApp.value[appId]
  }
  return layers
}

function getHiddenLayers (appId) {
  let layers = hiddenLayersPerApp.value[appId]
  if (!layers) {
    layers = []
    Vue.set(hiddenLayersPerApp.value, appId, layers)
    // Read the property again to make it reactive
    layers = hiddenLayersPerApp.value[appId]
  }
  return layers
}

export function useLayers () {
  const { currentAppId } = useApps()

  const allLayers = computed(() => getLayers(currentAppId.value))

  function isLayerHidden (layer) {
    const list = getHiddenLayers(currentAppId.value)
    return list.includes(layer.id)
  }

  function setLayerHidden (layer, hidden) {
    const list = getHiddenLayers(currentAppId.value)
    const index = list.indexOf(layer.id)
    if (hidden && index === -1) {
      list.push(layer.id)
    } else if (!hidden && index !== -1) {
      list.splice(index, 1)
    }
    setStorage('hidden-layers', hiddenLayersPerApp.value)
  }

  const layers = computed(() => allLayers.value.filter(l => !isLayerHidden(l)))

  const selectedEventLayerId = computed(() => selectedEvent.value ? selectedEvent.value.layer.id : null)

  return {
    layers,
    allLayers,
    vScroll: computed({
      get: () => vScrollPerApp.value[currentAppId.value] || 0,
      set: value => {
        Vue.set(vScrollPerApp.value, currentAppId.value, value)
      }
    }),
    isLayerHidden,
    setLayerHidden,
    hoverLayerId,
    selectedEventLayerId
  }
}

export function useSelectedEvent () {
  return {
    selectedEvent,
    selectedStackedEvents: computed(() => selectedEvent.value.stackedEvents),
    selectedGroupEvents: computed(() => selectedEvent.value.group ? selectedEvent.value.group.events : [])
  }
}

export function useCursor () {
  return {
    cursorTime
  }
}

export function useInspectedEvent () {
  watch(inspectedEvent, event => {
    if (event) {
      loadEvent(event.id)
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

function fetchLayers () {
  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, {})
}

function loadEvent (id) {
  if (!id || inspectedEventPendingId.value === id) return
  inspectedEventPendingId.value = id
  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, { id })
}

function takeScreenshot (event) {
  if (!SharedData.timelineScreenshots) return

  const time = Math.round(event.time / 100) * 100

  const lastScreenshot = screenshots.value[screenshots.value.length - 1]

  if (!lastScreenshot || lastScreenshot.time !== time) {
    const screenshot = {
      id: nextScreenshotId++,
      time,
      image: null,
      events: [
        event
      ]
    }
    event.screenshot = screenshot
    screenshots.value.push(screenshot)

    // Screenshot
    if (typeof chrome !== 'undefined') {
      chrome.tabs.captureVisibleTab({
        format: 'png'
      }, dataUrl => {
        screenshot.image = dataUrl
      })
    }
  } else {
    event.screenshot = lastScreenshot
    lastScreenshot.events.push(event)
  }
}

export function useScreenshots () {
  const { bridge } = useBridge()
  const { currentAppId } = useApps()

  function showScreenshot (screenshot = null) {
    bridge.send(BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, {
      screenshot: screenshot ? {
        ...screenshot,
        events: screenshot.events.filter(event => event.appId === currentAppId.value).map(event => event.id)
      } : null
    })
  }

  return {
    screenshots,
    showScreenshot
  }
}

export function setupTimelineBridgeEvents (bridge) {
  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT, ({ appId, layerId, event }) => {
    const appIds = appId === 'all' ? getApps().map(app => app.id) : [appId]
    for (const appId of appIds) {
      const layer = getLayers(appId).find(l => l.id === layerId)
      if (!layer) {
        console.error(`Layer ${layerId} not found`)
        return
      }

      addEvent(appId, cloneDeep(event), layer)
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, () => {
    fetchLayers()
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, ({ layers }) => {
    for (const layer of layers) {
      const existingLayers = getLayers(layer.appId)
      if (!existingLayers.some(l => l.id === layer.id)) {
        existingLayers.push(layerFactory(layer))
      }
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, ({ eventId, data }) => {
    if (inspectedEvent.value) {
      if (inspectedEvent.value.id === eventId) {
        inspectedEventData.value = parse(data)

        if (data === null) {
          inspectedEvent.value = null
        }
      }
      if (eventId === inspectedEventPendingId.value) {
        inspectedEventPendingId.value = null
      }
    }
  })

  resetTimeline()
}
