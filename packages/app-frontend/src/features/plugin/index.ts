import { computed, ref, set } from 'vue'
import { PluginDescriptor } from '@vue/devtools-api'
import { Bridge, BridgeEvents } from '@vue-devtools/shared-utils'
import { getBridge } from '@front/features/bridge'
import { useCurrentApp } from '@front/features/apps'

export interface Plugin {
  id: string
  label: string
  appId: string
  packageName: string
  homepage: string
  logo: string
  componentStateTypes: string[]
  settingsSchema?: PluginDescriptor['settings']
}

interface PluginsPerApp {
  [appId: string]: Plugin[]
}

const pluginsPerApp = ref<PluginsPerApp>({})

function getPlugins (appId: string) {
  let plugins = pluginsPerApp.value[appId]
  if (!plugins) {
    plugins = []
    set(pluginsPerApp.value, appId, plugins)
    // Read the property again to make it reactive
    plugins = pluginsPerApp.value[appId]
  }
  return plugins
}

function fetchPlugins () {
  getBridge().send(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, {})
}

export function usePlugins () {
  const { currentAppId } = useCurrentApp()

  const plugins = computed(() => getPlugins(currentAppId.value))

  return {
    plugins,
  }
}

export function useComponentStateTypePlugin () {
  const { plugins } = usePlugins()

  function getStateTypePlugin (type: string) {
    return plugins.value.find(p => p.componentStateTypes?.includes(type))
  }

  return {
    getStateTypePlugin,
  }
}

function addPlugin (plugin: Plugin) {
  const list = getPlugins(plugin.appId)
  const index = list.findIndex(p => p.id === plugin.id)
  if (index !== -1) {
    list.splice(index, 1, plugin)
  } else {
    list.push(plugin)
  }
}

export function setupPluginsBridgeEvents (bridge: Bridge) {
  bridge.on(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, async ({ plugin }) => {
    await addPlugin(plugin)
  })

  bridge.on(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, async ({ plugins }) => {
    for (const plugin of plugins) {
      await addPlugin(plugin)
    }
  })

  fetchPlugins()
}
