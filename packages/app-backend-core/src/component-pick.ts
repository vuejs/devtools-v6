import { isBrowser, BridgeEvents } from '@vue-devtools/shared-utils'
import { BackendContext } from '@vue-devtools/app-backend-api'
import { highlight, unHighlight } from './highlighter'
import { ComponentInstance } from '@vue/devtools-api'

export default class ComponentPicker {
  ctx: BackendContext
  selectedInstance: ComponentInstance

  constructor (ctx: BackendContext) {
    this.ctx = ctx
    this.bindMethods()
  }

  /**
   * Adds event listeners for mouseover and mouseup
   */
  startSelecting () {
    if (!isBrowser) return
    window.addEventListener('mouseover', this.elementMouseOver, true)
    window.addEventListener('click', this.elementClicked, true)
    window.addEventListener('mouseout', this.cancelEvent, true)
    window.addEventListener('mouseenter', this.cancelEvent, true)
    window.addEventListener('mouseleave', this.cancelEvent, true)
    window.addEventListener('mousedown', this.cancelEvent, true)
    window.addEventListener('mouseup', this.cancelEvent, true)
  }

  /**
   * Removes event listeners
   */
  stopSelecting () {
    if (!isBrowser) return
    window.removeEventListener('mouseover', this.elementMouseOver, true)
    window.removeEventListener('click', this.elementClicked, true)
    window.removeEventListener('mouseout', this.cancelEvent, true)
    window.removeEventListener('mouseenter', this.cancelEvent, true)
    window.removeEventListener('mouseleave', this.cancelEvent, true)
    window.removeEventListener('mousedown', this.cancelEvent, true)
    window.removeEventListener('mouseup', this.cancelEvent, true)

    unHighlight()
  }

  /**
   * Highlights a component on element mouse over
   */
  async elementMouseOver (e: MouseEvent) {
    this.cancelEvent(e)

    const el = e.target
    if (el) {
      this.selectedInstance = await this.ctx.api.getElementComponent(el)
    }

    unHighlight()
    if (this.selectedInstance) {
      highlight(this.selectedInstance, this.ctx)
    }
  }

  /**
   * Selects an instance in the component view
   */
  async elementClicked (e: MouseEvent) {
    this.cancelEvent(e)

    if (this.selectedInstance) {
      const parentInstances = await this.ctx.api.walkComponentParents(this.selectedInstance)
      this.ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_PICK, { id: this.selectedInstance.__VUE_DEVTOOLS_UID__, parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__) })
    } else {
      this.ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_PICK_CANCELED, null)
    }

    this.stopSelecting()
  }

  /**
   * Cancel a mouse event
   */
  cancelEvent (e: MouseEvent) {
    e.stopImmediatePropagation()
    e.preventDefault()
  }

  /**
   * Bind class methods to the class scope to avoid rebind for event listeners
   */
  bindMethods () {
    this.startSelecting = this.startSelecting.bind(this)
    this.stopSelecting = this.stopSelecting.bind(this)
    this.elementMouseOver = this.elementMouseOver.bind(this)
    this.elementClicked = this.elementClicked.bind(this)
  }
}
