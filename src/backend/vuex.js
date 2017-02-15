import { stringify, parse } from '../util'

export function initVuexBackend (hook, bridge) {
  const store = hook.store
  let recording = true
  bridge.send('vuex:init', {
    state: stringify(store.state),
    getters: stringify(store.getters)
  })

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', (mutation, state) => {
    if (!recording) return
    bridge.send('vuex:mutation', {
      mutation: {
        type: mutation.type,
        payload: stringify(mutation.payload)
      },
      timestamp: Date.now(),
      state: stringify(state),
      getters: stringify(store.getters)
    })
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true /* revive */))
  })

  bridge.on('vuex:import-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true /* revive */))
    bridge.send('vuex:init', {
      state: state,
      getters: stringify(store.getters)
    })
  })

  bridge.on('vuex:toggle-recording', enabled => {
    recording = enabled
  })
}
