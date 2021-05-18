import { camelize, getComponentName, getCustomRefDetails, has, set } from '@vue-devtools/shared-utils'
import { ComponentState, HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { functionalVnodeMap, instanceMap } from './tree'

/**
 * Get the detailed information of an inspected instance.
 */
export function getInstanceDetails (instance): InspectedComponentData {
  if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
    const vnode = findInstanceOrVnode(instance.__VUE_DEVTOOLS_UID__)

    if (!vnode) return null

    const fakeInstance = {
      $options: vnode.fnOptions,
      ...(vnode.devtoolsMeta?.renderContext.props)
    }

    if (!fakeInstance.$options.props && vnode.devtoolsMeta?.renderContext.props) {
      fakeInstance.$options.props = Object.keys(vnode.devtoolsMeta.renderContext.props).reduce((obj, key) => {
        obj[key] = {}
        return obj
      }, {})
    }

    const data = {
      id: instance.__VUE_DEVTOOLS_UID__,
      name: getComponentName(vnode.fnOptions),
      file: instance.type ? instance.type.__file : vnode.fnOptions.__file || null,
      state: getFunctionalInstanceState(fakeInstance),
      functional: true
    }

    return data
  }

  const data: InspectedComponentData = {
    id: instance.__VUE_DEVTOOLS_UID__,
    name: getInstanceName(instance),
    state: getInstanceState(instance),
    file: null
  }

  let i
  if ((i = instance.$vnode) && (i = i.componentOptions) && (i = i.Ctor) && (i = i.options)) {
    data.file = i.__file || null
  }

  return data
}

function getInstanceState (instance): ComponentState[] {
  return processProps(instance).concat(
    processState(instance),
    processRefs(instance),
    processComputed(instance),
    processInjected(instance),
    processRouteContext(instance),
    processVuexGetters(instance),
    processFirebaseBindings(instance),
    processObservables(instance),
    processAttrs(instance)
  )
}

function getFunctionalInstanceState (instance): ComponentState[] {
  return processProps(instance)
}

export function getCustomInstanceDetails (instance) {
  const state = getInstanceState(instance)
  return {
    _custom: {
      type: 'component',
      id: instance.__VUE_DEVTOOLS_UID__,
      display: getInstanceName(instance),
      tooltip: 'Component instance',
      value: reduceStateList(state),
      fields: {
        abstract: true
      }
    }
  }
}

export function reduceStateList (list) {
  if (!list.length) {
    return undefined
  }
  return list.reduce((map, item) => {
    const key = item.type || 'data'
    const obj = map[key] = map[key] || {}
    obj[item.key] = item.value
    return map
  }, {})
}

/**
 * Get the appropriate display name for an instance.
 */
export function getInstanceName (instance): string {
  const name = getComponentName(instance.$options || instance.fnOptions || {})
  if (name) return name
  return instance.$root === instance
    ? 'Root'
    : 'Anonymous Component'
}

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 */
function processProps (instance): ComponentState[] {
  const props = instance.$options.props
  const propsData = []
  for (let key in props) {
    const prop = props[key]
    key = camelize(key)
    propsData.push({
      type: 'props',
      key,
      value: instance[key],
      meta: prop
        ? {
            type: prop.type ? getPropType(prop.type) : 'any',
            required: !!prop.required
          }
        : {
            type: 'invalid'
          },
      editable: SharedData.editableProps
    })
  }
  return propsData
}

function processAttrs (instance): ComponentState[] {
  return Object.entries(instance.$attrs || {}).map(([key, value]) => {
    return {
      type: '$attrs',
      key,
      value
    }
  })
}

const fnTypeRE = /^(?:function|class) (\w+)/

/**
 * Convert prop type constructor to string.
 */
function getPropType (type) {
  if (Array.isArray(type)) {
    return type.map(t => getPropType(t)).join(' or ')
  }
  const match = type.toString().match(fnTypeRE)
  return typeof type === 'function'
    ? (match && match[1]) || 'any'
    : 'any'
}

