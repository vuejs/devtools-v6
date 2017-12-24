// This is the devtools script, which is called when the user opens the
// Chrome devtool on a page. We check to see if we global hook has detected
// Vue presence on the page. If yes, create the Vue panel; otherwise poll
// for 10 seconds.

let panelShown = false
let pendingAction
let created = false
let checkCount = 0

chrome.devtools.network.onNavigated.addListener(createPanelIfHasVue)
const checkVueInterval = setInterval(createPanelIfHasVue, 1000)
createPanelIfHasVue()

function createPanelIfHasVue () {
  if (created || checkCount++ > 10) {
    return
  }
  panelShown = false
  chrome.devtools.inspectedWindow.eval(
    '!!(window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue)',
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

// Manage panel visibility

function onPanelShown () {
  chrome.runtime.sendMessage('vue-panel-shown')
  panelShown = true
}

function onPanelHidden () {
  chrome.runtime.sendMessage('vue-panel-hidden')
  panelShown = false
}

// Page context menu entry

chrome.contextMenus.create({
  id: 'vue-inspect-instance',
  title: 'Inspect Vue component',
  contexts: ['all']
})

chrome.contextMenus.onClicked.addListener(genericOnContext)

function genericOnContext (info, tab) {
  if (info.menuItemId === 'vue-inspect-instance') {
    const src = `window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET`

    chrome.devtools.inspectedWindow.eval(src, function (res, err) {
      if (err) {
        console.log(err)
      }
      if (typeof res !== 'undefined' && res) {
        panelAction(() => {
          chrome.runtime.sendMessage('vue-get-context-menu-target')
        }, 'Open Vue devtools to see component details')
      } else {
        pendingAction = null
        toast('No Vue component was found', 'warn')
      }
    })
  }
}

// Action that may execute immediatly
// or later when the Vue panel is ready

function panelAction (cb, message) {
  if (created && panelShown) {
    cb()
  } else {
    pendingAction = cb
    toast(message)
  }
}

// Execute pending action when Vue panel is ready

chrome.runtime.onMessage.addListener(request => {
  if (request === 'vue-panel-load') {
    onPanelLoad()
  } else if (request.vueToast) {
    toast(request.vueToast.message, request.vueToast.type)
  }
})

function onPanelLoad () {
  pendingAction && pendingAction()
  pendingAction = null
}

// Toasts

function toast (message, type = 'normal') {
  const src = `(function() {
    __VUE_DEVTOOLS_TOAST(\`${message}\`, '${type}');
  })()`

  chrome.devtools.inspectedWindow.eval(src, function (res, err) {
    if (err) {
      console.log(err)
    }
  })
}
