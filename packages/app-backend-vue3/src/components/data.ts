import type { BackendContext } from '@vue-devtools/app-backend-api'
import type { StateEditor } from '@vue-devtools/shared-utils'
import { SharedData, camelize, kebabize } from '@vue-devtools/shared-utils'
import type { ComponentInstance, CustomState, HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api'
import { returnError } from '../util'
import { getInstanceName, getUniqueComponentId } from './util'

const vueBuiltins = [
  'nextTick',
  'defineComponent',
  'defineAsyncComponent',
  'defineCustomElement',
  'ref',
  'computed',
  'reactive',
  'readonly',
  'watchEffect',
  'watchPostEffect',
  'watchSyncEffect',
  'watch',
  'isRef',
  'unref',
  'toRef',
  'toRefs',
  'isProxy',
  'isReactive',
  'isReadonly',
  'shallowRef',
  'triggerRef',
  'customRef',
  'shallowReactive',
  'shallowReadonly',
  'toRaw',
  'markRaw',
  'effectScope',
  'getCurrentScope',
  'onScopeDispose',
  'onMounted',
  'onUpdated',
  'onUnmounted',
  'onBeforeMount',
  'onBeforeUpdate',
  'onBeforeUnmount',
  'onErrorCaptured',
  'onRenderTracked',
  'onRenderTriggered',
  'onActivated',
  'onDeactivated',
  'onServerPrefetch',
  'provide',
  'inject',
  'h',
  'mergeProps',
  'cloneVNode',
  'isVNode',
  'resolveComponent',
  'resolveDirective',
  'withDirectives',
  'withModifiers',
]

/**
 * Get the detailed information of an inspected instance.
 */
export function getInstanceDetails(instance: any, ctx: BackendContext): InspectedComponentData {
  return {
    id: getUniqueComponentId(instance, ctx),
    name: getInstanceName(instance),
    file: instance.type?.__file,
    state: getInstanceState(instance),
  }
}

function getInstanceState(instance) {
  const mergedType = resolveMergedOptions(instance)
  return processProps(instance).concat(
    processState(instance),
    processSetupState(instance),
    processComputed(instance, mergedType),
    processAttrs(instance),
    processProvide(instance),
    processInject(instance, mergedType),
    processRefs(instance),
    processEventListeners(instance),
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
function processProps(instance) {
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
                  default: propDefinition.default.toString(),
                }
              : {},
          }
        : {
            type: 'invalid',
          },
      editable: SharedData.editableProps,
    })
  }
  return propsData
}

const fnTypeRE = /^(?:function|class) (\w+)/
/**
 * Convert prop type constructor to string.
 */
function getPropType(type) {
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
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processState(instance) {
  const type = instance.type
  const props = type.props
  const getters
    = type.vuex
    && type.vuex.getters
  const computedDefs = type.computed

  const data = {
    ...instance.data,
    ...instance.renderContext,
  }

  return Object.keys(data)
    .filter(key => (
      !(props && key in props)
      && !(getters && key in getters)
      && !(computedDefs && key in computedDefs)
    ))
    .map(key => ({
      key,
      type: 'data',
      value: returnError(() => data[key]),
      editable: true,
    }))
}

function processSetupState(instance) {
  const raw = instance.devtoolsRawSetupState
  const combinedSetupState = (Object.keys(instance.setupState).length
    ? instance.setupState
    : instance.exposed
  ) || {}

  return Object.keys(combinedSetupState)
    .filter(key => !vueBuiltins.includes(key) && key.split(/(?=[A-Z])/)[0] !== 'use')
    .map((key) => {
      const value = returnError(() => toRaw(combinedSetupState[key]))

      const rawData = raw[key]

      let result: any

      let isOther = typeof value === 'function'
        || typeof value?.render === 'function' // Components
        || typeof value?.__asyncLoader === 'function' // Components
        || (typeof value === 'object' && value && ('setup' in value || 'props' in value)) // Components
        || /^v[A-Z]/.test(key) // Directives

      if (rawData) {
        const info = getSetupStateInfo(rawData)

        const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
        const isState = info.ref || info.computed || info.reactive
        const raw = rawData.effect?.raw?.toString() || rawData.effect?.fn?.toString()

        if (objectType) {
          isOther = false
        }

        result = {
          ...objectType ? { objectType } : {},
          ...raw ? { raw } : {},
          editable: isState && !info.readonly,
        }
      }

      const type = isOther ? 'setup (other)' : 'setup'

      return {
        key,
        value,
        type,
        ...result,
      }
    })
}

function isRef(raw: any): boolean {
  return !!raw.__v_isRef
}

function isComputed(raw: any): boolean {
  return isRef(raw) && !!raw.effect
}

function isReactive(raw: any): boolean {
  return !!raw.__v_isReactive
}

function isReadOnly(raw: any): boolean {
  return !!raw.__v_isReadonly
}

function toRaw(value: any) {
  if (value?.__v_raw) {
    return value.__v_raw
  }
  return value
}

function getSetupStateInfo(raw: any) {
  return {
    ref: isRef(raw),
    computed: isComputed(raw),
    reactive: isReactive(raw),
    readonly: isReadOnly(raw),
  }
}

export function getCustomObjectDetails(object: any, _proto: string): CustomState | undefined {
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

  if (typeof object.__asyncLoader === 'function') {
    return {
      _custom: {
        type: 'component-definition',
        display: 'Async component definition',
      },
    }
  }
}

/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processComputed(instance, mergedType) {
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
      editable: typeof def.set === 'function',
    })
  }

  return computed
}

