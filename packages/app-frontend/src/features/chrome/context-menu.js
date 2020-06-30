import { isChrome } from '@utils/env'

if (isChrome) {
  chrome.runtime.onMessage.addListener(request => {
    if (request === 'vue-get-context-menu-target') {
      getContextMenuInstance()
    }
  })
}

function getContextMenuInstance () {
  bridge.send('get-context-menu-target')
}
