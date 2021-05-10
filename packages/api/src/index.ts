import { getTarget, getDevtoolsGlobalHook } from './env'
import { HOOK_SETUP } from './const'
import { DevtoolsPluginApi, App } from './api'

export * from './api'

export interface PluginDescriptor {
  id: string
  label: string
  app: App
  packageName?: string
  homepage?: string
  componentStateTypes?: string[]
  logo?: string
  disableAppScope?: boolean
}

export type SetupFunction = (api: DevtoolsPluginApi) => void

export function setupDevtoolsPlugin (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) {
  const hook = getDevtoolsGlobalHook()
  if (hook) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn)
  } else {
    const target = getTarget()
    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []
    list.push({
      pluginDescriptor,
      setupFn
    })
  }
}