function processAttrs(instance) {
  return Object.keys(instance.attrs)
    .map(key => ({
      type: 'attrs',
      key,
      value: returnError(() => instance.attrs[key]),
    }))
}

function processProvide(instance) {
  return Reflect.ownKeys(instance.provides)
    .map(key => ({
      type: 'provided',
      key: key.toString(),
      value: returnError(() => instance.provides[key]),
    }))
}

function processInject(instance, mergedType) {
  if (!mergedType?.inject) {
    return []
  }
  let keys = []
  let defaultValue
  if (Array.isArray(mergedType.inject)) {
    keys = mergedType.inject.map(key => ({
      key,
      originalKey: key,
    }))
  }
  else {
    keys = Reflect.ownKeys(mergedType.inject).map((key) => {
      const value = mergedType.inject[key]
      let originalKey
      if (typeof value === 'string' || typeof value === 'symbol') {
        originalKey = value
      }
      else {
        originalKey = value.from
        defaultValue = value.default
      }
      return {
        key,
        originalKey,
      }
    })
  }
  return keys.map(({ key, originalKey }) => ({
    type: 'injected',
    key: originalKey && key !== originalKey ? `${originalKey.toString()} ➞ ${key.toString()}` : key.toString(),
    value: returnError(() => Object.prototype.hasOwnProperty.call(instance.ctx, key) ? instance.ctx[key] : Object.prototype.hasOwnProperty.call(instance.provides, originalKey) ? instance.provides[originalKey] : defaultValue),
  }))
}

function processRefs(instance) {
  return Object.keys(instance.refs)
    .map(key => ({
      type: 'refs',
      key,
      value: returnError(() => instance.refs[key]),
    }))
}

function processEventListeners(instance) {
  const emitsDefinition = instance.type.emits
  const declaredEmits = Array.isArray(emitsDefinition) ? emitsDefinition : Object.keys(emitsDefinition ?? {})
  const declaredEmitsMap = declaredEmits.reduce((emitsMap, key) => {
    emitsMap[kebabize(key)] = key
    return emitsMap
  }, {})
  const keys = Object.keys(instance.vnode.props ?? {})
  const result = []
  for (const key of keys) {
    const [prefix, ...eventNameParts] = key.split(/(?=[A-Z])/)
    if (prefix === 'on') {
      const eventName = eventNameParts.join('-').toLowerCase()
      const normalizedEventName = declaredEmitsMap[eventName]
      result.push({
        type: 'event listeners',
        key: normalizedEventName || eventName,
        value: {
          _custom: {
            display: normalizedEventName ? '✅ Declared' : '⚠️ Not declared',
            tooltip: !normalizedEventName ? `The event <code>${eventName}</code> is not declared in the <code>emits</code> option. It will leak into the component's attributes (<code>$attrs</code>).` : null,
          },
        },
      })
    }
  }
  return result
}

export function editState({ componentInstance, path, state, type }: HookPayloads[Hooks.EDIT_COMPONENT_STATE], stateEditor: StateEditor, _ctx: BackendContext) {
  if (!['data', 'props', 'computed', 'setup'].includes(type)) {
    return
  }
  let target: any
  const targetPath: string[] = path.slice()

  if (Object.keys(componentInstance.props).includes(path[0])) {
    // Props
    target = componentInstance.props
  }
  else if (componentInstance.devtoolsRawSetupState && Object.keys(componentInstance.devtoolsRawSetupState).includes(path[0])) {
    // Setup
    target = componentInstance.devtoolsRawSetupState

    const currentValue = stateEditor.get(componentInstance.devtoolsRawSetupState, path)
    if (currentValue != null) {
      const info = getSetupStateInfo(currentValue)
      if (info.readonly) {
        return
      }
    }
  }
  else {
    target = componentInstance.proxy
  }

  if (target && targetPath) {
    stateEditor.set(target, targetPath, 'value' in state ? state.value : undefined, stateEditor.createDefaultSetCallback(state))
  }
}

function reduceStateList(list) {
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

export function getCustomInstanceDetails(instance) {
  if (instance._) {
    instance = instance._
  }
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

function resolveMergedOptions(
  instance: ComponentInstance,
) {
  const raw = instance.type
  const { mixins, extends: extendsOptions } = raw
  const globalMixins = instance.appContext.mixins
  if (!globalMixins.length && !mixins && !extendsOptions) {
    return raw
  }
  const options = {}
  globalMixins.forEach(m => mergeOptions(options, m, instance))
  mergeOptions(options, raw, instance)
  return options
}

function mergeOptions(
  to: any,
  from: any,
  instance: ComponentInstance,
) {
  if (typeof from === 'function') {
    from = from.options
  }

  if (!from) {
    return to
  }

  const { mixins, extends: extendsOptions } = from

  extendsOptions && mergeOptions(to, extendsOptions, instance)
  mixins
  && mixins.forEach(m =>
    mergeOptions(to, m, instance),
  )

  for (const key of ['computed', 'inject']) {
    if (Object.prototype.hasOwnProperty.call(from, key)) {
      if (!to[key]) {
        to[key] = from[key]
      }
      else {
        to[key] = Object.assign(Object.create(null), to[key], from[key])
      }
    }
  }
  return to
}
