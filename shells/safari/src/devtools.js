/*global safari*/
import { initDevTools } from 'src/devtools'
import Bridge from 'src/bridge'

// 1. load user app
// 2. init devtools when extention bar button is clicked
safari.application.addEventListener('popover', (evt) => {
  if (evt.target.identifier !== 'VuePopover') {
    return
  }
  initDevTools({
    connect (cb) {
      // 3. called by devtools: inject backend
      inject(`${safari.extension.baseURI}build/backend.js`, () => {
        // 4. send back bridge
        cb(new Bridge({
          listen (fn) {
            safari.application.addEventListener('message', evt => {
              if (evt.message.source === 'vue-devtools-proxy') {
                fn(evt.message.payload)
              }
            }, false)
          },
          send (data) {
            safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('send', data)
          }
        }))
      })
    },
    onReload () {
      console.log('[devtools] reloaded')
    }
  })
}, true)

const callbacks = {}
function inject (scriptName, done) {
  const src = `
    var script = document.constructor.prototype.createElement.call(document, 'script');
    script.src = "${scriptName}";
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  `
  callbacks[src] = done
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('inject', src)
}

function runCallback (evt) {
  if (evt.name === 'script-loaded') {
    callbacks[evt.message]()
    safari.application.removeEventListener('message', runCallback)
  }
}

safari.application.addEventListener('message', runCallback)
