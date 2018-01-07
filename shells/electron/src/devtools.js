import io from 'socket.io-client'
import ip from 'ip'
import { initDevTools } from 'src/devtools'
import Bridge from 'src/bridge'

const port = process.env.PORT || 8098
const socket = io('http://localhost:' + port)
const localIp = ip.address()
const $ = document.querySelector.bind(document)

const $localhost = $('#script-localhost')
const $byIp = $('#script-byip')
const $intro = $('#intro')

$localhost.value = '<' + 'script src="http://localhost:' + port + '"><' + '/script>'
$byIp.value = '<' + 'script src="http://' + localIp + ':' + port + '"><' + '/script>'

function selectAll () {
  this.selectionStart = 0
  this.selectionEnd = this.value.length
}

$localhost.onclick = selectAll
$byIp.onclick = selectAll

let reload = null

socket.on('vue-devtools-init', () => {
  // If new page is opened reload devtools
  if (reload) return reload()

  initDevTools({
    connect (callback) {
      $intro.classList.add('hidden')

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
