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
  const host = window.__VUE_DEVTOOLS_HOST__ || 'http://localhost'
  const port = process.env.PORT || 8098
  const socket = io(host + ':' + port)

  // Disconnect socket once other client is connected
  socket.on('vue-devtools-disconnect-backend', () => {
    socket.disconnect()
  })

  // Global disconnect handler. Fires in two cases:
  // - after calling above socket.disconnect()
  // - once devtools is closed (that's why we need socket.disconnect() here too, to prevent further polling)
  socket.on('disconnect', (reason) => {
    socket.disconnect()
    disconnectedMessage()
  })

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
    disconnectedMessage()
  })

  installToast(window)
  initBackend(bridge)
  socket.emit('vue-devtools-init')
  connectedMessage()
}())
