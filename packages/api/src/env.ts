import type { PluginDescriptor, SetupFunction } from './index.js'
import type { ApiProxy } from './proxy.js'

export interface PluginQueueItem {
  pluginDescriptor: PluginDescriptor
  setupFn: SetupFunction
  proxy?: ApiProxy
}

interface GlobalTarget {
  __VUE_DEVTOOLS_PLUGINS__?: PluginQueueItem[]
  __VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__?: boolean
}

export function getDevtoolsGlobalHook (): any {
  return (getTarget() as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
}

export function getTarget (): GlobalTarget {
  // @ts-ignore
  return (typeof navigator !== 'undefined' && typeof window !== 'undefined')
    ? window
    : typeof global !== 'undefined'
      ? global
      : {}
}

export const isProxyAvailable = typeof Proxy === 'function'
