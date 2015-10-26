// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

export function initBackend (wall) {
  console.log('[vue-devtools] backend ready.')
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__

  wall.listen(function (message) {
    console.log(message)
  })

  setTimeout(function () {
    wall.send('yoyo')
  }, 1000)
}
