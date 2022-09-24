import Vue, { ref, computed, watch, Ref, onMounted } from 'vue'
import { ComponentTreeNode, EditStatePayload, InspectedComponentData } from '@vue/devtools-api'
import groupBy from 'lodash/groupBy'
import {
  BridgeEvents,
  sortByKey,
  searchDeepInObject,
  BridgeSubscriptions,
  isChrome,
  openInEditor,
  setStorage,
} from '@vue-devtools/shared-utils'
import { getBridge, useBridge } from '@front/features/bridge'
import { AppRecord, waitForAppSelect, useCurrentApp } from '@front/features/apps'
import { useRoute, useRouter } from '@front/util/router'

export const rootInstances = ref<ComponentTreeNode[]>([])
export const componentsMap = ref<Record<ComponentTreeNode['id'], ComponentTreeNode>>({})
let componentsParent: Record<ComponentTreeNode['id'], ComponentTreeNode['id']> = {}
const treeFilter = ref('')
export const selectedComponentId = ref<ComponentTreeNode['id']>(null)
export const selectedComponentData = ref<InspectedComponentData>(null)
const selectedComponentStateFilter = ref('')
export const selectedComponentPendingId = ref<ComponentTreeNode['id']>(null)
let lastSelectedApp: AppRecord = null
export const lastSelectedComponentId: Record<AppRecord['id'], ComponentTreeNode['id']> = {}
export const expandedMap = ref<Record<ComponentTreeNode['id'], boolean>>({})

export function useComponentRequests () {
  const router = useRouter()

  function selectComponent (id: ComponentTreeNode['id'], replace = false) {
    if (selectedComponentId.value !== id) {
      router[replace ? 'replace' : 'push']({
        params: {
          appId: getAppIdFromComponentId(id),
          componentId: id,
        },
      })
    } else {
      loadComponent(id)
    }
  }

  return {
    requestComponentTree,
    selectComponent,
  }
}

export function useComponents () {
  const { onBridge, subscribe } = useBridge()
  const route = useRoute()
  const {
    requestComponentTree,
    selectComponent,
  } = useComponentRequests()
  const { currentAppId } = useCurrentApp()

  watch(treeFilter, () => {
    requestComponentTree()
  })

  watch(() => route.value.params.componentId, () => {
    const value = route.value.params.componentId
    if (value && getAppIdFromComponentId(value) === currentAppId.value) {
      selectedComponentId.value = value
      loadComponent(value)
    }
  }, {
    immediate: true,
  })

  function subscribeToSelectedData () {
    let unsub
    watch(selectedComponentId, value => {
      if (unsub) {
        unsub()
        unsub = null
      }

      if (value != null) {
        unsub = subscribe(BridgeSubscriptions.SELECTED_COMPONENT_DATA, {
          instanceId: value,
        })
      }
    }, {
      immediate: true,
    })
  }

  // We watch for the tree data so that we can auto load the current selected component
  watch(componentsMap, () => {
    if (selectedComponentId.value && selectedComponentPendingId.value !== selectedComponentId.value && !selectedComponentData.value) {
      selectComponent(selectedComponentId.value)
    }
  }, {
    immediate: true,
    deep: true,
  })

  onBridge(BridgeEvents.TO_FRONT_APP_SELECTED, async ({ id }) => {
    await waitForAppSelect()
    requestComponentTree()
    selectedComponentData.value = null
    if (lastSelectedApp !== null) {
      selectLastComponent()
    }
    lastSelectedApp = id
  })

  // Re-select last selected component when switching back to inspector component tab
  function selectLastComponent () {
    const id = lastSelectedComponentId[currentAppId.value]
    if (id) {
      selectComponent(id, true)
    }
  }

  return {
    rootInstances: computed(() => rootInstances.value),
    treeFilter,
    selectedComponentId: computed(() => selectedComponentId.value),
    requestComponentTree,
    selectComponent,
    selectLastComponent,
    subscribeToSelectedData,
  }
}

