import { initDevTools } from '../../../src/devtools'
import { installHook } from '../../../src/backend/hook'
import Bridge from '../../../src/bridge'

const target = document.getElementById('target')
const targetWindow = target.contentWindow

// 1. install global hook
installHook(targetWindow)

// 2. inject user app
inject('./build/target.js', () => {
  // 3. init devtools
  initDevTools({
    connect (cb) {
      // 4. called by devtools: inject backend
      inject('./build/backend.js', () => {
        // 5. send back bridge
        cb(new Bridge({
          listen (fn) {
            targetWindow.parent.addEventListener('message', evt => fn(evt.data))
          },
          send (data) {
            targetWindow.postMessage(data, '*')
          }
        }))
      })
    },
    onReload () { /* noop*/ }
  })
})

function inject (src, done) {
  if (!src || src === 'false') {
    return done()
  }
  const script = target.contentDocument.createElement('script')
  script.src = src
  script.onload = done
  target.contentDocument.body.appendChild(script)
}
