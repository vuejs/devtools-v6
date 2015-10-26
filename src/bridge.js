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

  send (message) {
    this.wall.send(message)
  }
}