/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 */
function processState (instance): ComponentState[] {
  const props = instance.$options.props
  const getters =
    instance.$options.vuex &&
    instance.$options.vuex.getters
  return Object.keys(instance._data)
    .filter(key => (
      !(props && key in props) &&
      !(getters && key in getters)
    ))
    .map(key => ({
      key,
      type: 'data',
      value: instance._data[key],
      editable: true
    }))
}

/**
 * Process refs
 */
function processRefs (instance): ComponentState[] {
  return Object.keys(instance.$refs)
    .filter(key => instance.$refs[key])
    .map(key => getCustomRefDetails(instance, key, instance.$refs[key]))
}

/**
 * Process the computed properties of an instance.
 */
function processComputed (instance): ComponentState[] {
  const computed = []
  const defs = instance.$options.computed || {}
  // use for...in here because if 'computed' is not defined
  // on component, computed properties will be placed in prototype
  // and Object.keys does not include
  // properties from object's prototype
  for (const key in defs) {
    const def = defs[key]
    const type = typeof def === 'function' && def.vuex
      ? 'vuex bindings'
      : 'computed'
    // use try ... catch here because some computed properties may
    // throw error during its evaluation
    let computedProp = null
    try {
      computedProp = {
        type,
        key,
        value: instance[key]
      }
    } catch (e) {
      computedProp = {
        type,
        key,
        value: e
      }
    }

    computed.push(computedProp)
  }

  return computed
}

/**
 * Process Vuex getters.
 */
function processInjected (instance): ComponentState[] {
  const injected = instance.$options.inject

  if (injected) {
    return Object.keys(injected).map(key => {
      return {
        key,
        type: 'injected',
        value: instance[key]
      }
    })
  } else {
    return []
  }
}

/**
 * Process possible vue-router $route context
 */
function processRouteContext (instance): ComponentState[] {
  try {
    const route = instance.$route
    if (route) {
      const { path, query, params } = route
      const value: any = { path, query, params }
      if (route.fullPath) value.fullPath = route.fullPath
      if (route.hash) value.hash = route.hash
      if (route.name) value.name = route.name
      if (route.meta) value.meta = route.meta
      return [{
        key: '$route',
        type: 'route',
        value: {
          _custom: {
            type: 'router',
            abstract: true,
            value
          }
        }
      }]
    }
  } catch (e) {
    // Invalid $router
  }
  return []
}

/**
 * Process Vuex getters.
 */
function processVuexGetters (instance): ComponentState[] {
  const getters =
    instance.$options.vuex &&
    instance.$options.vuex.getters
  if (getters) {
    return Object.keys(getters).map(key => {
      return {
        type: 'vuex getters',
        key,
        value: instance[key]
      }
    })
  } else {
    return []
  }
}

/**
 * Process Firebase bindings.
 */
function processFirebaseBindings (instance): ComponentState[] {
  const refs = instance.$firebaseRefs
  if (refs) {
    return Object.keys(refs).map(key => {
      return {
        type: 'firebase bindings',
        key,
        value: instance[key]
      }
    })
  } else {
    return []
  }
}

/**
 * Process vue-rx observable bindings.
 */
function processObservables (instance): ComponentState[] {
  const obs = instance.$observables
  if (obs) {
    return Object.keys(obs).map(key => {
      return {
        type: 'observables',
        key,
        value: instance[key]
      }
    })
  } else {
    return []
  }
}

export function findInstanceOrVnode (id) {
  if (/:functional:/.test(id)) {
    const [refId] = id.split(':functional:')
    const map = functionalVnodeMap.get(refId)
    return map && map[id]
  }
  return instanceMap.get(id)
}

export function editState ({ componentInstance, path, state, type }: HookPayloads[Hooks.EDIT_COMPONENT_STATE]) {
  if (!['data', 'props', 'computed', 'setup'].includes(type)) return
  const data = has(componentInstance._props, path, !!state.newKey)
    ? componentInstance._props
    : componentInstance._data
  set(data, path, state.value, (obj, field, value) => {
    if (state.remove || state.newKey) componentInstance.$delete(obj, field)
    if (!state.remove) componentInstance.$set(obj, state.newKey || field, value)
  })
}
