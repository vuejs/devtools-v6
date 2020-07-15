import { ref, computed, watch } from '@vue/composition-api'
import Vue from 'vue'
import groupBy from 'lodash/groupBy'
import { BridgeEvents, parse, sortByKey, searchDeepInObject, BuiltinTabs, BridgeSubscriptions } from '@vue-devtools/shared-utils'
import { useBridge } from '../bridge'
import { useRoute, useRouter } from '@front/util/router'
import { putError } from '../error'

const rootInstances = ref([])
let componentsMap = {}
let componentsParent = {}
const selectedComponentId = ref(null)
const selectedComponentData = ref(null)
const selectedComponentStateFilter = ref('')
let selectedComponentPendingId = null
let lastSelectedApp = null
let lastSelectedComponentId = null
// @TODO auto expand to selected component after target page refresh
let lastSelectedComponentPath = []
const expandedMap = ref({})

export function useComponents () {
  const { bridge, onBridge, subscribe } = useBridge()
  const route = useRoute()
  const router = useRouter()

  function requestComponentTree (instanceId = null) {
    if (!instanceId) {
      resetComponents()
      instanceId = '_root'
    }
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_TREE, instanceId)
  }

  function selectComponent (id, replace = false) {
    if (selectedComponentId.value !== id) {
      router[replace ? 'replace' : 'push']({
        params: {
          componentId: id
        }
      })
      lastSelectedComponentPath = getPath(id)
    } else {
      loadComponent(id)
    }
  }

  function loadComponent (id) {
    if (!id || selectedComponentPendingId === id) return
    lastSelectedComponentId = id
    selectedComponentPendingId = id
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, id)
  }

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
  watch(() => componentsMap, () => {
    if (selectedComponentId.value && selectedComponentPendingId !== selectedComponentId.value && !selectedComponentData.value) {
      selectComponent(selectedComponentId.value)
    }
  }, {
    immediate: true,
    deep: true
  })

  onBridge(BridgeEvents.TO_FRONT_APP_SELECTED, ({ id, lastInspectedComponentId }) => {
    requestComponentTree()
    selectedComponentData.value = null
    if (lastSelectedApp !== null) {
      selectComponent(lastInspectedComponentId, true)
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
    selectedComponentId: computed(() => selectedComponentId.value),
    requestComponentTree,
    selectComponent,
    selectLastComponent,
    subscribeToSelectedData
  }
}

export function useComponent (instance) {
  const { selectComponent, requestComponentTree } = useComponents()
  const { subscribe } = useBridge()

  const isExpanded = computed(() => !!expandedMap.value[instance.value.id])
  const isExpandedUndefined = computed(() => expandedMap.value[instance.value.id] == null)

  function toggleExpand (load = true) {
    if (!instance.value.hasChildren) return
    Vue.set(expandedMap.value, instance.value.id, !isExpanded.value)
    if (load) requestComponentTree(instance.value.id)
  }

  const isSelected = computed(() => selectedComponentId.value === instance.value.id)

  function select () {
    selectComponent(instance.value.id)
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
    toggleExpand,
    isSelected,
    select,
    subscribeToComponentTree
  }
}

export function useSelectedComponent () {
  const data = computed(() => selectedComponentData.value)
  const state = computed(() => selectedComponentData.value ? groupBy(sortByKey(selectedComponentData.value.state.filter(el => {
    return searchDeepInObject({
      [el.key]: el.value
    }, selectedComponentStateFilter.value)
  })), 'type') : ({}))

  return {
    data,
    state,
    stateFilter: selectedComponentStateFilter
  }
}

export function resetComponents () {
  rootInstances.value = []
  componentsMap = {}
  componentsParent = {}
  expandedMap.value = {}
}

export function setupComponentsBridgeEvents (bridge) {
  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_TREE, ({ instanceId, treeData }) => {
    if (!treeData) {
      if (instanceId.endsWith('root')) {
        putError('Component tree not supported')
      }
      return
    }
    const data = parse(treeData)
    const instance = componentsMap[instanceId]
    if (instance) {
      for (const key in data) {
        Vue.set(instance, key, data[key])
      }
      addToComponentsMap(instance)
    } else {
      rootInstances.value.push(data)
      addToComponentsMap(data)
    }
    console.log(componentsParent)
  })

  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, ({ instanceId, data }) => {
    console.log(instanceId, data)
    if (instanceId === selectedComponentId.value) {
      selectedComponentData.value = parse(data)
      selectedComponentPendingId = null
    }
  })
}

function addToComponentsMap (instance) {
  componentsMap[instance.id] = instance
  if (instance.children) {
    instance.children.forEach(c => {
      componentsParent[c.id] = instance.id
      addToComponentsMap(c)
    })
  }
}

function getPath (instanceId) {
  const path = [instanceId]
  const parentId = componentsParent[instanceId]
  if (parentId) {
    path.unshift(...getPath(parentId))
  }
  return path
}
