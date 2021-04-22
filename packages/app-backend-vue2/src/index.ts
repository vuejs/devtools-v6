import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { backendInjections, getComponentName } from '@vue-devtools/shared-utils'
import { getCustomInstanceDetails, getInstanceDetails } from './components/data'
import { getInstanceOrVnodeRect } from './components/el'
import { instanceMap, walkTree } from './components/tree'
import { getInstanceName } from './components/util'

export const backend: DevtoolsBackend = {
  frameworkVersion: 2,
  availableFeatures: [
    BuiltinBackendFeature.COMPONENTS,
    BuiltinBackendFeature.FLUSH
  ],
  setup (api) {
    api.on.getAppRecordName(payload => {
      if (payload.app.name) {
        payload.name = payload.app.name
      }
    })

    api.on.getAppRootInstance(payload => {
      payload.root = payload.app
    })

    api.on.walkComponentTree((payload, ctx) => {
      payload.componentTreeData = walkTree(payload.componentInstance, payload.filter, ctx)
    })

    api.on.inspectComponent(payload => {
      backendInjections.getCustomInstanceDetails = getCustomInstanceDetails
      backendInjections.instanceMap = instanceMap
      payload.instanceData = getInstanceDetails(payload.componentInstance)
    })

    api.on.getComponentBounds(payload => {
      payload.bounds = getInstanceOrVnodeRect(payload.componentInstance)
      console.log(payload.componentInstance, payload.bounds)
    })

    api.on.getComponentName(payload => {
      const instance = payload.componentInstance
      payload.name = instance.fnContext ? getComponentName(instance.fnOptions) : getInstanceName(instance)
    })

    // @TODO
  }
}
