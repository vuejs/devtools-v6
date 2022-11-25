import { camelize, getComponentName, getCustomRefDetails, StateEditor, SharedData } from '@vue-devtools/shared-utils'
import { ComponentState, CustomState, HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api'
import { functionalVnodeMap, instanceMap } from './tree'
import 'core-js/modules/es.object.entries'

/**
 * Get the detailed information of an inspected instance.
 */
export function getInstanceDetails (instance): InspectedComponentData {
  if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
    const vnode = findInstanceOrVnode(instance.__VUE_DEVTOOLS_UID__)

    if (!vnode) return null

    const fakeInstance = {
      $options: vnode.fnOptions,
      ...(vnode.devtoolsMeta?.renderContext.props),
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
      functional: true,
    }

    return data
  }

  const data: InspectedComponentData = {
    id: instance.__VUE_DEVTOOLS_UID__,
    name: getInstanceName(instance),
    state: getInstanceState(instance),
    file: null,
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
    processSetupState(instance),
    processRefs(instance),
    processComputed(instance),
    processInjected(instance),
    processRouteContext(instance),
    processVuexGetters(instance),
    processFirebaseBindings(instance),
    processObservables(instance),
    processAttrs(instance),
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
        abstract: true,
      },
    },
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
            required: !!prop.required,
          }
        : {
            type: 'invalid',
          },
      editable: SharedData.editableProps,
    })
  }
  return propsData
}

function processAttrs (instance): ComponentState[] {
  return Object.entries(instance.$attrs || {}).map(([key, value]) => {
    return {
      type: '$attrs',
      key,
      value,
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
  if (type == null) {
    return 'null'
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
      editable: true,
    }))
}

function processSetupState (instance) {
  const state = instance._setupProxy || instance
  const raw = instance._setupState
  if (!raw) {
    return []
  }

  return Object.keys(raw)
    .filter(key => !key.startsWith('__'))
    .map(key => {
      const value = returnError(() => toRaw(state[key]))

      const rawData = raw[key]

      let result: any

      if (rawData) {
        const info = getSetupStateInfo(rawData)

        const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
        const isState = info.ref || info.computed || info.reactive
        const isOther = typeof value === 'function' || typeof value?.render === 'function'
        // effect is a Vue 2 Watcher instance
        const raw = rawData.effect?.expression || rawData.effect?.getter?.toString()

        result = {
          ...objectType ? { objectType } : {},
          ...raw ? { raw } : {},
          editable: isState && !info.readonly,
          type: isOther ? 'setup (other)' : 'setup',
        }
      } else {
        result = {
          type: 'setup',
        }
      }

      return {
        key,
        value,
        ...result,
      }
    })
}

function returnError (cb: () => any) {
  try {
    return cb()
  } catch (e) {
    return e
  }
}

function isRef (raw: any): boolean {
  return !!raw.__v_isRef
}

function isComputed (raw: any): boolean {
  return isRef(raw) && !!raw.effect
}

function isReactive (raw: any): boolean {
  return !!raw.__ob__
}

function isReadOnly (raw: any): boolean {
  return !!raw.__v_isReadonly
}

function toRaw (value: any) {
  if (value?.__v_raw) {
    return value.__v_raw
  }
  return value
}

function getSetupStateInfo (raw: any) {
  return {
    ref: isRef(raw),
    computed: isComputed(raw),
    reactive: isReactive(raw),
    readonly: isReadOnly(raw),
  }
}

export function getCustomObjectDetails (object: any, proto: string): CustomState | undefined {
  const info = getSetupStateInfo(object)

  const isState = info.ref || info.computed || info.reactive
  if (isState) {
    const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
    const value = toRaw(info.reactive ? object : object._value)
    const raw = object.effect?.raw?.toString() || object.effect?.fn?.toString()
    return {
      _custom: {
        type: objectType.toLowerCase(),
        objectType,
        value,
        ...raw ? { tooltip: `<span class="font-mono">${raw}</span>` } : {},
      },
    }
  }
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
        value: instance[key],
      }
    } catch (e) {
      computedProp = {
        type,
        key,
        value: e,
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
        value: instance[key],
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
            value,
          },
        },
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
        value: instance[key],
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
        value: instance[key],
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
        value: instance[key],
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

export function editState (
  {
    componentInstance,
    path,
    state,
    type,
  }: HookPayloads[Hooks.EDIT_COMPONENT_STATE],
  stateEditor: StateEditor,
) {
  if (!['data', 'props', 'computed', 'setup'].includes(type)) return

  let target: any
  const targetPath: string[] = path.slice()

  if (stateEditor.has(componentInstance._props, path, !!state.newKey)) {
    // props
    target = componentInstance._props
  } else if (
    componentInstance._setupState &&
    Object.keys(componentInstance._setupState).includes(path[0])
  ) {
    // setup
    target = componentInstance._setupProxy

    const currentValue = stateEditor.get(target, path)
    if (currentValue != null) {
      const info = getSetupStateInfo(currentValue)
      if (info.readonly) return
    }
  } else {
    target = componentInstance._data
  }

  stateEditor.set(
    target,
    targetPath,
    'value' in state ? state.value : undefined,
    stateEditor.createDefaultSetCallback(state),
  )
}
