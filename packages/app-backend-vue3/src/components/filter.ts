import { classify, kebabize } from '@vue-devtools/shared-utils'
import { getInstanceName } from './util'

export class ComponentFilter {
  filter: string

  constructor(filter: string) {
    this.filter = filter || ''
  }

  /**
   * Check if an instance is qualified.
   *
   * @param {Vue|Vnode} instance
   * @return {boolean}
   */
  isQualified(instance) {
    const name = getInstanceName(instance)
    return classify(name).toLowerCase().includes(this.filter)
      || kebabize(name).toLowerCase().includes(this.filter)
  }
}
