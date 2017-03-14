import { stringify } from 'src/util'

export function initVuexBackend (hook, bridge) {
  const store = hook.store
  let recording = true

  const getSnapshot = () => stringify({
    state: store.state,
    getters: store.getters
  })

  bridge.send('vuex:init', getSnapshot())

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', mutation => {
    if (!recording) return
    bridge.send('vuex:mutation', {
      mutation: {
        type: mutation.type,
        payload: stringify(mutation.payload)
      },
      timestamp: Date.now(),
      snapshot: getSnapshot()
    })
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', state)
  })

  bridge.on('vuex:import-state', state => {
    hook.emit('vuex:travel-to-state', state)
    bridge.send('vuex:init', getSnapshot())
  })

  bridge.on('vuex:toggle-recording', enabled => {
    recording = enabled
  })
}
