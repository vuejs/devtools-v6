import Vue from 'vue'
import appOptions from './App.vue'
const App = Vue.extend(appOptions)
window.app = null

/**
 * Create the main devtools app.
 */

export function initPanel (shell) {
  buildPanel(shell)
  shell.onReload(() => {
    if (app) {
      app.$destroy(true)
    }
    buildPanel(shell)
  })
}

function buildPanel (shell) {
  shell.inject(bridge => {
    app = new App().$mount().$appendTo('body')
    bridge.message('yo')
    app.init(bridge)
  })
}
