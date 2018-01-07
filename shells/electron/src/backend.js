import io from 'socket.io-client'
import { initBackend } from 'src/backend'
import { installHook } from 'src/backend/hook'
import Bridge from 'src/bridge'

(function () {
  const socket = io('http://localhost:8098')

  const bridge = new Bridge({
    listen (fn) {
      socket.on('vue-message', data => fn(data))
    },
    send (data) {
      console.log('backend -> devtools', data)
      socket.emit('vue-message', data)
    }
  })

  if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    installHook(window)
  }

  initBackend(bridge)
}())
