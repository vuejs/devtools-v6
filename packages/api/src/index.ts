import { getTarget, getDevtoolsGlobalHook, isProxyAvailable } from './env'
import { HOOK_SETUP } from './const'
import { DevtoolsPluginApi } from './api'
import { ApiProxy } from './proxy'
import { PluginDescriptor, ExtractSettingsTypes } from './plugin'

export * from './api'
export * from './plugin'
export { PluginQueueItem } from './env'

// https://github.com/microsoft/TypeScript/issues/30680#issuecomment-752725353
type Cast<A, B> = A extends B ? A : B
type Narrowable =
| string
| number
| bigint
| boolean
type Narrow<A> = Cast<A,
| []
| (A extends Narrowable ? A : never)
| ({ [K in keyof A]: Narrow<A[K]> })
>

export type SetupFunction<TSettings = any> = (api: DevtoolsPluginApi<TSettings>) => void

export function setupDevtoolsPlugin<
  TDescriptor extends PluginDescriptor = PluginDescriptor,
  TSettings = ExtractSettingsTypes<TDescriptor['settings']>,
> (pluginDescriptor: Narrow<TDescriptor>, setupFn: SetupFunction<TSettings>) {
  const descriptor = pluginDescriptor as TDescriptor
  const target = getTarget()
  const hook = getDevtoolsGlobalHook()
  const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn)
  } else {
    const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null

    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []
    list.push({
      pluginDescriptor: descriptor,
      setupFn,
      proxy,
    })

    if (proxy) setupFn(proxy.proxiedTarget as DevtoolsPluginApi<TSettings>)
  }
}
