import Vue from 'vue'
import { computed } from '@vue/composition-api'
import { BridgeEvents, setStorage } from '@vue-devtools/shared-utils'
import { useApps } from '@front/features/apps'
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
  inspectedEvent
} from './store'
import { useRouter } from '@front/util/router'

export function layerFactory (options: LayerFromBackend): Layer {
  return {
    ...options,
    events: [],
    eventsMap: {},
    groups: [],
    groupsMap: {},
    height: 1,
    lastInspectedEvent: null,
    loaded: false
  }
}

export function getLayers (appId: number) {
  let layers = layersPerApp.value[appId]
  if (!layers) {
    layers = []
    Vue.set(layersPerApp.value, appId, layers)
    // Read the property again to make it reactive
    layers = layersPerApp.value[appId]
  }
  return layers
}

function getHiddenLayers (appId: number) {
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

    if (!event) event = layer.events.length ? layer.events[layer.events.length - 1] : null
    inspectedEvent.value = event
    selectedEvent.value = event

    router.push({
      query: {
        ...router.currentRoute.query,
        tabId: 'all'
      }
    })
  }

  return {
    layers,
    allLayers,
    vScroll: computed({
      get: () => vScrollPerApp.value[currentAppId.value] || 0,
      set: (value: number) => {
        Vue.set(vScrollPerApp.value, currentAppId.value, value)
      }
    }),
    isLayerHidden,
    setLayerHidden,
    hoverLayerId,
    selectedLayer: computed(() => selectedLayer.value),
    selectLayer
  }
}

export function fetchLayers () {
  getBridge().send(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, {})
}