export function useComponent (instance: Ref<ComponentTreeNode>) {
  const { selectComponent, requestComponentTree } = useComponentRequests()
  const { subscribe } = useBridge()

  const isExpanded = computed(() => isComponentOpen(instance.value.id))
  const isExpandedUndefined = computed(() => expandedMap.value[instance.value.id] == null)

  function toggleExpand (recursively = false, value?, child?) {
    const treeNode = child || instance.value
    if (!treeNode.hasChildren) return
    const isOpen = value === undefined ? !isExpanded.value : value
    setComponentOpen(treeNode.id, isOpen)
    if (isComponentOpen(treeNode.id)) {
      requestComponentTree(treeNode.id, recursively)
    } else {
      // stop expanding all treenode
      treeNode.autoOpen = false
    }
    if (recursively) {
      treeNode.children.forEach(child => {
        toggleExpand(recursively, value, child)
      })
    }
  }

  const isSelected = computed(() => selectedComponentId.value === instance.value.id)

  function select (id = instance.value.id) {
    selectComponent(id)
  }

  function subscribeToComponentTree () {
    let unsub
    watch(() => instance.value.id, value => {
      if (unsub) {
        unsub()
        unsub = null
      }

      if (value != null) {
        unsub = subscribe(BridgeSubscriptions.COMPONENT_TREE, {
          instanceId: value,
        })
      }
    }, {
      immediate: true,
    })
  }

  onMounted(() => {
    if (instance.value.autoOpen) {
      toggleExpand(true, true)
    } else if (isExpanded.value) {
      requestComponentTree(instance.value.id)
    }
  })

  return {
    isExpanded,
    isExpandedUndefined,
    isComponentOpen,
    toggleExpand,
    isSelected,
    select,
    subscribeToComponentTree,
  }
}

export function setComponentOpen (id: ComponentTreeNode['id'], isOpen: boolean) {
  Vue.set(expandedMap.value, id, isOpen)
}

export function isComponentOpen (id) {
  return !!expandedMap.value[id]
}

export function useSelectedComponent () {
  const data = computed(() => selectedComponentData.value)
  const state = computed(() => selectedComponentData.value
    ? groupBy(sortByKey(selectedComponentData.value.state.filter(el => {
      try {
        return searchDeepInObject({
          [el.key]: el.value,
        }, selectedComponentStateFilter.value)
      } catch (e) {
        return {
          [el.key]: e,
        }
      }
    })), 'type')
    : ({}))

  const fileIsPath = computed(() => data.value?.file && /[/\\]/.test(data.value.file))

  function inspectDOM () {
    if (!data.value) return
    if (isChrome) {
      getBridge().send(BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, { instanceId: data.value.id })
    } else {
      window.alert('DOM inspection is not supported in this shell.')
    }
  }

  function openFile () {
    if (!data.value) return
    openInEditor(data.value.file)
  }

  const { bridge } = useBridge()

  function editState (dotPath: string, payload: EditStatePayload, type?: string) {
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, {
      instanceId: data.value.id,
      dotPath,
      type,
      ...payload,
    })
  }

  function scrollToComponent () {
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, {
      instanceId: data.value.id,
    })
  }

  return {
    data,
    state,
    stateFilter: selectedComponentStateFilter,
    inspectDOM,
    fileIsPath,
    openFile,
    editState,
    scrollToComponent,
    selectedComponentId,
  }
}

export function resetComponents () {
  rootInstances.value = []
  componentsMap.value = {}
  componentsParent = {}
  updateTrackingEvents.value = {}
  updateTrackingLimit.value = Date.now() + 5_000
}

export const requestedComponentTree = new Set()

let requestComponentTreeRetryDelay = 500

export async function requestComponentTree (instanceId: ComponentTreeNode['id'] = null, recursively = false) {
  if (!instanceId) {
    instanceId = '_root'
  }

  if (requestedComponentTree.has(instanceId)) {
    return
  }
  requestedComponentTree.add(instanceId)

  await waitForAppSelect()

  _sendTreeRequest(instanceId, recursively)
  _queueRetryTree(instanceId, recursively)
}

