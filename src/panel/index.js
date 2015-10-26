import Vue from 'vue'

/**
 * Create the main devtools app.
 */

export function initPanel (shell) {
  var vm = new Vue({
    el: '#app',
    data: {
      message: 'Hello!'
    },
    template: '{{ message }}'
  })

  shell.inject(bridge => {
    bridge.on('message', message => {
      vm.message = message
    })

    setTimeout(function () {
      bridge.message('hello from panel')
    }, 1000)
  })
}
