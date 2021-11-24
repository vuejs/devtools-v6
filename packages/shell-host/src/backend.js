import { initBackend } from '@back'
import { Bridge } from '@vue-devtools/shared-utils'

const bridge = new Bridge({
  listen (fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send (data) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('%cbackend -> devtools', 'color:#888;', data)
    }
    window.parent.postMessage(data, '*')
  },
})

initBackend(bridge)
