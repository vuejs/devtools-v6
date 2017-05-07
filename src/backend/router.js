import { stringify } from '../util'

export function initRouterBackend (Vue, bridge, rootInstances) {
  let recording = true

  bridge.on('router:toggle-recording', enabled => {
    recording = enabled
  })

  for (let i = 0; i < rootInstances.length; i++) {
    const router = rootInstances[i]._router
    if (router) {
      router.afterEach((to, from) => {
        if (recording) {
          bridge.send('router:changed', stringify({
            to,
            from,
            timestamp: Date.now()
          }))
        }
      })
      bridge.send('router:init', stringify({
        mode: router.mode
      }))

      bridge.send('routes:init', stringify({
        routes: router.options.routes,
        mode: router.mode
      }))

      if (router.options && router.options.routes) {
        router.options.routes.forEach(instance => {
          bridge.send('routes:changed', stringify(instance))
        })
      }

      if (router.matcher && router.matcher.addRoutes) {
        const addRoutes = router.matcher.addRoutes
        router.matcher.addRoutes = function (routes) {
          routes.forEach((item) => {
            bridge.send('routes:changed', stringify(item))
          })
          addRoutes.call(this, routes)
        }
      }
    }
  }
}
