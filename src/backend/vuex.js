import CircularJSON from 'circular-json'
import { stringify } from '../util'

export function initVuexBackend (hook, bridge) {
  const store = hook.store
  bridge.send('vuex:init', stringify(store.state))

  // application -> devtool
  hook.on('vuex:mutation', (mutation, state) => {
    if (hook.currentTab === 'vuex') {
      bridge.send('vuex:mutation', stringify({
        mutation,
        state
      }))
    }
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', CircularJSON.parse(state))
  })
}
