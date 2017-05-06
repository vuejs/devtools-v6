import { stringify } from '../util'

export function initRouterBackend (Vue, bridge, rootInstances) {
  let recording = true

  bridge.on('router:toggle-recording', enabled => {
    recording = enabled
  })

  for (let i = 0; i < rootInstances.length; i++) {
    if (rootInstances[i]._router) {
      rootInstances[i]._router.afterEach((to, from) => {
        if (recording) {
          bridge.send('router:changed', stringify({
            to,
            from,
            timestamp: Date.now()
          }))
        }
      })
      bridge.send('router:init', stringify({
        routes: rootInstances[i]._router.options.routes,
        mode: rootInstances[i]._router.mode
      }))
      bridge.send('routes:init', stringify({
        routes: rootInstances[i]._router.options.routes,
        mode: rootInstances[i]._router.mode
      }))
    }
  }
}
