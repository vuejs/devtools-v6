import { classify } from '@vue-devtools/shared-utils'
import { getInstanceName } from './util'

let filter = ''

export function getComponentFilter () {
  return filter
}

export function setComponentFilter (f) {
  filter = f
}

/**
 * Check if an instance is qualified.
 *
 * @param {Vue|Vnode} instance
 * @return {Boolean}
 */
export function isQualified (instance) {
  const name = classify(instance.name || getInstanceName(instance)).toLowerCase()
  return name.indexOf(filter) > -1
}
