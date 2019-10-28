import io from 'socket.io-client'
import { initDevTools } from '@front'
import Bridge from '@utils/bridge'

const port = window.process.env.PORT || 8098
const socket = io('http://localhost:' + port)
const $ = document.querySelector.bind(document)
const $intro = $('#intro')

let reload = null
let introTimer

socket.on('vue-devtools-disconnect-devtools', () => {
  introTimer = setTimeout(() => {
    $intro.classList.remove('hidden')
  }, 2000)
})

socket.on('vue-devtools-init', () => {
  clearTimeout(introTimer)
  $intro.classList.add('hidden')

  // Reset attached listeners
  socket.off('vue-message')

  // If new page is opened reload devtools
  if (reload) return reload()

  initDevTools({
    connect (callback) {
      const wall = {
        listen (fn) {
          socket.on('vue-message', data => fn(data))
        },
        send (data) {
          console.log('devtools -> backend', data)
          socket.emit('vue-message', data)
        }
      }
      const bridge = new Bridge(wall)

      callback(bridge)
    },
    onReload (fn) {
      reload = fn
    }
  })
})
