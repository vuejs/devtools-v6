import Vue from 'vue'
import { isChrome, initEnv } from '@utils/env'
import SharedData, { initSharedData, destroySharedData } from '@utils/shared-data'
import App from './features/App.vue'
import { createRouter } from './router'
import { setBridge } from './features/bridge'
import { setAppConnected, setAppInitializing } from './features/connection'
import { setupPlugins } from './plugins'
import { setupAppsBridgeEvents } from './features/apps'
import { setupComponentsBridgeEvents } from './features/components'
import { setupTimelineBridgeEvents } from './features/timeline'
import { setupCustomInspectorBridgeEvents } from './features/inspector/custom'
import { setupPluginsBridgeEvents } from './features/plugin'

setupPlugins()

// Capture and log devtool errors when running as actual extension
// so that we can debug it by inspecting the background page.
// We do want the errors to be thrown in the dev shell though.
if (isChrome) {
  Vue.config.errorHandler = (e, vm) => {
    bridge.send('ERROR', {
      message: e.message,
      stack: e.stack,
      component: vm.$options.name || vm.$options._componentTag || 'anonymous'
    })
  }
}

Vue.options.renderError = (h, e) => {
  return h('pre', {
    style: {
      backgroundColor: 'red',
      color: 'white',
      fontSize: '12px',
      padding: '10px'
    }
  }, e.stack)
}

export function createApp () {
  const router = createRouter()

  const app = new Vue({
    router,
    render: h => h(App)
  })

  // @TODO [Vue 3] Setup plugins

  return app
}

/**
 * Connect then init the app. We need to reconnect on every reload, because a
 * new backend will be injected.
 */
export function connectApp (app, shell) {
  shell.connect(async bridge => {
    setBridge(bridge)
    // @TODO remove
    window.bridge = bridge

    if (Object.prototype.hasOwnProperty.call(Vue.prototype, '$shared')) {
      destroySharedData()
    } else {
      Object.defineProperty(Vue.prototype, '$shared', {
        get: () => SharedData
      })
    }

    initEnv(Vue)

    await initSharedData({
      bridge,
      persist: true,
      Vue
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
