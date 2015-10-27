import { EventEmitter } from 'events'

export default class Bridge extends EventEmitter {
  constructor (wall) {
    super()
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
   * Sugar for sending a message
   */

  message (message) {
    this.wall.send({
      event: 'message',
      payload: message
    })
  }

  log (message) {
    this.wall.send({
      event: 'log',
      payload: message
    })
  }
}
