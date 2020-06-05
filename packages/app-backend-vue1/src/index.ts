import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'

export const backend: DevtoolsBackend = {
  frameworkVersion: 1,
  availableFeatures: [
    BuiltinBackendFeature.COMPONENTS
  ],
  setup (api) {
    // @TODO
  }
}
