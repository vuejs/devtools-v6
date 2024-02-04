import { isChrome } from '@vue-devtools/shared-utils'

let panelShown = !isChrome
let pendingAction: (() => void | Promise<void>) | null = null

if (isChrome) {
  chrome.runtime.onMessage.addListener(request => {
    if (request === 'vue-panel-shown') {
      onPanelShown()
    } else if (request === 'vue-panel-hidden') {
      onPanelHidden()
    }
  })
}

export function ensurePaneShown (cb: () => void | Promise<void>) {
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
