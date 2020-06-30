import { isChrome } from '@utils/env'

let panelShown = !isChrome
let pendingAction = null

if (isChrome) {
  chrome.runtime.onMessage.addListener(request => {
    if (request === 'vue-panel-shown') {
      onPanelShown()
    } else if (request === 'vue-panel-hidden') {
      onPanelHidden()
    }
  })
}

export function ensurePaneShown (cb) {
  if (panelShown) {
    cb()
  } else {
    pendingAction = cb
  }
}

function onPanelShown () {
  panelShown = true
  if (pendingAction) {
    pendingAction()
    pendingAction = null
  }
}

function onPanelHidden () {
  panelShown = false
}
