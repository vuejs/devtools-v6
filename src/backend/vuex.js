import { stringify, parse } from 'src/util'

export function initVuexBackend (hook, bridge) {
  const store = hook.store
  let recording = true

  const getSnapshot = () => stringify({
    state: store.state,
    getters: store.getters || {}
  })

  const serializeMutation = mutation => {
    return {
      mutation: {
        type: mutation.type,
        payload: stringify(mutation.payload)
      },
      timestamp: Date.now(),
      snapshot: getSnapshot()
    }
  }

  // get store buffer with buffered mutations
  // (it may be undefined, if Vuex uses version <2.x) // TODO: fill Vuex version
  let storeBuffer = store._devtoolBuffer
  // remove buffer from store so it doesn't leak memory
  store._devtoolBuffer = undefined

  bridge.send('vuex:init', getSnapshot())

  if (recording && Array.isArray(storeBuffer)) {
    storeBuffer.forEach(mutation => {
      bridge.send('vuex:mutation', serializeMutation(mutation))
    })
  }

  // release buffer memory
  storeBuffer = null

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', mutation => {
    if (!recording) return
    bridge.send('vuex:mutation', serializeMutation(mutation))
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true))
  })

  bridge.on('vuex:import-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true))
    bridge.send('vuex:init', getSnapshot())
  })

  bridge.on('vuex:toggle-recording', enabled => {
    recording = enabled
  })
}

export function getCustomStoreDetails (store) {
  return {
    _custom: {
      type: 'store',
      display: 'Store',
      value: {
        state: store.state,
        getters: store.getters
      },
      fields: {
        abstract: true
      }
    }
  }
}
