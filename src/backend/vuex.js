import { stringify, parse } from 'src/util'
import SharedData from 'src/shared-data'
import { set, get } from '../util'
import Vue from 'vue'

export function initVuexBackend (hook, bridge, isLegacy) {
  const store = hook.store

  let snapshotsVm = null
  const updateSnapshotsVm = (state) => {
    snapshotsVm = new Vue({
      data: {
        $$state: state || {}
      },
      computed: store._vm.$options.computed
    })
  }

  const getStateSnapshot = (_store = store) => stringify(_store.state)

  let baseStateSnapshot, stateSnapshots, mutations, lastState
  let registeredModules = {}
  let allTimeModules = {}

  const earlyModules = hook.flushStoreModules()

  // Init additional state
  earlyModules.forEach(({ path, module, options }) => {
    if (!options || options.preserveState !== true) {
      const state = typeof module.state === 'function' ? module.state() : module.state
      const parentState = path.length === 1 ? hook.initialStore.state : get(hook.initialStore.state, path.slice(0, -1))
      set(parentState, path[path.length - 1], state)
    }
  })

  updateSnapshotsVm()

  function reset () {
    baseStateSnapshot = getStateSnapshot(hook.initialStore)
    mutations = []
    resetSnapshotCache()
  }

  function resetSnapshotCache (force = true) {
    stateSnapshots = [
      { index: -1, state: baseStateSnapshot }
    ]
  }

  reset()

  function addModule (path, module, options) {
    if (typeof path === 'string') path = [path]

    const key = path.join('/')
    registeredModules[key] = allTimeModules[key] = {
      path,
      module,
      options
    }

    if (SharedData.recordVuex) {
      addMutation(`Register module: ${key}`, {
        path,
        module,
        options
      }, {
        registerModule: true
      })
    }
  }

  const origRegisterModule = store.registerModule.bind(store)
  store.registerModule = (path, module, options) => {
    addModule(path, module, options)
    origRegisterModule(path, module, options)
  }

  const origUnregisterModule = store.unregisterModule.bind(store)
  store.unregisterModule = (path) => {
    if (typeof path === 'string') path = [path]

    delete registeredModules[path.join('/')]

    if (SharedData.recordVuex) {
      addMutation(`Unregister module: ${path.join('/')}`, {
        path
      }, {
        unregisterModule: true
      })
    }

    origUnregisterModule(path)
  }

  bridge.send('vuex:init')

  earlyModules.forEach(({ path, module, options }) => {
    addModule(path, module, options)
  })

  // deal with multiple backend injections
  hook.off('vuex:mutation')

  // application -> devtool
  hook.on('vuex:mutation', ({ type, payload }) => {
    if (!SharedData.recordVuex) return

    addMutation(type, payload)
  })

  function addMutation (type, payload, options = {}) {
    const index = mutations.length

    mutations.push({
      type,
      payload,
      index,
      handlers: store._mutations[type],
      registeredModules: Object.keys(registeredModules),
      ...options
    })

    bridge.send('vuex:mutation', {
      mutation: {
        type: type,
        payload: stringify(payload),
        index
      },
      timestamp: Date.now()
    })
  }

  // devtool -> application
  bridge.on('vuex:travel-to-state', ({ index, apply }) => {
    const snapshot = replayMutations(index)
    const { state } = parse(snapshot, true)
    bridge.send('vuex:inspected-state', {
      index,
      snapshot
    })
    if (apply) {
      ensureRegisteredModules(mutations[index])
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
    ensureRegisteredModules(mutations[index - 1])
    mutations = mutations.slice(0, index)
  })

  bridge.on('vuex:import-state', state => {
    const parsed = parse(state, true)
    hook.initialStore.state = parsed
    reset()
    hook.emit('vuex:travel-to-state', parsed)
    bridge.send('vuex:init')
    bridge.send('vuex:inspected-state', {
      index: -1,
      snapshot: getSnapshot(baseStateSnapshot)
    })
  })

  bridge.on('vuex:inspect-state', index => {
    if (index === -1) {
      bridge.send('vuex:inspected-state', {
        index,
        snapshot: getSnapshot(baseStateSnapshot)
      })
    } else {
      const snapshot = replayMutations(index)
      bridge.send('vuex:inspected-state', {
        index,
        snapshot
      })
    }
  })

  function replayMutations (index) {
    const originalVm = store._vm
    store._vm = snapshotsVm

    let tempRemovedModules = []
    let tempAddedModules = []

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
      const startMutation = mutations[stateSnapshot.index]
      if (startMutation) {
        tempRemovedModules = Object.keys(registeredModules).filter(m => !startMutation.registeredModules.includes(m))
      } else {
        tempRemovedModules = Object.keys(registeredModules)
      }
      tempRemovedModules.forEach(m => {
        origUnregisterModule(m.split('/'))
      })

      const state = parse(stateSnapshot.state, true)
      updateSnapshotsVm(state)
      store.replaceState(state)

      SharedData.snapshotLoading = true

      // Replay mutations
      for (let i = stateSnapshot.index + 1; i <= index; i++) {
        const mutation = mutations[i]
        if (mutation.registerModule) {
          const { path, module, options } = mutation.payload
          tempAddedModules.push(path.join('/'))
          origRegisterModule(path, module, options)
          updateSnapshotsVm(store.state)
        } else if (mutation.unregisterModule && get(store.state, mutation.payload.path.join('.')) != null) {
          const path = mutation.payload.path
          const index = tempAddedModules.indexOf(path.join('/'))
          if (index !== -1) tempAddedModules.splice(index, 1)
          origUnregisterModule(path)
          updateSnapshotsVm(store.state)
        } else if (mutation.handlers) {
          store._committing = true
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
          store._committing = false
        }

        if (i !== index && i % SharedData.cacheVuexSnapshotsEvery === 0) {
          takeStateSnapshot(i)
        }
      }

      // Send final state after replay
      resultState = getStateSnapshot()
    }

    lastState = resultState

    const result = stringify({
      state: store.state,
      getters: store.getters || {}
    })

    // Restore user state
    tempAddedModules.forEach(m => {
      origUnregisterModule(m.split('/'))
    })
    tempRemovedModules.forEach(m => {
      const { path, module, options } = registeredModules[m]
      origRegisterModule(path, module, options)
    })
    store._vm = originalVm

    return result
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
    let originalVm
    if (stateSnapshot) {
      originalVm = store._vm
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

  function ensureRegisteredModules (mutation) {
    if (mutation) {
      mutation.registeredModules.forEach(m => {
        if (!Object.keys(registeredModules).includes(m)) {
          const data = allTimeModules[m]
          if (data) {
            const { path, module, options } = data
            origRegisterModule(path, module, options)
            registeredModules[path.join('/')] = data
          }
        }
      })
      Object.keys(registeredModules).forEach(m => {
        if (!mutation.registeredModules.includes(m)) {
          origUnregisterModule(m.split('/'))
          delete registeredModules[m]
        }
      })
      updateSnapshotsVm(store.state)
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
