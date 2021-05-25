// the background script runs all the time and serves as a central message
// hub for each vue devtools (panel + proxy + backend) instance.

const ports = {}

chrome.runtime.onConnect.addListener(port => {
  let tab
  let name
  if (isNumeric(port.name)) {
    tab = port.name
    name = 'devtools'
    installProxy(+port.name)
  } else {
    tab = port.sender.tab.id
    name = 'backend'
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      backend: null
    }
  }
  ports[tab][name] = port

  if (ports[tab].devtools && ports[tab].backend) {
    doublePipe(tab, ports[tab].devtools, ports[tab].backend)
  }
})

function isNumeric (str) {
  return +str + '' === str
}

function installProxy (tabId) {
  chrome.tabs.executeScript(tabId, {
    file: '/build/proxy.js'
  }, function (res) {
    if (!res) {
      ports[tabId].devtools.postMessage('proxy-fail')
    } else {
      console.log('injected proxy to tab ' + tabId)
    }
  })
}

function doublePipe (id, one, two) {
  one.onMessage.addListener(lOne)
  function lOne (message) {
    if (message.event === 'log') {
      return console.log('tab ' + id, message.payload)
    }
    console.log('devtools -> backend', message)
    two.postMessage(message)
  }
  two.onMessage.addListener(lTwo)
  function lTwo (message) {
    if (message.event === 'log') {
      return console.log('tab ' + id, message.payload)
    }
    console.log('backend -> devtools', message)
    one.postMessage(message)
  }
  function shutdown () {
    console.log('tab ' + id + ' disconnected.')
    one.onMessage.removeListener(lOne)
    two.onMessage.removeListener(lTwo)
    one.disconnect()
    two.disconnect()
    ports[id] = null
    updateContextMenuItem()
  }
  one.onDisconnect.addListener(shutdown)
  two.onDisconnect.addListener(shutdown)
  console.log('tab ' + id + ' connected.')
  updateContextMenuItem()
}

chrome.runtime.onMessage.addListener((req, sender) => {
  if (sender.tab && req.vueDetected) {
    const suffix = req.nuxtDetected ? '.nuxt' : ''

    chrome.browserAction.setIcon({
      tabId: sender.tab.id,
      path: {
        16: `icons/16${suffix}.png`,
        48: `icons/48${suffix}.png`,
        128: `icons/128${suffix}.png`
      }
    })
    chrome.browserAction.setPopup({
      tabId: sender.tab.id,
      popup: req.devtoolsEnabled ? `popups/enabled${suffix}.html` : `popups/disabled${suffix}.html`
    })
  }
})

// Right-click inspect context menu entry
let activeTabId
chrome.tabs.onActivated.addListener(({ tabId }) => {
  activeTabId = tabId
  updateContextMenuItem()
})

function updateContextMenuItem () {
  chrome.contextMenus.removeAll(() => {
    if (ports[activeTabId]) {
      chrome.contextMenus.create({
        id: 'vue-inspect-instance',
        title: 'Inspect Vue component',
        contexts: ['all']
      })
    }
  })
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.runtime.sendMessage({
    vueContextMenu: {
      id: info.menuItemId
    }
  })
})
