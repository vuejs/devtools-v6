// this script is called when the VueDevtools panel is activated.

import { initDevTools, setAppConnected } from '@front'
import { Bridge, BridgeEvents } from '@vue-devtools/shared-utils'

let disconnected = false
let connectCount = 0
let retryConnectTimer

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
      let port

      const onMessageHandlers = []

      function connect () {
        try {
          clearTimeout(retryConnectTimer)
          connectCount++
          port = chrome.runtime.connect({
            name: '' + chrome.devtools.inspectedWindow.tabId,
          })
          disconnected = false
          port.onDisconnect.addListener(() => {
            disconnected = true
            setAppConnected(false)

            // Retry
            retryConnectTimer = setTimeout(connect, 1000)
          })

          if (connectCount > 1) {
            onMessageHandlers.forEach(fn => port.onMessage.addListener(fn))
          }
        } catch (e) {
          console.error(e)
          disconnected = true
          setAppConnected(false)

          // Retry
          retryConnectTimer = setTimeout(connect, 5000)
        }
      }
      connect()

      const bridge = new Bridge({
        listen (fn) {
          port.onMessage.addListener(fn)
          onMessageHandlers.push(fn)
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

      bridge.on(BridgeEvents.TO_FRONT_RECONNECTED, () => {
        setAppConnected(true)
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
  chrome.devtools.inspectedWindow.eval(src, function (res, err) {
    if (err) {
      console.error(err)
    }
    cb()
  })
}
