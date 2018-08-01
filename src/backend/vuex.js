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
  bridge.on('vuex:travel-to-state', index => {
    const snapshot = replayMutations(index)
    const { state } = parse(snapshot, true)
    hook.emit('vuex:travel-to-state', state)
    bridge.send('vuex:inspected-state', {
      index,
      snapshot
    })
  })

  bridge.on('vuex:import-state', state => {
    hook.emit('vuex:travel-to-state', parse(state, true))
    bridge.send('vuex:init', getSnapshot())
  })

  bridge.on('vuex:inspect-state', index => {
    const snapshot = replayMutations(index)
    bridge.send('vuex:inspected-state', {
      index,
      snapshot
    })
  })

  function replayMutations (index) {
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
      return snapshot.state
    }

    const { state } = parse(snapshot.state, true)
    store.replaceState(state)

    const total = index - snapshot.index
    SharedData.snapshotLoading = {
      current: 0,
      total
    }
    let time = Date.now()

    // Replay mutations
    for (let i = snapshot.index + 1; i <= index; i++) {
      const mutation = mutations[i]
      mutation.handlers.forEach(handler => handler(state, mutation.payload))
      if (i !== index && i % SharedData.cacheVuexSnapshotsEvery === 0) {
        takeSnapshot(i, state)
      }

      const now = Date.now()
      if (now - time <= 100) {
        time = now
        SharedData.snapshotLoading = {
          current: i - snapshot.index,
          total
        }
      }
    }

    // Send final state after replay
    const resultState = getSnapshot()

    // Restore user state
    store.replaceState(currentState)

    return resultState
  }

  function takeSnapshot (index) {
    snapshots.push({
      index,
      state: getSnapshot()
    })
    // Delete old cached snapshots
    if (snapshots.length > SharedData.cacheVuexSnapshotsLimit) {
      snapshots.splice(1, 1)
    }
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
