import io from 'socket.io-client'
import { initBackend } from 'src/backend'
import Bridge from 'src/bridge'
import { installToast } from 'src/backend/toast'
import { target } from 'src/devtools/env'

const host = target.__VUE_DEVTOOLS_HOST__ || 'http://localhost'
const port = target.__VUE_DEVTOOLS_PORT__ !== undefined ? target.__VUE_DEVTOOLS_PORT__ : 8098
const fullHost = port ? host + ':' + port : host
const createSocket = target.__VUE_DEVTOOLS_SOCKET__ || io
const socket = createSocket(fullHost)

const connectedMessage = () => {
  if (target.__VUE_DEVTOOLS_TOAST__) {
    target.__VUE_DEVTOOLS_TOAST__('Remote Devtools Connected', 'normal')
  }
}

const disconnectedMessage = () => {
  if (target.__VUE_DEVTOOLS_TOAST__) {
    target.__VUE_DEVTOOLS_TOAST__('Remote Devtools Disconnected', 'error')
  }
}

socket.on('connect', () => {
  connectedMessage()
  initBackend(bridge)
  socket.emit('vue-devtools-init')
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

installToast(target)
