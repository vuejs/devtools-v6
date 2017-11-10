import { initDevTools } from 'src/devtools'
import Bridge from 'src/bridge'

initDevTools({
  connect(callback) {
    console.log('connect has been called')

    const wall = {
      listen(fn) {
        console.log('wall.listen has been called')
      },
      send(data) {
        console.log('wall.send has been called', data)
      }
    }
    const bridge = new Bridge(wall)

    callback(bridge)
  },
  onReload(fn) {
    console.log('onReload has been called')
  }
})