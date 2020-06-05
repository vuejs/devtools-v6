import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'

export const backend: DevtoolsBackend = {
  frameworkVersion: 3,

  availableFeatures: [
    BuiltinBackendFeature.COMPONENTS
  ],

  setup (api) {
    api.on.getAppRecordName(payload => {
      if (payload.app._component) {
        payload.name = payload.app._component.name
      }
    })

    // @TODO
  }
}
