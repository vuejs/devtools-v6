import { AppRecord } from './app-record'
import { DevtoolsApi } from './api'

export enum BuiltinBackendFeature {
  COMPONENTS = 'components',
  EVENTS = 'events',
  VUEX = 'vuex',
  FLUSH = 'flush'
}

export interface DevtoolsBackend {
  frameworkVersion: 1 | 2 | 3
  availableFeatures: (BuiltinBackendFeature | string)[]
  setup: (api: DevtoolsApi) => void
  setupApp?: (api: DevtoolsApi, app: AppRecord) => void
}
