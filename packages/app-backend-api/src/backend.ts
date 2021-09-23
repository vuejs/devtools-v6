import { AppRecord } from './app-record'
import { DevtoolsApi } from './api'
import { BackendContext } from './backend-context'

export enum BuiltinBackendFeature {
  COMPONENTS = 'components',
  EVENTS = 'events',
  VUEX = 'vuex',
  /**
   * @deprecated
   */
  FLUSH = 'flush'
}

export interface DevtoolsBackend {
  frameworkVersion: 1 | 2 | 3
  availableFeatures: (BuiltinBackendFeature | string)[]
  canHandle: (ctx: BackendContext) => boolean
  setup: (api: DevtoolsApi) => void
  setupApp?: (api: DevtoolsApi, app: AppRecord) => void
}
