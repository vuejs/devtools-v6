import { stringify, parse } from 'src/util'
import SharedData from 'src/shared-data'

export function initVuexBackend (hook, bridge) {
  const store = hook.store

  const getSnapshot = () => stringify({
    state: store.state,
    getters: store.getters || {}
  })

  let mutationIndex = 0
  const baseSnapshot = getSnapshot()
  const snapshots = [
    { index: -1, state: baseSnapshot }
  ]
  const mutations = []

  bridge.send('vuex:init', baseSnapshot)

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', ({ type, payload }) => {
    if (!SharedData.recordVuex) return

    const index = mutationIndex++

    mutations.push({
      type,
      payload,
      index,
      handlers: store._mutations[type]
    })

    bridge.send('vuex:mutation', {
      mutation: {
        type: type,
        payload: stringify(payload),
        index
      },
      timestamp: Date.now()
    })
  })

  // devtool -> application
  bridge.on('vuex:travel-to-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true))
  })

  bridge.on('vuex:import-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true))
    bridge.send('vuex:init', getSnapshot())
  })

  bridge.on('vuex:inspect-state', index => {
    SharedData.snapshotLoading = {
      current: 0,
      total: 1
    }

    const currentState = store.state

    // Get most recent snapshot for target index
    // for faster replay
    let snapshot
    for (const s of snapshots) {
      if (s.index > index) {
        break
      } else {
        snapshot = s
      }
    }

    // Snapshot was already replayed
    if (snapshot.index === index) {
      bridge.send('vuex:inspected-state', snapshot.state)
      return
    }

    const { state } = parse(snapshot.state, true)
    store.replaceState(state)

    const total = snapshot.index - index
    SharedData.snapshotLoading = {
      current: 0,
      total
    }

    // Replay mutations
    for (let i = snapshot.index + 1; i <= index; i++) {
      const mutation = mutations[i]
      mutation.handlers.forEach(handler => handler(state, mutation.payload))
      if (i !== index && i % SharedData.cacheVuexSnapshotsEvery === 0) {
        takeSnapshot(i, state)
      }
      SharedData.snapshotLoading = {
        current: i - snapshot.index,
        total
      }
    }

    // Send final state after replay
    const resultState = takeSnapshot(index, state)
    bridge.send('vuex:inspected-state', resultState)

    // Restore user state
    store.replaceState(currentState)

    SharedData.snapshotLoading = null
  })

  function takeSnapshot (index, state) {
    const snapshot = getSnapshot()
    snapshots.push({
      index,
      state: snapshot
    })
    // Delete old cached snapshots
    if (snapshots.length > 5) {
      snapshots.splice(1, 1)
    }
    return snapshot
  }
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
