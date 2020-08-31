import { Bridge, target } from '@vue-devtools/shared-utils'
import { AppRecord } from './app-record'
import { DevtoolsApi } from './api'
import { Plugin } from './plugin'
import { DevtoolsHook } from './global-hook'

export interface BackendContext {
  bridge: Bridge
  hook: DevtoolsHook
  api: DevtoolsApi
  appRecords: AppRecord[]
  currentTab: string
  currentAppRecord: AppRecord
  currentInspectedComponentId: string
  plugins: Plugin[]
  currentPlugin: Plugin
}

export interface CreateBackendContextOptions {
  bridge: Bridge
  hook: DevtoolsHook
}

export function createBackendContext (options: CreateBackendContextOptions): BackendContext {
  const ctx = {
    bridge: options.bridge,
    hook: options.hook,
    api: null,
    appRecords: [],
    currentTab: null,
    currentAppRecord: null,
    currentInspectedComponentId: null,
    plugins: [],
    currentPlugin: null
  }
  ctx.api = target.__VUE_DEVTOOLS_API__ = new DevtoolsApi(options.bridge, ctx)
  return ctx
}
