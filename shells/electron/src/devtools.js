import { initDevTools } from 'src/devtools'
import Bridge from 'src/bridge'
import io from 'socket.io-client'

const socket = io('http://localhost:8098')

initDevTools({
  connect (callback) {
    const wall = {
      listen (fn) {
        socket.on('vue-message', data => fn(data))
      },
      send (data) {
        console.log('devtools -> backend', data)
        socket.emit('vue-message', data)
      }
    }
    const bridge = new Bridge(wall)

    callback(bridge)
  },
  onReload (fn) {
    console.log('onReload has been called')
  }
})
