/* global __resourceQuery */
import { initBackend } from '@back'
import { installToast } from '@back/toast'
import { Bridge, target, parseURL, getWSProtocolByHttpProtocol, makeUrl, socketWithRetry } from '@vue-devtools/shared-utils'

const noop = () => {}

const initDevTools = () => {
  // __resourceQuery is entry query string, webpack will inject this variable
  const parsedResourceQuery = parseURL(__resourceQuery)
  const protocol = getWSProtocolByHttpProtocol(parsedResourceQuery.protocol || 'http')
  const host = parsedResourceQuery.host || 'localhost'
  const port = parsedResourceQuery.port || 38989
  let clientId
  try {
    clientId = global.__HIPPYNATIVEGLOBAL__.Debug.debugClientId
  } catch (e) {
    console.warn('get vue devtools clientId failed, please update hippy-vue sdk to ^2.13.4')
  }

  const url = makeUrl(`${protocol}://${host}:${port}/debugger-proxy`, {
    role: 'js_runtime',
    contextName: 'contextName',
    clientId,
  })

  let devtoolsHandler = noop

  const socket = socketWithRetry(url, {
    onOpen: () => {
      connectedMessage()
      initBackend(bridge)
      socket.send(JSON.stringify(['vue-devtools-init']))
    },
    // Global disconnect handler. Fires in two cases:
    // - after calling above socket.disconnect()
    // - once devtools is closed (that's why we need socket.disconnect() here too, to prevent further polling)
    onClose: () => {
      disconnectedMessage()
    },
    onMessage: (event) => {
      const res = JSON.parse(event.data)
      if (res[0] === 'vue-message') {
        devtoolsHandler(res[1])
      }
    },
  })

  const bridge = new Bridge({
    listen (fn) {
      devtoolsHandler = fn
    },
    send (data) {
      if (!data) return
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (!item.payload) item.payload = {}
        })
      }
      if (!data.payload) data.payload = {}
      // console.log('%cbackend -> devtools', 'color:#888;', data)
      socket.send(JSON.stringify(['vue-message', data]))
    },
  })

  bridge.on('shutdown', () => {
    socket.close()
    disconnectedMessage()
  })

  installToast(target)
}

/**
 * must ensure this entry is append to the end of entry list, so that global.WebSocket is available
 */
setTimeout(() => {
  initDevTools()
}, 200)

function connectedMessage() {
  if (target.__VUE_DEVTOOLS_TOAST__) {
    target.__VUE_DEVTOOLS_TOAST__('Remote Devtools Connected', 'normal')
  }
}

function disconnectedMessage() {
  if (target.__VUE_DEVTOOLS_TOAST__) {
    target.__VUE_DEVTOOLS_TOAST__('Remote Devtools Disconnected', 'error')
  }
}
