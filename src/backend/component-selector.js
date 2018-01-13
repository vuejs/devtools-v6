import { highlight, unHighlight } from './highlighter'

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
    document.body.addEventListener('mouseover', this.elementMouseOver)
    document.body.addEventListener('mouseup', this.elementClicked)
  }

  /**
   * Removes event listeners
   */
  stopSelecting () {
    document.body.removeEventListener('mouseover', this.elementMouseOver)
    document.body.removeEventListener('mouseup', this.elementClicked)

    unHighlight()
  }

  /**
   * Highlights a component on element mouse over
   * @param {MouseEvent} e
   */
  elementMouseOver (e) {
    this.instanceMap.forEach(instance => {
      if (instance.$el.isSameNode(e.target)) {
        this.selectedInstance = instance

        return
      }

      if (instance.$el.contains(e.target) && (!this.selectedInstance || !instance.$el.contains(this.selectedInstance.$el))) {
        this.selectedInstance = instance
      }
    })

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
    e.preventDefault()

    if (this.selectedInstance) {
      this.bridge.send('inspect-instance', this.selectedInstance.__VUE_DEVTOOLS_UID__)
    }

    this.bridge.send('component-selected')
    this.stopSelecting()
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
