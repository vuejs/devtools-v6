// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

export function initBackend (bridge) {
  console.log('[vue-devtools] backend ready.')
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__

  bridge.on('message', message => {
    console.log(message)
  })

  bridge.send({
    event: 'message',
    payload: 'yo from backend'
  })
}
