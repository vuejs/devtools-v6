// this script is called when the VueDevtools panel is activated.

import { initDevTools } from 'src/devtools'
import Bridge from 'src/bridge'

initDevTools({

  /**
   * Inject backend, connect to background, and send back the bridge.
   *
   * @param {Function} cb
   */

  connect (cb) {
    // 1. inject backend code into page
    injectScript(chrome.runtime.getURL('build/backend.js'), () => {
      // 2. connect to background to setup proxy
      const port = chrome.runtime.connect({
        name: '' + chrome.devtools.inspectedWindow.tabId
      })
      let disconnected = false
      port.onDisconnect.addListener(() => {
        disconnected = true
      })

      const bridge = new Bridge({
        listen (fn) {
          port.onMessage.addListener(fn)
        },
        send (data) {
          if (!disconnected) {
            port.postMessage(data)
          }
        }
      })
      // 3. send a proxy API to the panel
      cb(bridge)
    })
  },

  /**
   * Register a function to reload the devtools app.
   *
   * @param {Function} reloadFn
   */

  onReload (reloadFn) {
    chrome.devtools.network.onNavigated.addListener(reloadFn)
  }
})

/**
 * Inject a globally evaluated script, in the same context with the actual
 * user app.
 *
 * @param {String} scriptName
 * @param {Function} cb
 */

function injectScript (scriptName, cb) {
  const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `
  chrome.devtools.inspectedWindow.eval(src, function (res, err) {
    if (err) {
      console.log(err)
    }
    cb()
  })
}
