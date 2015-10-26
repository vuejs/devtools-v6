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
  app = new App().$mount().$appendTo('body')
  shell.inject(bridge => {
    bridge.on('message', message => {
      app.message = message
    })

    bridge.on('flush', instances => {
      app.instances = instances
    })

    setTimeout(function () {
      bridge.message('hello from panel')
    }, 1000)
  })
}
