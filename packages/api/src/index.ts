import { getTarget, getDevtoolsGlobalHook, isProxyAvailable } from './env'
import { HOOK_SETUP } from './const'
import { DevtoolsPluginApi } from './api'
import { ApiProxy } from './proxy'
import { PluginDescriptor } from './plugin'

export * from './api'
export * from './plugin'
export { PluginQueueItem } from './env'

export type SetupFunction<TSettings = any> = (api: DevtoolsPluginApi<TSettings>) => void

export function setupDevtoolsPlugin<TSettings = any> (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) {
  const target = getTarget()
  const hook = getDevtoolsGlobalHook()
  const enableProxy = isProxyAvailable && pluginDescriptor.enableEarlyProxy
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn)
  } else {
    const proxy = enableProxy ? new ApiProxy(pluginDescriptor, hook) : null

    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []
    list.push({
      pluginDescriptor,
      setupFn,
      proxy
    })

    if (proxy) setupFn(proxy.proxiedTarget as DevtoolsPluginApi<TSettings>)
  }
}
