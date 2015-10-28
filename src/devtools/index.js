import Vue from 'vue'
import appOptions from './App.vue'
const App = Vue.extend(appOptions)
window.app = null

/**
 * Create the main devtools app.
 */

export function initDevTools (shell) {

  shell.inject(bridge => {
    window.bridge = bridge
    app = new App().$mount().$appendTo('body')
  })

  shell.registerReloadFn(() => {
    if (app) {
      app.$destroy(true)
    }
    buildPanel(shell)
  })
}
