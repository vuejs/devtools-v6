import Vue from 'vue'

/**
 * Create the main devtools app.
 *
 * @param {Bridge} bridge
 */

export function initPanel (bridge) {
  var vm = new Vue({
    el: '#app',
    data: {
      message: 'Hello!'
    },
    template: '{{ message }}'
  })

  bridge.on('message', message => {
    vm.message = message
  })

  setTimeout(function () {
    bridge.send({
      event: 'message',
      payload: 'hello from panel'
    })
  }, 1000)
}
