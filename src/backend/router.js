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
        mode: rootInstances[i]._router.mode
      }))

      bridge.send('routes:init', stringify({
        routes: rootInstances[i]._router.options.routes,
        mode: rootInstances[i]._router.mode
      }))

      rootInstances[i]._router.options.routes.forEach(instance => {
        bridge.send('routes:changed', stringify(instance))
        console.log(instance)
      })

      const addRoutes = rootInstances[i]._router.matcher.addRoutes
      rootInstances[i]._router.matcher.addRoutes = function (routes) {
        routes.forEach((item) => {
          bridge.send('routes:changed', stringify(item))
        })
        addRoutes.call(this, routes)
      }
    }
  }
}
