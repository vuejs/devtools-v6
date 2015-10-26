import { initBackend } from '../../../src/backend'

window.addEventListener('message', handshake)

function handshake (e) {
  if (e.data.source === 'vue-devtools-proxy' && e.data.payload === 'init') {
    window.removeEventListener('message', handshake)

    initBackend({
      listen(fn) {
        var listener = evt => {
          if (evt.data.source === 'vue-devtools-proxy' && evt.data.payload) {
            fn(evt.data.payload)
          }
        }
        window.addEventListener('message', listener)
      },
      send(data) {
        window.postMessage({
          source: 'vue-devtools-backend',
          payload: data,
        }, '*')
      }
    })
  }
}
