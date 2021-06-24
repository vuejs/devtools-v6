import { classify } from '@vue-devtools/shared-utils'
import { getInstanceName } from './util'

export class ComponentFilter {
  filter: string

  constructor (filter: string) {
    this.filter = filter || ''
  }

  /**
   * Check if an instance is qualified.
   *
   * @param {Vue|Vnode} instance
   * @return {Boolean}
   */
  isQualified (instance) {
    const name = classify(getInstanceName(instance)).toLowerCase()
    return name.indexOf(this.filter) > -1
  }
}
