import { stringify, parse } from 'src/util'
import SharedData from 'src/shared-data'
import { set } from '../util'
import Vue from 'vue'

export function initVuexBackend (hook, bridge, isLegacy) {
  const store = hook.store

  let originalVm = store._vm
  const snapshotsVm = new Vue({
    data: {
      $$state: {}
    },
    computed: originalVm.$options.computed
  })

  const getStateSnapshot = (_store = store) => stringify(_store.state)

  let baseStateSnapshot, stateSnapshots, mutations, lastState

  function reset () {
    baseStateSnapshot = getStateSnapshot(hook.initialStore)
    hook.initialStore = undefined
    mutations = []
    resetSnapshotCache()
  }

  function resetSnapshotCache () {
    stateSnapshots = [
      { index: -1, state: baseStateSnapshot }
    ]
  }

  reset()

  bridge.send('vuex:init')

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
    const stateSnapshot = replayMutations(index)
    const state = parse(stateSnapshot, true)
    bridge.send('vuex:inspected-state', {
      index,
      snapshot: getSnapshot(stateSnapshot)
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
    baseStateSnapshot = lastState
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
    bridge.send('vuex:init')
  })

  bridge.on('vuex:inspect-state', index => {
    if (index === -1) {
      bridge.send('vuex:inspected-state', {
        index,
        snapshot: getSnapshot(baseStateSnapshot)
      })
    } else {
      const stateSnapshot = replayMutations(index)
      bridge.send('vuex:inspected-state', {
        index,
        snapshot: getSnapshot(stateSnapshot)
      })
    }
  })

  function replayMutations (index) {
    store._vm = snapshotsVm

    // Get most recent snapshot for target index
    // for faster replay
    let stateSnapshot
    for (let i = 0; i < stateSnapshots.length; i++) {
      const s = stateSnapshots[i]
      if (s.index > index) {
        break
      } else {
        stateSnapshot = s
      }
    }

    let resultState

    // Snapshot was already replayed
    if (stateSnapshot.index === index) {
      resultState = stateSnapshot.state
    } else {
      const state = parse(stateSnapshot.state, true)
      store.replaceState(state)

      SharedData.snapshotLoading = true

      // Replay mutations
      for (let i = stateSnapshot.index + 1; i <= index; i++) {
        const mutation = mutations[i]
        if (mutation.handlers) {
          if (Array.isArray(mutation.handlers)) {
            mutation.handlers.forEach(handler => handler(mutation.payload))
          } else {
            if (isLegacy) {
              // Vuex 1
              mutation.handlers(store.state, mutation.payload)
            } else {
              mutation.handlers(mutation.payload)
            }
          }
        }

        if (i !== index && i % SharedData.cacheVuexSnapshotsEvery === 0) {
          takeStateSnapshot(i, state)
        }
      }

      // Send final state after replay
      resultState = getStateSnapshot()
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
    store._committing = true
    set(store.state, path, parsedValue)
    store._committing = false
    bridge.send('vuex:inspected-state', {
      index,
      snapshot: getSnapshot()
    })
  })

  function takeStateSnapshot (index) {
    stateSnapshots.push({
      index,
      state: getStateSnapshot()
    })
    // Delete old cached snapshots
    if (stateSnapshots.length > SharedData.cacheVuexSnapshotsLimit) {
      stateSnapshots.splice(1, 1)
    }
  }

  function getSnapshot (stateSnapshot = null) {
    if (stateSnapshot) {
      store._vm = snapshotsVm
      store.replaceState(parse(stateSnapshot, true))
    }

    const result = stringify({
      state: store.state,
      getters: store.getters || {}
    })

    if (stateSnapshot) {
      // Restore user state
      store._vm = originalVm
    }

    return result
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
