import { BackendContext } from '@vue-devtools/app-backend-api'
import { getInstanceName, getUniqueComponentId } from './util'
import { camelize, get, set } from '@vue-devtools/shared-utils'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { ComponentInstance, HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api'
import { returnError } from '../util'

/**
 * Get the detailed information of an inspected instance.
 */
export function getInstanceDetails (instance: any, ctx: BackendContext): InspectedComponentData {
  return {
    id: getUniqueComponentId(instance, ctx),
    name: getInstanceName(instance),
    file: instance.type?.__file,
    state: getInstanceState(instance)
  }
}

function getInstanceState (instance) {
  const mergedType = resolveMergedOptions(instance)
  return processProps(instance).concat(
    processState(instance),
    processSetupState(instance),
    processComputed(instance, mergedType),
    processAttrs(instance),
    processProvide(instance),
    processInject(instance, mergedType),
    processRefs(instance)
  )
}

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processProps (instance) {
  const propsData = []
  const propDefinitions = instance.type.props

  for (let key in instance.props) {
    const propDefinition = propDefinitions ? propDefinitions[key] : null
    key = camelize(key)
    propsData.push({
      type: 'props',
      key,
      value: returnError(() => instance.props[key]),
      meta: propDefinition
        ? {
            type: propDefinition.type ? getPropType(propDefinition.type) : 'any',
            required: !!propDefinition.required,
            ...propDefinition.default != null
              ? {
                  default: propDefinition.default.toString()
                }
              : {}
          }
        : {
            type: 'invalid'
          },
      editable: SharedData.editableProps
    })
  }
  return propsData
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
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processState (instance) {
  const type = instance.type
  const props = type.props
  const getters =
    type.vuex &&
    type.vuex.getters
  const computedDefs = type.computed

  const data = {
    ...instance.data,
    ...instance.renderContext
  }

  return Object.keys(data)
    .filter(key => (
      !(props && key in props) &&
      !(getters && key in getters) &&
      !(computedDefs && key in computedDefs)
    ))
    .map(key => ({
      key,
      type: 'data',
      value: returnError(() => data[key]),
      editable: true
    }))
}

function processSetupState (instance) {
  const raw = instance.devtoolsRawSetupState || {}
  return Object.keys(instance.setupState)
    .map(key => {
      const value = returnError(() => instance.setupState[key])

      const rawData = raw[key]

      let result: any

      if (rawData) {
        const info = getSetupStateInfo(rawData)

        const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
        const isState = info.ref || info.computed || info.reactive
        const isOther = typeof value === 'function' || typeof value?.render === 'function'

        result = {
          ...objectType ? { objectType } : {},
          ...raw.effect ? { raw: raw.effect.raw.toString() } : {},
          editable: isState && !info.readonly,
          type: isOther ? 'setup (other)' : 'setup'
        }
      } else {
        result = {
          type: 'setup'
        }
      }

      return {
        key,
        value,
        ...result
      }
    })
}

function isRef (raw: any): boolean {
  return !!raw.__v_isRef
}

function isComputed (raw: any): boolean {
  return isRef(raw) && !!raw.effect
}

function isReactive (raw: any): boolean {
  return !!raw.__v_isReactive
}

function isReadOnly (raw: any): boolean {
  return !!raw.__v_isReadonly
}

function getSetupStateInfo (raw: any) {
  return {
    ref: isRef(raw),
    computed: isComputed(raw),
    reactive: isReactive(raw),
    readonly: isReadOnly(raw)
  }
}

/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processComputed (instance, mergedType) {
  const type = mergedType
  const computed = []
  const defs = type.computed || {}
  // use for...in here because if 'computed' is not defined
  // on component, computed properties will be placed in prototype
  // and Object.keys does not include
  // properties from object's prototype
  for (const key in defs) {
    const def = defs[key]
    const type = typeof def === 'function' && def.vuex
      ? 'vuex bindings'
      : 'computed'
    computed.push({
      type,
      key,
      value: returnError(() => instance.proxy[key]),
      editable: typeof def.set === 'function'
    })
  }

  return computed
}

function processAttrs (instance) {
  return Object.keys(instance.attrs)
    .map(key => ({
      type: 'attrs',
      key,
      value: returnError(() => instance.attrs[key])
    }))
}

function processProvide (instance) {
  return Object.keys(instance.provides)
    .map(key => ({
      type: 'provided',
      key,
      value: returnError(() => instance.provides[key])
    }))
}

function processInject (instance, mergedType) {
  if (!mergedType?.inject) return []
  let keys = []
  if (Array.isArray(mergedType.inject)) {
    keys = mergedType.inject.map(key => ({
      key,
      originalKey: key
    }))
  } else {
    keys = Object.keys(mergedType.inject).map(key => {
      const value = mergedType.inject[key]
      let originalKey
      if (typeof value === 'string') {
        originalKey = value
      } else {
        originalKey = value.from
      }
      return {
        key,
        originalKey
      }
    })
  }
  return keys.map(({ key, originalKey }) => ({
    type: 'injected',
    key: originalKey && key !== originalKey ? `${originalKey} ➞ ${key}` : key,
    value: returnError(() => instance.ctx[key])
  }))
}

function processRefs (instance) {
  return Object.keys(instance.refs)
    .map(key => ({
      type: 'refs',
      key,
      value: returnError(() => instance.refs[key])
    }))
}

export function editState ({ componentInstance, path, state, type }: HookPayloads[Hooks.EDIT_COMPONENT_STATE], ctx: BackendContext) {
  if (!['data', 'props', 'computed', 'setup'].includes(type)) return
  let target: any
  const targetPath: string[] = path.slice()

  if (Object.keys(componentInstance.props).includes(path[0])) {
    // Props
    target = componentInstance.props
  } else if (componentInstance.devtoolsRawSetupState && Object.keys(componentInstance.devtoolsRawSetupState).includes(path[0])) {
    // Setup
    target = componentInstance.devtoolsRawSetupState

    const currentValue = get(componentInstance.devtoolsRawSetupState, path)
    if (currentValue != null) {
      const info = getSetupStateInfo(currentValue)

      if (info.readonly) return
      if (info.ref) {
        targetPath.splice(1, 0, 'value')
      }
    }
  } else {
    target = componentInstance.proxy
  }

  if (target && targetPath) {
    set(target, targetPath, 'value' in state ? state.value : undefined, (obj, field, value) => {
      if (state.remove || state.newKey) {
        if (Array.isArray(obj)) {
          obj.splice(field, 1)
        } else {
          delete obj[field]
        }
      }
      if (!state.remove) {
        obj[state.newKey || field] = value
      }
    })
  }
}

function reduceStateList (list) {
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

export function getCustomInstanceDetails (instance) {
  if (instance._) instance = instance._
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

function resolveMergedOptions (
  instance: ComponentInstance
) {
  const raw = instance.type
  const { mixins, extends: extendsOptions } = raw
  const globalMixins = instance.appContext.mixins
  if (!globalMixins.length && !mixins && !extendsOptions) return raw
  const options = {}
  globalMixins.forEach(m => mergeOptions(options, m, instance))
  mergeOptions(options, raw, instance)
  return options
}

function mergeOptions (
  to: any,
  from: any,
  instance: ComponentInstance
) {
  if (!from) return to

  if (typeof from === 'function') {
    from = from.options
  }

  const { mixins, extends: extendsOptions } = from

  extendsOptions && mergeOptions(to, extendsOptions, instance)
  mixins &&
    mixins.forEach((m) =>
      mergeOptions(to, m, instance)
    )

  for (const key of ['computed', 'inject']) {
    if (Object.prototype.hasOwnProperty.call(from, key)) {
      if (!to[key]) {
        to[key] = from[key]
      } else {
        Object.assign(to[key], from[key])
      }
    }
  }
  return to
}
