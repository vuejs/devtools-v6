import { PluginDescriptor, SetupFunction } from '@vue/devtools-api'
import { Plugin, BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, target } from '@vue-devtools/shared-utils'

export function addPlugin (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction, ctx: BackendContext) {
  const plugin: Plugin = {
    descriptor: pluginDescriptor,
    setupFn,
    error: null
  }
  try {
    ctx.currentPlugin = plugin
    setupFn(ctx.api)
    ctx.currentPlugin = null
  } catch (e) {
    plugin.error = e
  }
  ctx.plugins.push(plugin)
  ctx.bridge.send(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
    plugin: serializePlugin(plugin)
  })
}

export async function addQueuedPlugins (ctx: BackendContext) {
  if (target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(target.__VUE_DEVTOOLS_PLUGINS__)) {
    for (const k in target.__VUE_DEVTOOLS_PLUGINS__) {
      const plugin = target.__VUE_DEVTOOLS_PLUGINS__[k]
      addPlugin(plugin.pluginDescriptor, plugin.setupFn, ctx)
    }
    target.__VUE_DEVTOOLS_PLUGINS__ = null
  }
}

export function sendPluginList (ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
    plugins: ctx.plugins.map(p => serializePlugin(p))
  })
}

export function serializePlugin (plugin: Plugin) {
  return {
    id: plugin.descriptor.id,
    label: plugin.descriptor.label,
    appId: plugin.descriptor
  }
}
