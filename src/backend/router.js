import { stringify } from '../util'

export function initRouterBackend (Vue, bridge, rootInstances) {
	console.log('#####################################################')
	console.log('In initRouterBackend with rootInstances', rootInstances)
	console.log('rootInstances.length', rootInstances.length)

	for (let i=0; i<rootInstances.length; i++) {
		if (rootInstances[i]._router) {
			rootInstances[i]._router.afterEach((to, from) => {
			  	bridge.send('router:changed', stringify({
					to,
					from
				}))
			})
			bridge.send('router:init', stringify({
				currentRoute: rootInstances[i]._route,
				routes: rootInstances[i]._router.options.routes
			}))
		}
	}
}