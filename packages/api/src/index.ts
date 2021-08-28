import { getTarget, getDevtoolsGlobalHook, isProxyAvailable } from './env'
import { HOOK_SETUP } from './const'
import { DevtoolsPluginApi, App } from './api'
import { ApiProxy } from './proxy'

export * from './api'
export { PluginQueueItem } from './env'

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
  const target = getTarget()
  const hook = getDevtoolsGlobalHook()
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !isProxyAvailable)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn)
  } else {
    const proxy = isProxyAvailable ? new ApiProxy() : null

    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []
    list.push({
      pluginDescriptor,
      setupFn,
      proxy
    })

    setupFn(proxy.proxiedTarget as DevtoolsPluginApi)
  }
}
