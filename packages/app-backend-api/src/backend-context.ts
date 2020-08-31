import { Bridge } from '@vue-devtools/shared-utils'
import { TimelineLayerOptions, App } from '@vue/devtools-api'
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
  timelineLayers: TimelineLayer[]
}

export interface TimelineLayer extends TimelineLayerOptions {
  app: App
}

export interface CreateBackendContextOptions {
  bridge: Bridge
  hook: DevtoolsHook
}

export function createBackendContext (options: CreateBackendContextOptions): BackendContext {
  const ctx: BackendContext = {
    bridge: options.bridge,
    hook: options.hook,
    api: null,
    appRecords: [],
    currentTab: null,
    currentAppRecord: null,
    currentInspectedComponentId: null,
    plugins: [],
    currentPlugin: null,
    timelineLayers: []
  }
  ctx.api = new DevtoolsApi(options.bridge, ctx)
  return ctx
}
