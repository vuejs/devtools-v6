import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'

export const backend: DevtoolsBackend = {
  frameworkVersion: 2,
  availableFeatures: [
    BuiltinBackendFeature.COMPONENTS
  ],
  setup (api) {
    api.on.getAppRecordName(payload => {
      if (payload.app.name) {
        payload.name = payload.app.name
      }
    })

    // @TODO
  }
}
