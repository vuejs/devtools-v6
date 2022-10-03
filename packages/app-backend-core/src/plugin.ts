import { PluginQueueItem } from '@vue/devtools-api'
import { Plugin, BackendContext, DevtoolsPluginApiInstance } from '@vue-devtools/app-backend-api'
import { BridgeEvents, SharedData, target } from '@vue-devtools/shared-utils'
import { getAppRecord, getAppRecordId } from './app'

export async function addPlugin (pluginQueueItem: PluginQueueItem, ctx: BackendContext) {
  const { pluginDescriptor, setupFn } = pluginQueueItem

  const plugin: Plugin = {
    descriptor: pluginDescriptor,
    setupFn,
    error: null,
  }
  ctx.currentPlugin = plugin
  try {
    const appRecord = await getAppRecord(plugin.descriptor.app, ctx)
    const api = new DevtoolsPluginApiInstance(plugin, appRecord, ctx)
    if (pluginQueueItem.proxy) {
      await pluginQueueItem.proxy.setRealTarget(api)
    } else {
      setupFn(api)
    }
  } catch (e) {
    plugin.error = e
    if (SharedData.debugInfo) {
      console.error(e)
    }
  }
  ctx.currentPlugin = null
  ctx.plugins.push(plugin)
  ctx.bridge.send(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
    plugin: await serializePlugin(plugin),
  })

  const targetList = target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ = target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ || []
  targetList.push({
    pluginDescriptor,
    setupFn,
  })
}

export async function addQueuedPlugins (ctx: BackendContext) {
  if (target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(target.__VUE_DEVTOOLS_PLUGINS__)) {
    for (const queueItem of target.__VUE_DEVTOOLS_PLUGINS__) {
      await addPlugin(queueItem, ctx)
    }
    target.__VUE_DEVTOOLS_PLUGINS__ = null
  }
}

export async function addPreviouslyRegisteredPlugins (ctx: BackendContext) {
  if (target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ && Array.isArray(target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__)) {
    for (const queueItem of target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__) {
      await addPlugin(queueItem, ctx)
    }
  }
}

export async function sendPluginList (ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
    plugins: await Promise.all(ctx.plugins.map(p => serializePlugin(p))),
  })
}

export async function serializePlugin (plugin: Plugin) {
  return {
    id: plugin.descriptor.id,
    label: plugin.descriptor.label,
    appId: getAppRecordId(plugin.descriptor.app),
    packageName: plugin.descriptor.packageName,
    homepage: plugin.descriptor.homepage,
    logo: plugin.descriptor.logo,
    componentStateTypes: plugin.descriptor.componentStateTypes,
    settingsSchema: plugin.descriptor.settings,
  }
}
