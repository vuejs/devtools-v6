import { DevtoolsApi } from './api'

export enum BuiltinBackendFeature {
  COMPONENTS = 'components',
  EVENTS = 'events',
  VUEX = 'vuex',
}

export interface DevtoolsBackend {
  frameworkVersion: 1 | 2 | 3
  availableFeatures: [BuiltinBackendFeature | string]
  setup: (api: DevtoolsApi) => void
}
