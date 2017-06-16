import { EventEmitter } from 'events'

export default class Bridge extends EventEmitter {
  constructor (wall) {
    super()
    // Setting `this` to `self` here to fix an error in the Safari build:
    // ReferenceError: Cannot access uninitialized variable.
    // The error might be related to the webkit bug here:
    // https://bugs.webkit.org/show_bug.cgi?id=171543
    const self = this
    self.setMaxListeners(Infinity)
    self.wall = wall
    wall.listen(message => {
      if (typeof message === 'string') {
        self.emit(message)
      } else {
        self.emit(message.event, message.payload)
      }
    })
  }

  /**
   * Send an event.
   *
   * @param {String} event
   * @param {*} payload
   */

  send (event, payload) {
    this.wall.send({
      event,
      payload
    })
  }

  /**
   * Log a message to the devtools background page.
   *
   * @param {String} message
   */

  log (message) {
    this.send('log', message)
  }
}
