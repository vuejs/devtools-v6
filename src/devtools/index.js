import Vue from 'vue'
import App from './components/App.vue'
import store from './store'
import { parse } from '../util'

let app = null

/**
 * Create the main devtools app. Expects to be called with a shell interface
 * which implements a connect method.
 *
 * @param {Object} shell
 *        - connect(bridge => {})
 *        - onReload(reloadFn)
 */

export function initDevTools (shell) {
  initApp(shell)
  shell.onReload(() => {
    if (app) {
      app.$destroy()
    }
    bridge.removeAllListeners()
    initApp(shell)
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

    bridge.once('ready', version => {
      store.commit(
        'SHOW_MESSAGE',
        'Ready. Detected Vue ' + version + '.'
      )
    })

    bridge.once('proxy-fail', () => {
      store.commit(
        'SHOW_MESSAGE',
        'Proxy injection failed.'
      )
    })

    bridge.on('flush', payload => {
      store.commit('FLUSH', parse(payload))
    })

    bridge.on('instance-details', details => {
      store.commit('RECEIVE_INSTANCE_DETAILS', parse(details))
    })

    bridge.on('vuex:init', state => {
      store.commit('vuex/INIT', state)
    })

    bridge.on('vuex:mutation', payload => {
      store.commit('vuex/RECEIVE_MUTATION', payload)
    })

    app = new Vue({
      store,
      render (h) {
        return h(App)
      }
    }).$mount('#app')
  })
}
