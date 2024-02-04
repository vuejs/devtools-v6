import type { App as VueApp } from 'vue'
import { createApp as createVueApp } from 'vue'
import { BridgeEvents, SharedData, destroySharedData, initEnv, initSharedData, isChrome } from '@vue-devtools/shared-utils'
import App from './features/App.vue'
import { createRouterInstance } from './router'
import { getBridge, setBridge } from './features/bridge'
import { setAppConnected, setAppInitializing } from './features/connection'
import { setupAppsBridgeEvents } from './features/apps'
import { setupComponentsBridgeEvents } from './features/components/composable'
import { setupTimelineBridgeEvents } from './features/timeline/composable'
import { setupCustomInspectorBridgeEvents } from './features/inspector/custom/composable'
import { setupPluginsBridgeEvents } from './features/plugin'
import { setupPlugins } from './plugins'

// Capture and log devtool errors when running as actual extension
// so that we can debug it by inspecting the background page.
// We do want the errors to be thrown in the dev shell though.
export function createApp() {
  const router = createRouterInstance()

  const app = createVueApp(App)
  app.use(router)
  setupPlugins(app)

  if (isChrome) {
    app.config.errorHandler = (e, vm) => {
      getBridge()?.send('ERROR', {
        message: (e as Error).message,
        stack: (e as Error).stack,
        component: vm?.$options.name || (vm?.$options as any)._componentTag || 'anonymous',
      })
    }
  }

  return app
}

/**
 * Connect then init the app. We need to reconnect on every reload, because a
 * new backend will be injected.
 */
export function connectApp(app: VueApp, shell) {
  shell.connect(async (bridge) => {
    setBridge(bridge)
    // @TODO remove
    // @ts-expect-error custom prop on window
    window.bridge = bridge

    if (app.config.globalProperties.$shared) {
      destroySharedData()
    }
    else {
      Object.defineProperty(app.config.globalProperties, '$shared', {
        get: () => SharedData,
      })
    }

    initEnv(app)

    bridge.on(BridgeEvents.TO_FRONT_TITLE, ({ title }: { title: string }) => {
      document.title = `${title} - Vue devtools`
    })

    await initSharedData({
      bridge,
      persist: true,
    })

    if (SharedData.logDetected) {
      bridge.send('log-detected-vue')
    }

    setupAppsBridgeEvents(bridge)
    setupComponentsBridgeEvents(bridge)
    setupTimelineBridgeEvents(bridge)
    setupCustomInspectorBridgeEvents(bridge)
    setupPluginsBridgeEvents(bridge)

    // @TODO bridge listeners

    setAppConnected(true)
    setAppInitializing(false)
  })
}
