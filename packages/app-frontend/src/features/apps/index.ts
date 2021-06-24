import { ref, computed, watch } from '@vue/composition-api'
import { BridgeEvents, Bridge } from '@vue-devtools/shared-utils'
import { useBridge, getBridge } from '@front/features/bridge'
import { useRoute, useRouter } from '@front/util/router'
import { fetchLayers } from '../timeline/composable'

export interface App {
  id: number
  name: string
  version: string
  iframe: string
}

const apps = ref<App[]>([])

export function useCurrentApp () {
  const route = useRoute()
  const currentAppId = computed(() => parseInt(route.value.params.appId))
  const currentApp = computed(() => apps.value.find(a => currentAppId.value === a.id))

  return {
    currentAppId,
    currentApp
  }
}

export function useApps () {
  const { bridge } = useBridge()
  const router = useRouter()

  const {
    currentAppId,
    currentApp
  } = useCurrentApp()

  function selectApp (id: number) {
    if (currentAppId.value !== id) {
      router.push({
        params: {
          appId: id.toString(),
          componentId: null
        }
      })
    }
  }

  watch(currentAppId, value => {
    bridge.send(BridgeEvents.TO_BACK_APP_SELECT, value)
  }, {
    immediate: true
  })

  return {
    apps,
    currentAppId,
    currentApp,
    selectApp
  }
}

function addApp (app: App) {
  removeApp(app.id)
  apps.value.push(app)
}

function removeApp (appId: number) {
  const index = apps.value.findIndex(app => app.id === appId)
  if (index !== -1) {
    apps.value.splice(index, 1)
  }
}

export function getApps () {
  return apps.value
}

function fetchApps () {
  getBridge().send(BridgeEvents.TO_BACK_APP_LIST, {})
}

export function setupAppsBridgeEvents (bridge: Bridge) {
  bridge.on(BridgeEvents.TO_FRONT_APP_ADD, ({ appRecord }) => {
    addApp(appRecord)
    fetchLayers()
  })

  bridge.on(BridgeEvents.TO_FRONT_APP_REMOVE, ({ id }) => {
    removeApp(id)
  })

  bridge.on(BridgeEvents.TO_FRONT_APP_LIST, ({ apps: list }) => {
    apps.value = list
  })

  fetchApps()
}
