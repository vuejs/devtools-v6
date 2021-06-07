import { ref, computed } from '@vue/composition-api'
import { useRoute } from '@front/util/router'
import { useApps } from '@front/features/apps'
import { BridgeEvents, parse, searchDeepInObject, getStorage, setStorage, Bridge } from '@vue-devtools/shared-utils'
import { getBridge, useBridge } from '@front/features/bridge'

export interface InspectorFromBackend {
  id: string
  appId: number
  pluginId: string
  label: string
  icon: string
  treeFilterPlaceholder: string
  stateFilterPlaceholder: string
  noSelectionText: string
  actions?: {
    icon: string
    tooltip?: string
  }[]
}

export interface Inspector extends InspectorFromBackend {
  rootNodes: any[]
  treeFilter: string
  selectedNodeId: string
  selectedNode: any
  stateFilter: string
  state: any
  expandedMap: Record<string, boolean>
}

const SELECTED_NODES_STORAGE = 'custom-inspector-selected-nodes'
let selectedIdsStorage = {}

function inspectorFactory (options: InspectorFromBackend): Inspector {
  return {
    ...options,
    rootNodes: [],
    treeFilter: '',
    selectedNodeId: selectedIdsStorage[options.id] || null,
    selectedNode: null,
    stateFilter: '',
    state: null,
    expandedMap: {}
  }
}

const inspectors = ref<Inspector[]>([])

export function useInspectors () {
  const { currentAppId } = useApps()
  const currentAppInspectors = computed(() => inspectors.value.filter(i => i.appId === currentAppId.value))

  return {
    inspectors: currentAppInspectors
  }
}

export function useCurrentInspector () {
  const route = useRoute()
  const { inspectors } = useInspectors()
  const { bridge } = useBridge()

  const currentInspector = computed(() => inspectors.value.find(i => i.id === route.value.params.inspectorId))

  const filteredState = computed(() => {
    if (currentInspector.value.stateFilter) {
      const result = {}
      for (const groupKey in currentInspector.value.state) {
        const group = currentInspector.value.state[groupKey]
        const groupFields = group.filter(el => searchDeepInObject({
          [el.key]: el.value
        }, currentInspector.value.stateFilter))
        if (groupFields.length) {
          result[groupKey] = groupFields
        }
      }
      return result
    } else {
      return currentInspector.value.state
    }
  })

  function selectNode (node) {
    currentInspector.value.selectedNodeId = node.id
    currentInspector.value.selectedNode = node
    selectedIdsStorage[currentInspector.value.id] = node.id
    setStorage(SELECTED_NODES_STORAGE, selectedIdsStorage)
    fetchState(currentInspector.value)
  }

  function refreshInspector () {
    refreshTree()
    refreshState()
  }

  function refreshTree () {
    fetchTree(currentInspector.value)
  }

  function refreshState () {
    fetchState(currentInspector.value)
  }

  function editState (path: string, payload: any, type: string) {
    bridge.send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, {
      inspectorId: currentInspector.value.id,
      appId: currentInspector.value.appId,
      nodeId: currentInspector.value.selectedNodeId,
      path,
      type,
      payload
    })
  }

  return {
    currentInspector,
    filteredState,
    selectNode,
    refreshInspector,
    refreshTree,
    refreshState,
    editState
  }
}

function fetchInspectors () {
  getBridge().send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, {})
}

function fetchTree (inspector: Inspector) {
  if (!inspector) return
  getBridge().send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, {
    inspectorId: inspector.id,
    appId: inspector.appId,
    treeFilter: inspector.treeFilter
  })
}

function fetchState (inspector: Inspector) {
  if (!inspector || !inspector.selectedNodeId) return
  getBridge().send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, {
    inspectorId: inspector.id,
    appId: inspector.appId,
    nodeId: inspector.selectedNodeId
  })
}

export function resetInspectors () {
  inspectors.value = []
  fetchInspectors()
}

export function setupCustomInspectorBridgeEvents (bridge: Bridge) {
  selectedIdsStorage = getStorage(SELECTED_NODES_STORAGE, {})

  bridge.on(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, ({ inspectors: list }) => {
    list.forEach(inspector => {
      if (!inspectors.value.some(i => i.id === inspector.id && i.appId === inspector.appId)) {
        inspectors.value.push(inspectorFactory(inspector))
      }
    })
  })

  bridge.on(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, () => {
    fetchInspectors()
  })

  bridge.on(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, ({ appId, inspectorId, rootNodes }) => {
    const inspector = inspectors.value.find(i => i.id === inspectorId && i.appId === appId)

    if (!inspector) {
      console.error(`Inspector ${inspectorId} not found`)
      return
    }

    inspector.rootNodes = rootNodes
  })

  bridge.on(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, ({ appId, inspectorId, state }) => {
    const inspector = inspectors.value.find(i => i.id === inspectorId && i.appId === appId)

    if (!inspector) {
      console.error(`Inspector ${inspectorId} not found`)
      return
    }

    inspector.state = parse(state)
  })

  bridge.on(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE, ({ appId, inspectorId, nodeId }) => {
    const inspector = inspectors.value.find(i => i.id === inspectorId && i.appId === appId)

    if (!inspector) {
      console.error(`Inspector ${inspectorId} not found`)
      return
    }

    inspector.selectedNodeId = nodeId
    inspector.selectedNode = null
    selectedIdsStorage[inspector.id] = nodeId
    setStorage(SELECTED_NODES_STORAGE, selectedIdsStorage)
    fetchState(inspector)
  })

  resetInspectors()
}
