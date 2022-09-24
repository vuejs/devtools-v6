import { ref, computed } from 'vue'
import { BridgeEvents, Bridge } from '@vue-devtools/shared-utils'
import { getBridge } from '@front/features/bridge'
import { useRoute, useRouter } from '@front/util/router'
import { fetchLayers } from '../timeline/composable'

export interface AppRecord {
  id: string
  name: string
  version: string
  iframe: string
}

const apps = ref<AppRecord[]>([])

export function useCurrentApp () {
  const route = useRoute()
  const currentAppId = computed(() => route.value.params.appId)
  const currentApp = computed(() => apps.value.find(a => currentAppId.value === a.id))

  return {
    currentAppId,
    currentApp,
  }
}

export function useApps () {
  const router = useRouter()

  const {
    currentAppId,
    currentApp,
  } = useCurrentApp()

  function selectApp (id: string) {
    if (currentAppId.value !== id) {
      router.push({
        params: {
          appId: id.toString(),
          componentId: null,
        },
      })
    }
  }

  return {
    apps,
    currentAppId,
    currentApp,
    selectApp,
  }
}

function addApp (app: AppRecord) {
  removeApp(app.id)
  apps.value.push(app)
}

function removeApp (appId: string) {
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

export const pendingSelectAppId = ref<string>(null)

const pendingSelectPromises: (() => void)[] = []

export function waitForAppSelect (): Promise<void> {
  if (!pendingSelectAppId.value) {
    return Promise.resolve()
  } else {
    return new Promise(resolve => {
      pendingSelectPromises.push(resolve)
    })
  }
}

export function scanLegacyApps () {
  getBridge().send(BridgeEvents.TO_BACK_SCAN_LEGACY_APPS, {})
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

  bridge.on(BridgeEvents.TO_FRONT_APP_SELECTED, ({ id }) => {
    if (pendingSelectAppId.value === id) {
      pendingSelectAppId.value = null
      for (const resolve of pendingSelectPromises) {
        resolve()
      }
    }
  })

  fetchApps()
}
