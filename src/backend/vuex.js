import CircularJSON from 'circular-json'
import { stringify } from '../util'

export function initVuexBackend (hook, bridge) {
  const store = hook.store
  bridge.send('vuex:init', stringify(store.state))

  // application -> devtool
  hook.on('vuex:mutation', (mutation, state) => {
    bridge.send('vuex:mutation', {
      mutation,
      timestamp: Date.now(),
      state: stringify(state)
    })
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', CircularJSON.parse(state))
  })
}
