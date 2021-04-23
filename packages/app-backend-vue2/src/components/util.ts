import { getComponentName } from '@vue-devtools/shared-utils'

export function isBeingDestroyed (instance) {
  return instance._isBeingDestroyed
}

/**
 * Get the appropriate display name for an instance.
 */
export function getInstanceName (instance) {
  const name = getComponentName(instance.$options || instance.fnOptions || {})
  if (name) return name
  return instance.$root === instance
    ? 'Root'
    : 'Anonymous Component'
}

export function getRenderKey (value): string {
  if (value == null) return
  const type = typeof value
  if (type === 'number') {
    return value.toString()
  } else if (type === 'string') {
    return `'${value}'`
  } else if (Array.isArray(value)) {
    return 'Array'
  } else {
    return 'Object'
  }
}

/**
 * Returns a devtools unique id for instance.
 */
export function getUniqueId (instance): string {
  if (instance.__VUE_DEVTOOLS_UID__ != null) return instance.__VUE_DEVTOOLS_UID__
  const rootVueId = instance.$root.__VUE_DEVTOOLS_ROOT_UID__
  return `${rootVueId}:${instance._uid}`
}
