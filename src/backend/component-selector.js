import { highlight, unHighlight } from './highlighter'
import { findRelatedComponent } from './utils'

export default class ComponentSelector {
  constructor (bridge, instanceMap) {
    const self = this
    self.bridge = bridge
    self.instanceMap = instanceMap
    self.bindMethods()

    bridge.on('start-component-selector', self.startSelecting)
    bridge.on('stop-component-selector', self.stopSelecting)
  }

  /**
   * Adds event listeners for mouseover and mouseup
   */
  startSelecting () {
    document.body.addEventListener('mouseover', this.elementMouseOver, true)
    document.body.addEventListener('click', this.elementClicked, true)
    document.body.addEventListener('mouseout', this.cancelEvent, true)
    document.body.addEventListener('mouseenter', this.cancelEvent, true)
    document.body.addEventListener('mouseleave', this.cancelEvent, true)
    document.body.addEventListener('mousedown', this.cancelEvent, true)
    document.body.addEventListener('mouseup', this.cancelEvent, true)
  }

  /**
   * Removes event listeners
   */
  stopSelecting () {
    document.body.removeEventListener('mouseover', this.elementMouseOver, true)
    document.body.removeEventListener('click', this.elementClicked, true)
    document.body.removeEventListener('mouseout', this.cancelEvent, true)
    document.body.removeEventListener('mouseenter', this.cancelEvent, true)
    document.body.removeEventListener('mouseleave', this.cancelEvent, true)
    document.body.removeEventListener('mousedown', this.cancelEvent, true)
    document.body.removeEventListener('mouseup', this.cancelEvent, true)

    unHighlight()
  }

  /**
   * Highlights a component on element mouse over
   * @param {MouseEvent} e
   */
  elementMouseOver (e) {
    this.cancelEvent(e)

    const el = e.target
    if (el) {
      this.selectedInstance = findRelatedComponent(el)
    }

    unHighlight()
    if (this.selectedInstance) {
      highlight(this.selectedInstance)
    }
  }

  /**
   * Selects an instance in the component view
   * @param {MouseEvent} e
   */
  elementClicked (e) {
    this.cancelEvent(e)

    if (this.selectedInstance) {
      this.bridge.send('inspect-instance', this.selectedInstance.__VUE_DEVTOOLS_UID__)
    }

    this.stopSelecting()
  }

  /**
   * Cancel a mouse event
   * @param {MouseEvent} e
   */
  cancelEvent (e) {
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
