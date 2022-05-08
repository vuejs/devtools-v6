import { getTarget, getDevtoolsGlobalHook, isProxyAvailable } from './env.js'
import { HOOK_SETUP } from './const.js'
import type { DevtoolsPluginApi } from './api/index.js'
import { ApiProxy } from './proxy.js'
import type { PluginDescriptor, ExtractSettingsTypes, PluginSettingsItem } from './plugin.js'

export * from './api/index.js'
export * from './plugin.js'
export * from './time.js'
export { PluginQueueItem } from './env.js'

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

// Prevent properties not in PluginDescriptor
// We need this because of the `extends` in the generic TDescriptor
type Exact<C, T> = {
  [K in keyof C]: K extends keyof T ? T[K] : never
}

export type SetupFunction<TSettings = any> = (api: DevtoolsPluginApi<TSettings>) => void

export function setupDevtoolsPlugin<
  TDescriptor extends Exact<TDescriptor, PluginDescriptor>,
  TSettings = ExtractSettingsTypes<TDescriptor extends { settings : infer S } ? S extends Record<string, PluginSettingsItem> ? S : Record<string, PluginSettingsItem> : Record<string, PluginSettingsItem>>,
> (pluginDescriptor: Narrow<TDescriptor>, setupFn: SetupFunction<TSettings>) {
  const descriptor = pluginDescriptor as unknown as PluginDescriptor
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
