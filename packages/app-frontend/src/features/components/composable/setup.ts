import { Bridge, BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { putError } from '@front/features/error'
import {
  selectedComponentPendingId,
  expandedMap,
  resetComponentsQueued,
  resetComponents,
  componentsMap,
  restoreChildrenFromComponentsMap,
  updateComponentsMapData,
  addToComponentsMap,
  rootInstances,
  selectedComponentId,
  selectedComponentData,
  loadComponent,
  setComponentOpen,
  requestComponentTree
} from './components'

export function setupComponentsBridgeEvents (bridge: Bridge) {
  selectedComponentPendingId.value = null
  expandedMap.value = {}

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_TREE, ({ instanceId, treeData, notFound }) => {
    const isRoot = instanceId.endsWith('root')

    // Reset
    if (resetComponentsQueued.value) {
      resetComponents()
    }

    // Not supported
    if (!treeData) {
      if (isRoot && !notFound) {
        putError('Component tree not supported')
      }
      return
    }

    // Handle tree data
    const data = parse(treeData)
    const instance = componentsMap.value[instanceId]
    if (instance) {
      for (const item of data) {
        restoreChildrenFromComponentsMap(item)
        const component = updateComponentsMapData(item)
        addToComponentsMap(component)
      }
    } else if (Array.isArray(data)) {
      rootInstances.value = data
      data.forEach(i => addToComponentsMap(i))
    }

    // Try to load selected component again
    if (isRoot && selectedComponentId.value && !selectedComponentData.value && !selectedComponentPendingId.value) {
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
        setComponentOpen(id, true)
        requestComponentTree(id)
      })
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, () => {
    chrome.devtools.inspectedWindow.eval('inspect(window.__VUE_DEVTOOLS_INSPECT_TARGET__)')
  })
}
