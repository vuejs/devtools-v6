import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { backendInjections } from '@vue-devtools/shared-utils'
import { getCustomInstanceDetails, getInstanceDetails } from './components/data'
import { instanceMap, walkTree } from './components/tree'

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

    // @TODO
  }
}
