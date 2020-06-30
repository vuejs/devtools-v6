import Vue from 'vue'
import AppConnecting from './AppConnecting.vue'
import App from './App.vue'
import router from './router'
import { createStore } from './store'
import * as filters from './filters'
import './plugins'
import VuexResolve from './views/vuex/resolve'
import { parse } from '@utils/util'
import { isChrome, initEnv } from '@utils/env'
import SharedData, { init as initSharedData, destroy as destroySharedData } from '@utils/shared-data'
import { init as initStorage } from '@utils/storage'

// register filters
for (const key in filters) {
  Vue.filter(key, filters[key])
}

// UI

let panelShown = !isChrome
let pendingAction = null

const chromeTheme = isChrome ? chrome.devtools.panels.themeName : undefined
const isBeta = process.env.RELEASE_CHANNEL === 'beta'

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

  chrome.runtime.onMessage.addListener(request => {
    if (request === 'vue-panel-shown') {
      onPanelShown()
    } else if (request === 'vue-panel-hidden') {
      onPanelHidden()
    } else if (request === 'vue-get-context-menu-target') {
      getContextMenuInstance()
    }
  })
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

let app = new Vue({
  render: (h) => h(AppConnecting)
}).$mount('#app')

/**
 * Create the main devtools app. Expects to be called with a shell interface
 * which implements a connect method.
 *
 * @param {Object} shell
 *        - connect(bridge => {})
 *        - onReload(reloadFn)
 */

export function initDevTools (shell) {
  initStorage().then(() => {
    initApp(shell)
    shell.onReload(() => {
      if (app) {
        app.$el.classList.add('disconnected')
        app.$destroy()
      }
      bridge.removeAllListeners()
      initApp(shell)
    })
  })
}

/**
 * Connect then init the app. We need to reconnect on every reload, because a
 * new backend will be injected.
 *
 * @param {Object} shell
 */

function initApp (shell) {
  shell.connect(bridge => {
    window.bridge = bridge

    if (Vue.prototype.hasOwnProperty('$shared')) {
      destroySharedData()
    } else {
      Object.defineProperty(Vue.prototype, '$shared', {
        get: () => SharedData
      })
    }

    initSharedData({
      bridge,
      Vue,
      persist: true
    }).then(() => {
      if (SharedData.logDetected) {
        bridge.send('log-detected-vue')
      }

      const store = createStore()

      bridge.once('ready', version => {
        store.commit(
          'SHOW_MESSAGE',
          'Ready. Detected Vue ' + version + '.'
        )
        bridge.send('events:toggle-recording', store.state.events.enabled)

        if (isChrome) {
          chrome.runtime.sendMessage('vue-panel-load')
        }
      })

      bridge.once('proxy-fail', () => {
        store.commit(
          'SHOW_MESSAGE',
          'Proxy injection failed.'
        )
      })

      bridge.on('flush', payload => {
        store.commit('components/FLUSH', parse(payload))
      })

      bridge.on('instance-details', details => {
        store.commit('components/RECEIVE_INSTANCE_DETAILS', parse(details))
      })

      bridge.on('toggle-instance', payload => {
        store.commit('components/TOGGLE_INSTANCE', parse(payload))
      })

      bridge.on('vuex:init', () => {
        store.commit('vuex/INIT')
      })

      bridge.on('vuex:mutation', payload => {
        store.dispatch('vuex/receiveMutation', payload)
      })

      bridge.on('vuex:inspected-state', ({ index, snapshot }) => {
        store.commit('vuex/RECEIVE_STATE', { index, snapshot })

        if (index === -1) {
          store.commit('vuex/UPDATE_BASE_STATE', snapshot)
        } else if (store.getters['vuex/absoluteInspectedIndex'] === index) {
          store.commit('vuex/UPDATE_INSPECTED_STATE', snapshot)
        } else {
          console.log('vuex:inspected-state wrong index', index, 'expected:', store.getters['vuex/absoluteInspectedIndex'])
        }

        if (VuexResolve.travel) {
          VuexResolve.travel(snapshot)
        }

        requestAnimationFrame(() => {
          SharedData.snapshotLoading = false
        })
      })

      bridge.on('event:triggered', payload => {
        store.commit('events/RECEIVE_EVENT', parse(payload))
        if (router.currentRoute.name !== 'events') {
          store.commit('events/INCREASE_NEW_EVENT_COUNT')
        }
      })

      bridge.on('router:init', payload => {
        store.commit('router/INIT', parse(payload))
      })

      bridge.on('router:changed', payload => {
        store.commit('router/CHANGED', parse(payload))
      })

      bridge.on('routes:init', payload => {
        store.commit('routes/INIT', parse(payload))
      })

      bridge.on('routes:changed', payload => {
        store.commit('routes/CHANGED', parse(payload))
      })

      bridge.on('events:reset', () => {
        store.commit('events/RESET')
      })

      bridge.on('inspect-instance', id => {
        ensurePaneShown(() => {
          bridge.send('select-instance', id)
          router.push({ name: 'components' })
          const instance = store.state.components.instancesMap[id]
          instance && store.dispatch('components/toggleInstance', {
            instance,
            expanded: true,
            parent: true
          })
        })
      })

      bridge.on('perf:add-metric', data => {
        store.commit('perf/ADD_METRIC', data)
      })

      bridge.on('perf:upsert-metric', ({ type, data }) => {
        store.commit('perf/UPSERT_METRIC', { type, data })
      })

      initEnv(Vue)

      if (app) {
        app.$destroy()
      }

      app = new Vue({
        extends: App,
        router,
        store,

        data: {
          isBeta
        },

        watch: {
          '$shared.theme': {
            handler (value) {
              if (value === 'dark' || value === 'high-contrast' || (value === 'auto' && chromeTheme === 'dark')) {
                document.body.classList.add('vue-ui-dark-mode')
              } else {
                document.body.classList.remove('vue-ui-dark-mode')
              }
              if (value === 'high-contrast') {
                document.body.classList.add('vue-ui-high-contrast')
              } else {
                document.body.classList.remove('vue-ui-high-contrast')
              }
            },
            immediate: true
          }
        }
      }).$mount('#app')
    })
  })
}

function getContextMenuInstance () {
  bridge.send('get-context-menu-target')
}

// Pane visibility management

function ensurePaneShown (cb) {
  if (panelShown) {
    cb()
  } else {
    pendingAction = cb
  }
}

function onPanelShown () {
  panelShown = true
  if (pendingAction) {
    pendingAction()
    pendingAction = null
  }
}

function onPanelHidden () {
  panelShown = false
}
