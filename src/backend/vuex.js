import { stringify, parse } from 'src/util'
import SharedData from 'src/shared-data'
import { set } from '../util'
import Vue from 'vue'

export function initVuexBackend (hook, bridge) {
  const store = hook.store

  let originalVm = store._vm
  const snapshotsVm = new Vue({
    data: {
      $$state: {}
    },
    computed: originalVm.$options.computed
  })

  const getSnapshot = (_store = store) => stringify({
    state: _store.state,
    getters: _store.getters || {}
  })

  let baseSnapshot, snapshots, mutations, lastState

  function reset () {
    baseSnapshot = getSnapshot(hook.initialStore)
    hook.initialStore = undefined
    mutations = []
    resetSnapshotCache()
  }

  function resetSnapshotCache () {
    snapshots = [
      { index: -1, state: baseSnapshot }
    ]
  }

  reset()

  bridge.send('vuex:init', baseSnapshot)

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', ({ type, payload }) => {
    if (!SharedData.recordVuex) return

    const index = mutations.length

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
  bridge.on('vuex:travel-to-state', ({ index, apply }) => {
    const snapshot = replayMutations(index)
    const { state } = parse(snapshot, true)
    bridge.send('vuex:inspected-state', {
      index,
      snapshot
    })
    if (apply) {
      hook.emit('vuex:travel-to-state', state)
    }
  })

  bridge.on('vuex:commit-all', () => {
    reset()
  })

  bridge.on('vuex:revert-all', () => {
    reset()
  })

  bridge.on('vuex:commit', index => {
    baseSnapshot = lastState
    resetSnapshotCache()
    mutations = mutations.slice(index + 1)
    mutations.forEach((mutation, index) => {
      mutation.index = index
    })
  })

  bridge.on('vuex:revert', index => {
    resetSnapshotCache()
    mutations = mutations.slice(0, index)
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
    store._vm = snapshotsVm

    // Get most recent snapshot for target index
    // for faster replay
    let snapshot
    for (let i = 0; i < snapshots.length; i++) {
      const s = snapshots[i]
      if (s.index > index) {
        break
      } else {
        snapshot = s
      }
    }

    let resultState

    // Snapshot was already replayed
    if (snapshot.index === index) {
      resultState = snapshot.state
    } else {
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
      resultState = getSnapshot()
    }

    lastState = resultState

    // Restore user state
    store._vm = originalVm

    return resultState
  }

  bridge.on('vuex:edit-state', ({ index, value, path }) => {
    let parsedValue
    if (value) {
      parsedValue = parse(value, true)
    }
    set(store.state, path, parsedValue)
    bridge.send('vuex:inspected-state', {
      index,
      snapshot: getSnapshot()
    })
  })

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
