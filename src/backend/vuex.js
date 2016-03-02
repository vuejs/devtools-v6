export function initVuexBackend (hook, bridge) {
  const store = hook.store

  // application -> devtool
  hook.on('vuex:mutation', (mutation, state) => {
    // record mutation
    bridge.send('vuex:mutation', {
      mutation,
      state
    })
  })

  // devtool -> application
  bridge.on('vuex:revert', () => {
    hook.emit('vuex:revert')
  })

  bridge.on('vuex:reset', () => {
    hook.emit('vuex:reset')
  })
}
