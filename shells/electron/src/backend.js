import io from 'socket.io-client'
import { initBackend } from 'src/backend'
import Bridge from 'src/bridge'

(function () {
  const port = process.env.PORT || 8098
  const socket = io('http://localhost:' + port)

  const bridge = new Bridge({
    listen (fn) {
      socket.on('vue-message', data => fn(data))
    },
    send (data) {
      socket.emit('vue-message', data)
    }
  })

  bridge.on('shutdown', () => {
    socket.disconnect()
  })

  initBackend(bridge)
  socket.emit('vue-devtools-init')
}())
