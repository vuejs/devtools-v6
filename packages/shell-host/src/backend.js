import { initBackend } from '@back'
import { Bridge } from '@utils/bridge'

const bridge = new Bridge({
  listen (fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send (data) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('backend -> devtools', data)
    }
    window.parent.postMessage(data, '*')
  }
})

initBackend(bridge)
