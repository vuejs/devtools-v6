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
   * Send a generic obj in the format of { event: String, payload: * }
   */

  send (obj) {
    this.wall.send(obj)
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
}
