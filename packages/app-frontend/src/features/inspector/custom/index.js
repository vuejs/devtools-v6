import { ref, computed } from '@vue/composition-api'
import { useRoute } from '@front/util/router'
import { useApps } from '@front/features/apps'
import { BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { getBridge, useBridge } from '@front/features/bridge'

function inspectorFactory (options) {
  return {
    ...options,
    rootNodes: [],
    treeFilter: '',
    selectedNode: null,
    stateFilter: '',
    state: null
  }
}

const inspectors = ref([])

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

  function selectNode (node) {
    currentInspector.value.selectedNode = node
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

  function editState (path, payload) {
    bridge.send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, {
      inspectorId: currentInspector.value.id,
      appId: currentInspector.value.appId,
      nodeId: currentInspector.value.selectedNode.id,
      path,
      payload
    })
  }

  return {
    currentInspector,
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

function fetchTree (inspector) {
  if (!inspector) return
  getBridge().send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, {
    inspectorId: inspector.id,
    appId: inspector.appId,
    treeFilter: inspector.treeFilter
  })
}

function fetchState (inspector) {
  if (!inspector || !inspector.selectedNode) return
  console.log('fetchState')
  getBridge().send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, {
    inspectorId: inspector.id,
    appId: inspector.appId,
    nodeId: inspector.selectedNode.id
  })
}

export function resetInspectors () {
  inspectors.value = []
  fetchInspectors()
}

export function setupCustomInspectorBridgeEvents (bridge) {
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

  resetInspectors()
}
