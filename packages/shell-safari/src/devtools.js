// this script is called when the VueDevtools panel is activated.

import { initDevTools, setAppConnected } from '@front'
import { Bridge } from '@vue-devtools/shared-utils'

initDevTools({

  /**
   * Inject backend, connect to background, and send back the bridge.
   *
   * @param {Function} cb
   */

  connect (cb) {
    // 1. inject backend code into page
    injectScript(browser.runtime.getURL('build/backend.js'), () => {
      // 2. connect to background to setup proxy
      const port = browser.runtime.connect({
        name: '' + browser.devtools.inspectedWindow.tabId,
      })
      let disconnected = false
      port.onDisconnect.addListener(() => {
        disconnected = true
        setAppConnected(false)
      })

      const bridge = new Bridge({
        listen (fn) {
          port.onMessage.addListener(fn)
        },
        send (data) {
          if (!disconnected) {
            // if (process.env.NODE_ENV !== 'production') {
            //   console.log('[chrome] devtools -> backend', data)
            // }
            port.postMessage(data)
          }
        },
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
    browser.devtools.network.onNavigated.addListener(reloadFn)
  },
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
  browser.devtools.inspectedWindow.eval(src, function (res, err) {
    if (err) {
      console.error(err)
    }
    cb()
  })
}
