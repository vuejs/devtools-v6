import io from 'socket.io-client'
import { initBackend } from 'src/backend'
import Bridge from 'src/bridge'
import { installToast } from 'src/backend/toast'

const host = window.__VUE_DEVTOOLS_HOST__ || 'http://localhost'
const port = window.__VUE_DEVTOOLS_PORT__ !== undefined ? window.__VUE_DEVTOOLS_PORT__ : 8098
const fullHost = port ? host + ':' + port : host
const socket = io(fullHost)

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

socket.on('connect', () => {
  connectedMessage()
})

// Global disconnect handler. Fires in two cases:
// - after calling above socket.disconnect()
// - once devtools is closed (that's why we need socket.disconnect() here too, to prevent further polling)
socket.on('disconnect', (reason) => {
  socket.disconnect()
  disconnectedMessage()
})

// Disconnect socket once other client is connected
socket.on('vue-devtools-disconnect-backend', () => {
  socket.disconnect()
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
