import * as storage from './storage'

// Initial state
const internalSharedData = {
  openInEditorHost: '/',
  componentNameStyle: 'class',
  theme: 'auto',
  displayDensity: 'low',
  timeFormat: 'default',
  recordVuex: true,
  cacheVuexSnapshotsEvery: 50,
  cacheVuexSnapshotsLimit: 10,
  snapshotLoading: false,
  recordPerf: false,
  editableProps: false,
  logDetected: true,
  vuexNewBackend: false,
  vuexAutoload: false,
  vuexGroupGettersByModule: true
}

const persisted = [
  'componentNameStyle',
  'theme',
  'displayDensity',
  'recordVuex',
  'editableProps',
  'logDetected',
  'vuexNewBackend',
  'vuexAutoload',
  'vuexGroupGettersByModule',
  'timeFormat'
]

// ---- INTERNALS ---- //

let Vue
let bridge
// List of fields to persist to storage (disabled if 'false')
// This should be unique to each shared data client to prevent conflicts
let persist = false
// For reactivity, we wrap the data in a Vue instance
let vm

let initRetryInterval
let initRetryCount = 0

export function init (params) {
  return new Promise((resolve, reject) => {
    // Mandatory params
    bridge = params.bridge
    Vue = params.Vue
    persist = !!params.persist

    if (persist) {
      if (process.env.NODE_ENV !== 'production') console.log('[shared data] Master init in progress...')
      // Load persisted fields
      persisted.forEach(key => {
        const value = storage.get(`shared-data:${key}`)
        if (value !== null) {
          internalSharedData[key] = value
        }
      })
      bridge.on('shared-data:load', () => {
        // Send all fields
        Object.keys(internalSharedData).forEach(key => {
          sendValue(key, internalSharedData[key])
        })
        bridge.send('shared-data:load-complete')
      })
      bridge.on('shared-data:init-complete', () => {
        if (process.env.NODE_ENV !== 'production') console.log('[shared data] Master init complete')
        clearInterval(initRetryInterval)
        resolve()
      })

      bridge.send('shared-data:master-init-waiting')
      // In case backend init is executed after frontend
      bridge.on('shared-data:slave-init-waiting', () => {
        bridge.send('shared-data:master-init-waiting')
      })

      initRetryCount = 0
      initRetryInterval = setInterval(() => {
        if (process.env.NODE_ENV !== 'production') console.log('[shared data] Master init retrying...')
        bridge.send('shared-data:master-init-waiting')
        initRetryCount++
        if (initRetryCount > 30) {
          clearInterval(initRetryInterval)
          console.error('[shared data] Master init failed')
        }
      }, 2000)
    } else {
      if (process.env.NODE_ENV !== 'production') console.log('[shared data] Slave init in progress...')
      bridge.on('shared-data:master-init-waiting', () => {
        if (process.env.NODE_ENV !== 'production') console.log('[shared data] Slave loading data...')
        // Load all persisted shared data
        bridge.send('shared-data:load')
        bridge.once('shared-data:load-complete', () => {
          if (process.env.NODE_ENV !== 'production') console.log('[shared data] Slave init complete')
          bridge.send('shared-data:init-complete')
          resolve()
        })
      })
      bridge.send('shared-data:slave-init-waiting')
    }

    // Wrapper Vue instance
    vm = new Vue({
      data: internalSharedData
    })

    // Update value from other shared data clients
    bridge.on('shared-data:set', ({ key, value }) => {
      setValue(key, value)
    })
  })
}

export function destroy () {
  bridge.removeAllListeners('shared-data:set')
  vm.$destroy()
}

function setValue (key, value) {
  // Storage
  if (persist && persisted.includes(key)) {
    storage.set(`shared-data:${key}`, value)
  }
  vm[key] = value
  // Validate Proxy set trap
  return true
}

function sendValue (key, value) {
  bridge && bridge.send('shared-data:set', {
    key,
    value
  })
}

export function watch (...args) {
  vm.$watch(...args)
}

const proxy = {}
Object.keys(internalSharedData).forEach(key => {
  Object.defineProperty(proxy, key, {
    configurable: false,
    get: () => vm && vm.$data[key],
    set: (value) => {
      sendValue(key, value)
      setValue(key, value)
    }
  })
})

export default proxy
