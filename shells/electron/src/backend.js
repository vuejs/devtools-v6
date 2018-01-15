import io from 'socket.io-client'
import { initBackend } from 'src/backend'
import Bridge from 'src/bridge'
import { installToast } from 'src/backend/toast'

const connectedMessage = () => {
  if (window.__VUE_DEVTOOLS_TOAST__) {
    window.__VUE_DEVTOOLS_TOAST__('Remote Devtools Connected', 'normal')
  }
}

const disconnectedMessage = () => {
  if (window.__VUE_DEVTOOLS_TOAST__) {
    window.__VUE_DEVTOOLS_TOAST__('Remote Devtools Disconnected', 'error')
  }
}

(function () {
  const port = process.env.PORT || 8098
  const socket = io('http://localhost:' + port)

  const bridge = new Bridge({
    listen (fn) {
      socket.on('vue-message', data => fn(data))
      socket.on('vue-devtools-disconnect-backend', () => {
        socket.disconnect()
        disconnectedMessage()
      })
    },
    send (data) {
      socket.emit('vue-message', data)
    }
  })

  bridge.on('shutdown', () => {
    socket.disconnect()
    disconnectedMessage()
  })

  installToast(window)
  initBackend(bridge)
  socket.emit('vue-devtools-init')
  connectedMessage()
}())
