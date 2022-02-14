import { classify, kebabize } from '@vue-devtools/shared-utils'
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
    const name = getInstanceName(instance)
    return classify(name).toLowerCase().indexOf(this.filter) > -1 ||
      kebabize(name).toLowerCase().indexOf(this.filter) > -1
  }
}
