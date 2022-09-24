import { computed, set } from 'vue'
import { BridgeEvents, setStorage } from '@vue-devtools/shared-utils'
import { useApps, waitForAppSelect } from '@front/features/apps'
import { getBridge } from '@front/features/bridge'
import {
  layersPerApp,
  hiddenLayersPerApp,
  selectedLayer,
  vScrollPerApp,
  hoverLayerId,
  LayerFromBackend,
  Layer,
  selectedEvent,
  inspectedEvent,
  EventGroup,
} from './store'
import { useRouter } from '@front/util/router'
import { addNonReactiveProperties } from '@front/util/reactivity'

export function layerFactory (options: LayerFromBackend): Layer {
  const result = {} as Layer
  addNonReactiveProperties(result, {
    ...options,
    newHeight: 1,
    eventsMap: {},
    groupsMap: {},
    groupPositionCache: {},
  })
  Object.assign(result, {
    events: [],
    groups: [],
    height: 1,
    lastInspectedEvent: null,
    loaded: false,
  })
  return result
}

export function getLayers (appId: string) {
  let layers = layersPerApp.value[appId]
  if (!layers) {
    layers = []
    set(layersPerApp.value, appId, layers)
    // Read the property again to make it reactive
    layers = layersPerApp.value[appId]
  }
  return layers
}

function getHiddenLayers (appId: string) {
  let layers = hiddenLayersPerApp.value[appId]
  if (!layers) {
    layers = []
    set(hiddenLayersPerApp.value, appId, layers)
    // Read the property again to make it reactive
    layers = hiddenLayersPerApp.value[appId]
  }
  return layers
}

export function useLayers () {
  const { currentAppId } = useApps()

  const allLayers = computed(() => getLayers(currentAppId.value))

  function isLayerHidden (layer: Layer) {
    const list = getHiddenLayers(currentAppId.value)
    return list.includes(layer.id)
  }

  function setLayerHidden (layer: Layer, hidden: boolean) {
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

  const router = useRouter()

  function selectLayer (layer: Layer) {
    let event = selectedLayer.value !== layer ? layer.lastInspectedEvent : null

    selectedLayer.value = layer
    setStorage('selected-layer-id', layer.id)

    if (!event) event = layer.events.length ? layer.events[layer.events.length - 1] : null
    inspectedEvent.value = event
    selectedEvent.value = event

    router.push({
      query: {
        ...router.currentRoute.query,
        tabId: 'all',
      },
    })
  }

  return {
    layers,
    allLayers,
    vScroll: computed({
      get: () => vScrollPerApp.value[currentAppId.value] || 0,
      set: (value: number) => {
        set(vScrollPerApp.value, currentAppId.value, value)
      },
    }),
    isLayerHidden,
    setLayerHidden,
    hoverLayerId,
    selectedLayer: computed(() => selectedLayer.value),
    selectLayer,
  }
}

export async function fetchLayers () {
  await waitForAppSelect()
  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, {})
}

export function getGroupsAroundPosition (layer: Layer, startPosition: number, endPosition: number): EventGroup[] {
  const result = new Set<EventGroup>()
  let key = Math.round(startPosition / 100_000)
  const endKey = Math.round(endPosition / 100_000)
  while (key <= endKey) {
    const groups = layer.groupPositionCache[key]
    if (groups) {
      for (const group of groups) {
        result.add(group)
      }
    }
    key++
  }
  return Array.from(result)
}

export function addGroupAroundPosition (layer: Layer, group: EventGroup, newPosition: number) {
  let key = Math.round(group.lastEvent.time / 100_000)
  const endKey = Math.round(newPosition / 100_000)

  while (key <= endKey) {
    let list = layer.groupPositionCache[key]
    if (!list) {
      list = layer.groupPositionCache[key] = []
    }
    if (!list.includes(group)) {
      list.push(group)
    }
    key++
  }
}
