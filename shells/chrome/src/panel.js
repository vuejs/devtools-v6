// this script is called when the VueDevtools panel is activated.

import { initPanel } from '../../../src/panel'

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
  // 3. send a proxy API to the panel
  initPanel({
    listen (fn) {
      port.onMessage.addListener(fn)
    },
    send (data) {
      if (!disconnected) {
        port.postMessage(data)
      }
    },
    disconnect () {
      port.disconnect()
    }
  })
})

function injectScript (scriptName, cb) {
  const src = `
    var script = document.constructor.prototype.createElement.call(document, 'script');
    script.src = "${scriptName}";
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  `
  chrome.devtools.inspectedWindow.eval(src, function(res, err) {
    if (err) {
      console.log(err)
    }
    cb()
  })
}
