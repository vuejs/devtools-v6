import { Bridge, BridgeEvents, parse, getStorage } from '@vue-devtools/shared-utils'
import { putError } from '@front/features/error'
import {
  selectedComponentPendingId,
  ensureComponentsMapData,
  rootInstances,
  selectedComponentId,
  selectedComponentData,
  loadComponent,
  isComponentOpen,
  setComponentOpen,
  requestComponentTree,
  requestedComponentTree,
  getAppIdFromComponentId,
  lastSelectedComponentId,
  addUpdateTrackingEvent,
} from './components'

export function setupComponentsBridgeEvents (bridge: Bridge) {
  selectedComponentPendingId.value = null

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_TREE, ({ instanceId, treeData, notFound }) => {
    requestedComponentTree.delete(instanceId)

    const isRoot = instanceId.endsWith('root')

    // Not supported
    if (!treeData) {
      if (isRoot && !notFound) {
        putError('Component tree not supported')
      }
      return
    }

    // Handle tree data
    const data = parse(treeData)
    if (isRoot) {
      rootInstances.value = data.map(i => ensureComponentsMapData(i))
    } else {
      for (const child of data) {
        ensureComponentsMapData(child)
      }
    }

    // Try to load selected component again
    if (isRoot && selectedComponentId.value && !selectedComponentData.value && !selectedComponentPendingId.value &&
      getAppIdFromComponentId(selectedComponentId.value) === getAppIdFromComponentId(instanceId)) {
      loadComponent(selectedComponentId.value)
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, ({ instanceId, data, parentIds }) => {
    if (instanceId === selectedComponentId.value) {
      selectedComponentData.value = parse(data)
    }
    if (instanceId === selectedComponentPendingId.value) {
      selectedComponentPendingId.value = null
    }
    if (parentIds) {
      parentIds.reverse().forEach(id => {
        // Ignore root
        if (id.endsWith('root')) return
        if (!isComponentOpen(id)) {
          setComponentOpen(id, true)
          requestComponentTree(id)
        }
      })
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, () => {
    chrome.devtools.inspectedWindow.eval('inspect(window.__VUE_DEVTOOLS_INSPECT_TARGET__)')
  })

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_UPDATED, ({ instanceId, time }) => {
    addUpdateTrackingEvent(instanceId, time)
  })

  // Persistance

  Object.assign(lastSelectedComponentId, getStorage('lastSelectedComponentId', {}))
}