function _sendTreeRequest (instanceId: ComponentTreeNode['id'], recursively = false) {
  getBridge().send(BridgeEvents.TO_BACK_COMPONENT_TREE, {
    instanceId,
    filter: treeFilter.value,
    recursively,
  })
}

function _queueRetryTree (instanceId: ComponentTreeNode['id'], recursively = false) {
  setTimeout(() => _retryRequestComponentTree(instanceId, recursively), requestComponentTreeRetryDelay)
  requestComponentTreeRetryDelay *= 1.5
}

function _retryRequestComponentTree (instanceId: ComponentTreeNode['id'], recursively = false) {
  if (rootInstances.value.length) {
    requestComponentTreeRetryDelay = 500
    return
  }
  _sendTreeRequest(instanceId, recursively)
  _queueRetryTree(instanceId, recursively)
}

export function ensureComponentsMapData (data: ComponentTreeNode) {
  let component = componentsMap.value[data.id]
  if (!component) {
    component = addToComponentsMap(data)
  } else {
    component = updateComponentsMapData(data)
  }
  return component
}

function ensureComponentsMapChildren (id: string, children: ComponentTreeNode[]) {
  const result = children.map(child => ensureComponentsMapData(child))
  for (const child of children) {
    componentsParent[child.id] = id
  }
  return result
}

function updateComponentsMapData (data: ComponentTreeNode) {
  const component = componentsMap.value[data.id]
  for (const key in data) {
    if (key === 'children') {
      if (!data.hasChildren || data.children.length) {
        const children = ensureComponentsMapChildren(component.id, data.children)
        Vue.set(component, key, children)
      }
    } else {
      Vue.set(component, key, data[key])
    }
  }
  return component
}

function addToComponentsMap (data: ComponentTreeNode) {
  if (!data.hasChildren || data.children.length) {
    data.children = ensureComponentsMapChildren(data.id, data.children)
  }
  componentsMap.value[data.id] = data
  return data
}

export async function loadComponent (id: ComponentTreeNode['id']) {
  if (!id || selectedComponentPendingId.value === id) return
  lastSelectedComponentId[getAppIdFromComponentId(id)] = id
  setStorage('lastSelectedComponentId', lastSelectedComponentId)
  selectedComponentPendingId.value = id
  await waitForAppSelect()
  getBridge().send(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, id)
}

export function sortChildren (children: ComponentTreeNode[]) {
  return children.slice().sort((a, b) => {
    if (a.inactive && !b.inactive) {
      return 1
    } else if (!a.inactive && b.inactive) {
      return -1
    }
    const order = compareIndexLists(a.domOrder ?? [], b.domOrder ?? [])
    if (order === 0) {
      return a.id.localeCompare(b.id)
    } else {
      return order
    }
  })
}

function compareIndexLists (a: number[], b: number[]): number {
  if (!a.length || !b.length) {
    return 0
  } else if (a[0] === b[0]) {
    return compareIndexLists(a.slice(1), b.slice(1))
  } else {
    return a[0] - b[0]
  }
}

export function getAppIdFromComponentId (id: string) {
  const index = id.indexOf(':')
  const appId = id.substring(0, index)
  return appId
}

export interface ComponentUpdateTrackingEvent {
  instanceId: string
  time: number
  count: number
}

export const updateTrackingEvents = ref<Record<string, ComponentUpdateTrackingEvent>>({})
export const updateTrackingLimit = ref(Date.now() + 5_000)

export function addUpdateTrackingEvent (instanceId: string, time: number) {
  const event = updateTrackingEvents.value[instanceId]
  if (event) {
    event.count++
    event.time = time
  } else {
    Vue.set(updateTrackingEvents.value, instanceId, {
      instanceId,
      time,
      count: 1,
    })
  }
}
