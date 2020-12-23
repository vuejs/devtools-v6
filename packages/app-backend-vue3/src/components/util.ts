import { classify } from '@vue-devtools/shared-utils'
import { basename } from '../util'
import { BackendContext } from '@vue-devtools/app-backend-api'

export function isBeingDestroyed (instance) {
  return instance._isBeingDestroyed || instance.isUnmounted
}

export function getAppRecord (instance) {
  if (instance.root) {
    return instance.appContext.app.__VUE_DEVTOOLS_APP_RECORD__
  }
}

export function isFragment (instance) {
  const appRecord = getAppRecord(instance)
  if (appRecord) {
    return appRecord.options.types.Fragment === instance.subTree.type
  }
}

/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
export function getInstanceName (instance) {
  const name = getComponentTypeName(instance.type || {})
  if (name) return name
  return instance.root === instance
    ? 'Root'
    : 'Anonymous Component'
}

function getComponentTypeName (options) {
  const name = options.name || options._componentTag
  if (name) {
    return name
  }
  const file = options.__file // injected by vue-loader
  if (file) {
    return classify(basename(file, '.vue'))
  }
}

/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
export function getUniqueComponentId (instance, ctx: BackendContext) {
  const instanceId = instance === ctx.currentAppRecord.rootInstance ? 'root' : instance.uid
  return `${ctx.currentAppRecord.id}:${instanceId}`
}

export function getRenderKey (value): string {
  if (value == null) return
  const type = typeof value
  if (type === 'number') {
    return value
  } else if (type === 'string') {
    return `'${value}'`
  } else if (Array.isArray(value)) {
    return 'Array'
  } else {
    return 'Object'
  }
}
