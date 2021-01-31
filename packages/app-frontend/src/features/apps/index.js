import { ref, computed, watch } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useBridge, getBridge } from '../bridge'
import { useRoute, useRouter } from '@front/util/router'

const apps = ref([])

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

  function selectApp (id) {
    if (currentAppId.value !== id) {
      router.push({
        params: {
          appId: id,
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

function addApp (app) {
  removeApp(app.id)
  apps.value.push(app)
}

function removeApp (appId) {
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

export function setupAppsBridgeEvents (bridge) {
  bridge.on(BridgeEvents.TO_FRONT_APP_ADD, ({ appRecord }) => {
    addApp(appRecord)
  })

  bridge.on(BridgeEvents.TO_FRONT_APP_REMOVE, ({ id }) => {
    removeApp(id)
  })

  bridge.on(BridgeEvents.TO_FRONT_APP_LIST, ({ apps: list }) => {
    apps.value = list
  })

  fetchApps()
}
