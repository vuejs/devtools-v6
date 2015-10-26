import Vue from 'vue'
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
  app = new Vue({
    data: function () {
      return {
        message: 'Hello!'
      }
    },
    template: '{{ message }}',
    ready: function () {
      shell.inject(bridge => {
        bridge.on('message', message => {
          vm.message = message
        })

        setTimeout(function () {
          bridge.message('hello from panel')
        }, 1000)
      })
    }
  })
  app.$mount().$appendTo('body')
}
