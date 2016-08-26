import { stringify, parse } from '../util'

export function initVuexBackend (hook, bridge) {
  const store = hook.store
  bridge.send('vuex:init', stringify(store.state))

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', (mutation, state) => {
    bridge.send('vuex:mutation', {
      mutation: {
        type: mutation.type,
        payload: stringify(mutation.payload)
      },
      timestamp: Date.now(),
      state: stringify(state)
    })
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', parse(state))
  })
}
