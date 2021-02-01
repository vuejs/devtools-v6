// This is the devtools script, which is called when the user opens the
// Chrome devtool on a page. We check to see if we global hook has detected
// Vue presence on the page. If yes, create the Vue panel; otherwise poll
// for 10 seconds.

let panelLoaded = false
let panelShown = false
let pendingAction
let created = false
let checkCount = 0

chrome.devtools.network.onNavigated.addListener(createPanelIfHasVue)
const checkVueInterval = setInterval(createPanelIfHasVue, 1000)
createPanelIfHasVue()

function createPanelIfHasVue () {
  if (created || checkCount++ > 10) {
    clearInterval(checkVueInterval)
    return
  }
  panelLoaded = false
  panelShown = false
  chrome.devtools.inspectedWindow.eval(
    '!!(window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue || window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps.length)',
    function (hasVue) {
      if (!hasVue || created) {
        return
      }
      clearInterval(checkVueInterval)
      created = true
      chrome.devtools.panels.create(
        'Vue', 'icons/128.png', 'devtools.html',
        panel => {
          // panel loaded
          panel.onShown.addListener(onPanelShown)
          panel.onHidden.addListener(onPanelHidden)
        }
      )
    }
  )
}

// Runtime messages

chrome.runtime.onMessage.addListener(request => {
  if (request === 'vue-panel-load') {
    onPanelLoad()
  } else if (request.vueToast) {
    toast(request.vueToast.message, request.vueToast.type)
  } else if (request.vueContextMenu) {
    onContextMenu(request.vueContextMenu)
  }
})

// Page context menu entry

function onContextMenu ({ id }) {
  if (id === 'vue-inspect-instance') {
    const src = 'window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__'

    chrome.devtools.inspectedWindow.eval(src, function (res, err) {
      if (err) {
        console.log(err)
      }
      if (typeof res !== 'undefined' && res) {
        panelAction(() => {
          chrome.runtime.sendMessage('vue-get-context-menu-target')
        }, 'open-devtools')
      } else {
        pendingAction = null
        toast('component-not-found')
      }
    })
  }
}

// Action that may execute immediatly
// or later when the Vue panel is ready

function panelAction (cb, message = null) {
  if (created && panelLoaded && panelShown) {
    cb()
  } else {
    pendingAction = cb
    message && toast(message)
  }
}

function executePendingAction () {
  pendingAction && pendingAction()
  pendingAction = null
}

// Execute pending action when Vue panel is ready

function onPanelLoad () {
  executePendingAction()
  panelLoaded = true
}

// Manage panel visibility

function onPanelShown () {
  chrome.runtime.sendMessage('vue-panel-shown')
  panelShown = true
  panelLoaded && executePendingAction()
}

function onPanelHidden () {
  chrome.runtime.sendMessage('vue-panel-hidden')
  panelShown = false
}

// Toasts

const toastMessages = {
  'open-devtools': { message: 'Open Vue devtools to see component details', type: 'normal' },
  'component-not-found': { message: 'No Vue component was found', type: 'warn' }
}

function toast (id) {
  if (!Object.keys(toastMessages).includes(id)) return

  const { message, type } = toastMessages[id]

  const src = `(function() {
    __VUE_DEVTOOLS_TOAST__(\`${message}\`, '${type}');
  })()`

  chrome.devtools.inspectedWindow.eval(src, function (res, err) {
    if (err) {
      console.log(err)
    }
  })
}
