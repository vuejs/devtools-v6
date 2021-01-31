import Vue from 'vue'
import { computed, ref } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { getBridge } from '../bridge'
import { useApps } from '../apps'

const pluginsPerApp = ref({})

function getPlugins (appId) {
  let plugins = pluginsPerApp.value[appId]
  if (!plugins) {
    plugins = []
    Vue.set(pluginsPerApp.value, appId, plugins)
    // Read the property again to make it reactive
    plugins = pluginsPerApp.value[appId]
  }
  return plugins
}

function fetchPlugins () {
  getBridge().send(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, {})
}

export function usePlugins () {
  const { currentAppId } = useApps()

  const plugins = computed(() => getPlugins(currentAppId.value))

  return {
    plugins
  }
}

export function setupPluginsBridgeEvents (bridge) {
  bridge.on(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, ({ plugin }) => {
    getPlugins(plugin.appId).push(plugin)
  })

  bridge.on(BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, ({ plugins }) => {
    for (const plugin of plugins) {
      getPlugins(plugin.appId).push(plugin)
    }
  })

  fetchPlugins()
}
