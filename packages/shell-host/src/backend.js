import { initBackend } from '@back'
import { Bridge } from '@utils/bridge'

const bridge = new Bridge({
  listen (fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send (data) {
    console.log('backend -> devtools', data)
    window.parent.postMessage(data, '*')
  }
})

initBackend(bridge)
