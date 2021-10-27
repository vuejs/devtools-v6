import { AppRecord } from './app-record'
import { DevtoolsApi } from './api'
import { BackendContext } from './backend-context'

export enum BuiltinBackendFeature {
  /**
   * @deprecated
   */
  FLUSH = 'flush'
}

export interface DevtoolsBackendOptions {
  frameworkVersion: 1 | 2 | 3
  features: (BuiltinBackendFeature | string)[]
  setup: (api: DevtoolsApi) => void
  setupApp?: (api: DevtoolsApi, app: AppRecord) => void
}

export function defineBackend (options: DevtoolsBackendOptions) {
  return options
}

export interface DevtoolsBackend {
  options: DevtoolsBackendOptions
  api: DevtoolsApi
}

export function createBackend (options: DevtoolsBackendOptions, ctx: BackendContext): DevtoolsBackend {
  const backend: DevtoolsBackend = {
    options,
    api: null,
  }
  backend.api = new DevtoolsApi(backend, ctx)
  options.setup(backend.api)
  return backend
}
