import { BackendContext } from '@vue-devtools/app-backend-api'
import { getInstanceName, getUniqueComponentId } from './util'
import { camelize, get, set } from '@vue-devtools/shared-utils'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api'

/**
 * Get the detailed information of an inspected instance.
 */
export async function getInstanceDetails (instance: any, ctx: BackendContext): Promise<InspectedComponentData> {
  console.log(instance)
  return {
    id: getUniqueComponentId(instance, ctx),
    name: getInstanceName(instance),
    file: instance.type?.__file,
    state: await getInstanceState(instance)
  }
}

async function getInstanceState (instance) {
  return processProps(instance).concat(
    processState(instance),
    processSetupState(instance),
    processComputed(instance),
    processAttrs(instance),
    processProvide(instance),
    processInject(instance),
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
      value: instance.props[key],
      meta: propDefinition ? {
        type: propDefinition.type ? getPropType(propDefinition.type) : 'any',
        required: !!propDefinition.required,
        ...propDefinition.default != null ? {
          default: propDefinition.default.toString()
        } : {}
      } : {
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
      value: data[key],
      editable: true
    }))
}

function processSetupState (instance) {
  const raw = instance.devtoolsRawSetupState || {}
  return Object.keys(instance.setupState)
    .map(key => ({
      key,
      type: 'setup',
      value: instance.setupState[key],
      ...getSetupStateExtra(raw[key])
    }))
}

function getSetupStateExtra (raw) {
  if (!raw) return {}

  const info = getSetupStateInfo(raw)

  const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null

  return {
    ...objectType ? { objectType } : {},
    ...raw.effect ? { raw: raw.effect.raw.toString() } : {},
    editable: (info.ref || info.computed || info.reactive) && !info.readonly
  }
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
function processComputed (instance) {
  const type = instance.type
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
    // use try ... catch here because some computed properties may
    // throw error during its evaluation
    let computedProp = null
    try {
      computedProp = {
        type,
        key,
        value: instance.proxy[key]
      }
    } catch (e) {
      computedProp = {
        type,
        key,
        value: '(error during evaluation)'
      }
    }

    computed.push(computedProp)
  }

  return computed
}

function processAttrs (instance) {
  return Object.keys(instance.attrs)
    .map(key => ({
      type: 'attrs',
      key,
      value: instance.attrs[key]
    }))
}

function processProvide (instance) {
  return Object.keys(instance.provides)
    .map(key => ({
      type: 'provided',
      key,
      value: instance.provides[key]
    }))
}

function processInject (instance) {
  if (!instance.type || !instance.type.inject) return []
  let keys = []
  if (Array.isArray(instance.type.inject)) {
    keys = instance.type.inject.map(key => ({
      key,
      originalKey: key
    }))
  } else {
    keys = Object.keys(instance.type.inject).map(key => {
      const value = instance.type.inject[key]
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
    value: instance.ctx[key]
  }))
}

function processRefs (instance) {
  return Object.keys(instance.refs)
    .map(key => ({
      type: 'refs',
      key,
      value: instance.refs[key]
    }))
}

export function editState ({ componentInstance, path, state }: HookPayloads[Hooks.EDIT_COMPONENT_STATE], ctx: BackendContext) {
  let target: any
  const targetPath: string[] = path.slice()

  if (Object.keys(componentInstance.data).includes(path[0])) {
    // Data
    target = componentInstance.data
  } else if (Object.keys(componentInstance.props).includes(path[0])) {
    // Props
    target = componentInstance.props
  } else if (Object.keys(componentInstance.devtoolsRawSetupState).includes(path[0])) {
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
