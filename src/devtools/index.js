import Vue from 'vue'
import App from './components/App.vue'
import store from './vuex/store'
import CircularJSON from 'circular-json-es6'

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
      app.$destroy(true)
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
      store.dispatch(
        'SHOW_MESSAGE',
        'Ready. Detected Vue ' + version + '.'
      )
    })

    bridge.once('proxy-fail', () => {
      store.dispatch(
        'SHOW_MESSAGE',
        'Proxy injection failed.'
      )
    })

    bridge.on('flush', payload => {
      store.dispatch('FLUSH', CircularJSON.parse(payload))
    })

    bridge.on('instance-details', details => {
      store.dispatch('RECEIVE_INSTANCE_DETAILS', CircularJSON.parse(details))
    })

    bridge.on('vuex:init', state => {
      store.dispatch('vuex/INIT', state)
    })

    bridge.on('vuex:mutation', payload => {
      store.dispatch('vuex/RECEIVE_MUTATION', payload)
    })

    app = new Vue({
      store,
      template: '<app></app>',
      components: { App }
    }).$mount().$appendTo('#container')
  })
}
