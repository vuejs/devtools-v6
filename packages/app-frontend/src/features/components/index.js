import { ref, computed, watch } from '@vue/composition-api'
import Vue from 'vue'
import groupBy from 'lodash/groupBy'
import { BridgeEvents, parse, sortByKey, searchDeepInObject } from '@vue-devtools/shared-utils'
import { useBridge } from '../bridge'
import { useRoute, useRouter } from '@front/util/router'

const rootInstances = ref([])
let componentsMap = {}
const selectedComponentId = ref(null)
const selectedComponentData = ref(null)
const selectedComponentStateFilter = ref('')
let selectedComponentPendingId = null
let lastSelectedApp = null
const expandedMap = ref({})

export function useComponents () {
  const { bridge, onBridge } = useBridge()
  const route = useRoute()
  const router = useRouter()

  function requestComponentTree (instanceId = null) {
    if (!instanceId) {
      resetComponents()
      instanceId = '_root'
    }
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_TREE, instanceId)
  }

  function selectComponent (id) {
    if (selectedComponentId.value !== id) {
      router.push({
        params: {
          componentId: id
        }
      })
    } else {
      loadComponent(id)
    }
  }

  function loadComponent (id) {
    if (selectedComponentPendingId === id) return
    selectedComponentPendingId = id
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, id)
  }

  watch(() => route.value.params.componentId, value => {
    selectedComponentId.value = value
    loadComponent(value)
  }, {
    immediate: true
  })

  const selectedComponentState = computed(() => selectedComponentData.value ? groupBy(sortByKey(selectedComponentData.value.state.filter(el => {
    return searchDeepInObject({
      [el.key]: el.value
    }, selectedComponentStateFilter.value)
  })), 'type') : ({}))

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
    if (lastSelectedApp !== null) {
      selectComponent(lastInspectedComponentId)
    }
    lastSelectedApp = id
  })

  return {
    rootInstances: computed(() => rootInstances.value),
    selectedComponentId: computed(() => selectedComponentId.value),
    selectedComponentData: computed(() => selectedComponentData.value),
    selectedComponentState,
    selectedComponentStateFilter,
    requestComponentTree,
    selectComponent
  }
}

export function useComponent (instance) {
  const { selectComponent, requestComponentTree } = useComponents()

  const isExpanded = computed(() => !!expandedMap.value[instance.value.id])

  function toggleExpand () {
    if (!instance.value.hasChildren) return
    Vue.set(expandedMap.value, instance.value.id, !isExpanded.value)

    if (!instance.value.children || !instance.value.children.length) {
      requestComponentTree(instance.value.id)
    }
  }

  const isSelected = computed(() => selectedComponentId.value === instance.value.id)

  function select () {
    selectComponent(instance.value.id)
  }

  return {
    isExpanded,
    toggleExpand,
    isSelected,
    select
  }
}

export function resetComponents () {
  rootInstances.value = []
  componentsMap = {}
  expandedMap.value = {}
}

export function setupComponentsBridgeEvents (bridge) {
  bridge.on(BridgeEvents.TO_FRONT_COMPONENT_TREE, ({ instanceId, treeData }) => {
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
    instance.children.forEach(c => addToComponentsMap(c))
  }
}
