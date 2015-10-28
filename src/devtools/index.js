import Vue from 'vue'
import appOptions from './App.vue'
const App = Vue.extend(appOptions)
window.app = null

/**
 * Create the main devtools app. Expects to be called with a shell interface
 * which implements a connect method.
 *
 * @param {Object} shell
 *        - connect(bridge => {})
 *        - onReload(reloadFn)
 */

export function initDevTools (shell) {
  shell.connect(bridge => {
    window.bridge = bridge
    reload()
  })
  shell.onReload(reload)
}

/**
 * Reload the devtools app.
 */

function reload () {
  if (app) {
    app.$destroy(true)
  }
  app = new App().$mount().$appendTo('body')
}
