import Vue from 'vue'
import App from './components/App.vue'
import store from './vuex/store'

Vue.config.debug = true

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
    app = new Vue({
      store,
      template: '<app></app>',
      components: { App }
    }).$mount().$appendTo('#container')
  })
}
