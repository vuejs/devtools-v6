import { EventEmitter } from 'events'

const BATCH_DURATION = 200

export default class Bridge extends EventEmitter {
  constructor (wall) {
    super()
    this.setMaxListeners(Infinity)
    this.wall = wall
    wall.listen(messages => {
      if (Array.isArray(messages)) {
        messages.forEach(message => this._emit(message))
      } else {
        this._emit(messages)
      }
    })
    this._queue = []
    this._time = null
  }

  /**
   * Send an event.
   *
   * @param {String} event
   * @param {*} payload
   */

  send (event, payload) {
    if (this._time === null) {
      this.wall.send([{ event, payload }])
      this._time = Date.now()
    } else {
      this._queue.push({
        event,
        payload
      })

      const now = Date.now()
      if (now - this._time > BATCH_DURATION) {
        this._flush()
      } else {
        this._timer = setTimeout(() => this._flush(), BATCH_DURATION)
      }
    }
  }

  /**
   * Log a message to the devtools background page.
   *
   * @param {String} message
   */

  log (message) {
    this.send('log', message)
  }

  _flush () {
    if (this._queue.length) this.wall.send(this._queue)
    clearTimeout(this._timer)
    this._queue = []
    this._time = null
  }

  _emit (message) {
    if (typeof message === 'string') {
      this.emit(message)
    } else {
      this.emit(message.event, message.payload)
    }
  }
}
