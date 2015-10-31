import { EventEmitter } from 'events'

export default class Bridge extends EventEmitter {
  constructor (wall) {
    super()
    this.setMaxListeners(Infinity)
    this.wall = wall
    wall.listen(message => {
      if (typeof message === 'string') {
        this.emit(message)
      } else {
        this.emit(message.event, message.payload)
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
