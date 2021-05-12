import { EventEmitter } from 'events'

const BATCH_DURATION = 100

export class Bridge extends EventEmitter {
  wall: any // @TODO
  _batchingQueue: any[] // @TODO
  _sendingQueue: any[][] // @TODO
  _receivingQueue: any[] // @TODO
  _sending: boolean
  _time: number
  _timer: NodeJS.Timeout

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
    this._batchingQueue = []
    this._sendingQueue = []
    this._receivingQueue = []
    this._sending = false
    this._time = null
  }

  send (event: string, payload?: any) {
    if (Array.isArray(payload)) {
      const lastIndex = payload.length - 1
      payload.forEach((chunk, index) => {
        this._send({
          event,
          _chunk: chunk,
          last: index === lastIndex
        })
      })
      this._flush()
    } else if (this._time === null) {
      this._send([{ event, payload }])
      this._time = Date.now()
    } else {
      this._batchingQueue.push({
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
   */

  log (message: string) {
    this.send('log', message)
  }

  _flush () {
    if (this._batchingQueue.length) this._send(this._batchingQueue)
    clearTimeout(this._timer)
    this._batchingQueue = []
    this._time = null
  }

  // @TODO types
  _emit (message) {
    if (typeof message === 'string') {
      this.emit(message)
    } else if (message._chunk) {
      this._receivingQueue.push(message._chunk)
      if (message.last) {
        this.emit(message.event, this._receivingQueue)
        this._receivingQueue = []
      }
    } else if (message.event) {
      this.emit(message.event, message.payload)
    }
  }

  // @TODO types
  _send (messages) {
    this._sendingQueue.push(messages)
    this._nextSend()
  }

  _nextSend () {
    if (!this._sendingQueue.length || this._sending) return
    this._sending = true
    const messages = this._sendingQueue.shift()
    try {
      this.wall.send(messages)
    } catch (err) {
      if (err.message === 'Message length exceeded maximum allowed length.') {
        this._sendingQueue.splice(0, 0, messages.map(message => [message]))
      }
    }
    this._sending = false
    requestAnimationFrame(() => this._nextSend())
  }
}
