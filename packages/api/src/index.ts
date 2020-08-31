import { hook, target } from './env'
import { ApiHookEvents } from './const'
import { DevtoolsPluginApi, App } from './api'

export * from './api'

export interface PluginDescriptor {
  id: string
  label: string
  app: App
}

export type SetupFunction = (api: DevtoolsPluginApi) => void

export function setupDevtoolsPlugin (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) {
  if (hook) {
    hook.emit(ApiHookEvents.SETUP_DEVTOOLS_PLUGIN, pluginDescriptor, setupFn)
  } else {
    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []
    list.push({
      pluginDescriptor,
      setupFn
    })
  }
}

export const api: DevtoolsPluginApi = target.__VUE_DEVTOOLS_API__
