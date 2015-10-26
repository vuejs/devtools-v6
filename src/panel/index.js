import Vue from 'vue'

/**
 * Create the main devtools app.
 *
 * @param {Object} wall
 *        - listen(fn)
 *        - send(data)
 *        - disconnect
 */

export function initPanel (wall) {
  var vm = new Vue({
    el: '#app',
    data: {
      message: 'Hello!'
    },
    template: '{{ message }}'
  })

  wall.listen(function (message) {
    vm.message = message
  })

  setTimeout(function () {
    wall.send('hello dude')
  }, 1000)
}
