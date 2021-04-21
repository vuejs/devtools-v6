import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { walkTree } from './components/tree'

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

    api.on.walkComponentTree(payload => {
      payload.componentTreeData = walkTree(payload.componentInstance, payload.filter)
    })

    // @TODO
  }
}
