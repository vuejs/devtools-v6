// the background script runs all the time and serves as a central message
// hub for each vue devtools (panel + proxy + backend) instance.

const ports = {}

chrome.runtime.onConnect.addListener((port) => {
  let tab
  let name
  if (isNumeric(port.name)) {
    tab = port.name
    name = 'devtools'
    installProxy(+port.name)
  } else {
    tab = port.sender.tab.id
    name = 'content-script'
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null,
    }
  }
  ports[tab][name] = port

  if (ports[tab].devtools && ports[tab]['content-script']) {
    doublePipe(ports[tab].devtools, ports[tab]['content-script'])
  }
})

function isNumeric(str) {
  return +str + '' === str
}

function installProxy (tabId) {
  console.log('injected proxy to tab ' + tabId)
  chrome.tabs.executeScript(tabId, {
    file: '/build/proxy.js'
  })
}

function doublePipe(one, two) {
  one.onMessage.addListener(lOne)
  function lOne(message) {
    console.log('devtools -> backend', message);
    two.postMessage(message)
  }
  two.onMessage.addListener(lTwo)
  function lTwo(message) {
    console.log('backend -> devtools', message);
    one.postMessage(message)
  }
  function shutdown() {
    one.onMessage.removeListener(lOne)
    two.onMessage.removeListener(lTwo)
    one.disconnect()
    two.disconnect()
  }
  one.onDisconnect.addListener(shutdown)
  two.onDisconnect.addListener(shutdown)
}
