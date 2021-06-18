import { ref, computed, watch, Ref } from '@vue/composition-api'
import { ComponentTreeNode, EditStatePayload, InspectedComponentData } from '@vue/devtools-api'
import Vue from 'vue'
import groupBy from 'lodash/groupBy'
import {
  BridgeEvents,
  sortByKey,
  searchDeepInObject,
  BridgeSubscriptions,
  isChrome,
  openInEditor
} from '@vue-devtools/shared-utils'
import { getBridge, useBridge } from '@front/features/bridge'
import { App } from '@front/features/apps'
import { useRoute, useRouter } from '@front/util/router'

export const rootInstances = ref<ComponentTreeNode[]>([])
export const componentsMap = ref<Record<ComponentTreeNode['id'], ComponentTreeNode>>({})
let componentsParent: Record<ComponentTreeNode['id'], ComponentTreeNode['id']> = {}
const treeFilter = ref('')
export const selectedComponentId = ref<ComponentTreeNode['id']>(null)
export const selectedComponentData = ref<InspectedComponentData>(null)
const selectedComponentStateFilter = ref('')
export const selectedComponentPendingId = ref<ComponentTreeNode['id']>(null)
let lastSelectedApp: App = null
let lastSelectedComponentId: ComponentTreeNode['id'] = null
export const expandedMap = ref<Record<ComponentTreeNode['id'], boolean>>({})
export const resetComponentsQueued = ref(false)

export function useComponentRequests () {
  const router = useRouter()

  function selectComponent (id: ComponentTreeNode['id'], replace = false) {
    if (selectedComponentId.value !== id) {
      router[replace ? 'replace' : 'push']({
        params: {
          componentId: id
        }
      })
    } else {
      loadComponent(id)
    }
  }

  return {
    requestComponentTree,
    selectComponent
  }
}

export function useComponents () {
  const { onBridge, subscribe } = useBridge()
  const route = useRoute()
  const {
    requestComponentTree,
    selectComponent
  } = useComponentRequests()

  watch(treeFilter, () => {
    requestComponentTree()
  })

  watch(() => route.value.params.componentId, value => {
    selectedComponentId.value = value
    loadComponent(value)
  }, {
    immediate: true
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
          instanceId: value
        })
      }
    }, {
      immediate: true
    })
  }

  // We watch for the tree data so that we can auto load the current selected component
  watch(componentsMap, () => {
    if (selectedComponentId.value && selectedComponentPendingId.value !== selectedComponentId.value && !selectedComponentData.value) {
      selectComponent(selectedComponentId.value)
    }
  }, {
    immediate: true,
    deep: true
  })

  onBridge(BridgeEvents.TO_FRONT_APP_SELECTED, ({ id }) => {
    requestComponentTree()
    selectedComponentData.value = null
    if (lastSelectedApp !== null) {
      selectLastComponent()
    }
    lastSelectedApp = id
  })

  // Re-select last selected component when switching back to inspector component tab
  function selectLastComponent () {
    if (lastSelectedComponentId) {
      selectComponent(lastSelectedComponentId, true)
    }
  }

  return {
    rootInstances: computed(() => rootInstances.value),
    treeFilter,
    selectedComponentId: computed(() => selectedComponentId.value),
    requestComponentTree,
    selectComponent,
    selectLastComponent,
    subscribeToSelectedData
  }
}

export function useComponent (instance: Ref<ComponentTreeNode>) {
  const { selectComponent, requestComponentTree } = useComponentRequests()
  const { subscribe } = useBridge()

  function checkIsExpanded (id) {
    return !!expandedMap.value[id]
  }

  const isExpanded = computed(() => checkIsExpanded(instance.value.id))
  const isExpandedUndefined = computed(() => expandedMap.value[instance.value.id] == null)

  function toggleExpand (load = true) {
    if (!instance.value.hasChildren) return
    setComponentOpen(instance.value.id, !isExpanded.value)
    if (load) {
      requestComponentTree(instance.value.id)
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
          instanceId: value
        })
      }
    }, {
      immediate: true
    })
  }

  if (isExpanded.value) {
    requestComponentTree(instance.value.id)
  }

  return {
    isExpanded,
    isExpandedUndefined,
    checkIsExpanded,
    toggleExpand,
    isSelected,
    select,
    subscribeToComponentTree
  }
}

export function setComponentOpen (id: ComponentTreeNode['id'], isOpen: boolean) {
  Vue.set(expandedMap.value, id, isOpen)
}

export function useSelectedComponent () {
  const data = computed(() => selectedComponentData.value)
  const state = computed(() => selectedComponentData.value
    ? groupBy(sortByKey(selectedComponentData.value.state.filter(el => {
      return searchDeepInObject({
        [el.key]: el.value
      }, selectedComponentStateFilter.value)
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
      ...payload
    })
  }

  function scrollToComponent () {
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, {
      instanceId: data.value.id
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
    selectedComponentId
  }
}

export function resetComponents () {
  resetComponentsQueued.value = false
  rootInstances.value = []
  componentsMap.value = {}
  componentsParent = {}
}

export function requestComponentTree (instanceId: ComponentTreeNode['id'] = null) {
  if (!instanceId) {
    instanceId = '_root'
  }
  if (instanceId === '_root') {
    resetComponentsQueued.value = true
  }
  getBridge().send(BridgeEvents.TO_BACK_COMPONENT_TREE, {
    instanceId,
    filter: treeFilter.value
  })
}

export function restoreChildrenFromComponentsMap (data: ComponentTreeNode) {
  const instance = componentsMap.value[data.id]
  if (instance && data.hasChildren) {
    if (!data.children.length && instance.children.length) {
      data.children = instance.children
    } else {
      for (const child of data.children) {
        restoreChildrenFromComponentsMap(child)
      }
    }
  }
}

export function updateComponentsMapData (data: ComponentTreeNode) {
  const component = componentsMap.value[data.id]
  for (const key in data) {
    Vue.set(component, key, data[key])
  }
  return component
}

export function addToComponentsMap (instance: ComponentTreeNode) {
  componentsMap.value[instance.id] = instance
  if (instance.children) {
    instance.children.forEach(c => {
      componentsParent[c.id] = instance.id
      addToComponentsMap(c)
    })
  }
}

export function loadComponent (id: ComponentTreeNode['id']) {
  if (!id || selectedComponentPendingId.value === id) return
  lastSelectedComponentId = id
  selectedComponentPendingId.value = id
  getBridge().send(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, id)
}

export function sortChildren (children: ComponentTreeNode[]) {
  return children.slice().sort((a, b) => {
    if (a.positionTop === b.positionTop) {
      return a.id.localeCompare(b.id)
    } else {
      return a.positionTop - b.positionTop
    }
  })
}
