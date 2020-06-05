import { AppRecord, DevtoolsApi } from '.'
import { Bridge } from '@vue-devtools/shared-utils'

export interface BackendContext {
  bridge: Bridge
  api: DevtoolsApi
  appRecords: AppRecord[]
  currentTab: string
  currentAppRecord: AppRecord
  currentInspectedComponentId: string | number
}

export interface CreateBackendContextOptions {
  bridge: Bridge
}

export function createBackendContext (options: CreateBackendContextOptions): BackendContext {
  const ctx = {
    bridge: options.bridge,
    api: null,
    appRecords: [],
    currentTab: null,
    currentAppRecord: null,
    currentInspectedComponentId: null
  }
  ctx.api = new DevtoolsApi(options.bridge, ctx)
  return ctx
}
