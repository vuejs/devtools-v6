import { setStorage, getStorage } from './storage'
import { Bridge } from './bridge'
import { isMac } from './env'

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
  performanceMonitoringEnabled: true,
  editableProps: false,
  logDetected: true,
  vuexNewBackend: false,
  vuexAutoload: false,
  vuexGroupGettersByModule: true,
  showMenuScrollTip: true,
  timelineTimeGrid: true,
  timelineScreenshots: true,
  menuStepScrolling: isMac,
  pluginPermissions: {}
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
  'timeFormat',
  'showMenuScrollTip',
  'timelineTimeGrid',
  'timelineScreenshots',
  'menuStepScrolling',
  'pluginPermissions',
  'performanceMonitoringEnabled'
]

const storageVersion = '6.0.0-alpha.1'

// ---- INTERNALS ---- //

let bridge
// List of fields to persist to storage (disabled if 'false')
// This should be unique to each shared data client to prevent conflicts
let persist = false
let data

let initRetryInterval
let initRetryCount = 0

export interface SharedDataParams {
  bridge: Bridge
  persist: boolean
  Vue?: any
}

const initCbs = []

export function initSharedData (params: SharedDataParams) {
  return new Promise((resolve) => {
    // Mandatory params
    bridge = params.bridge
    persist = !!params.persist

    if (persist) {
      if (process.env.NODE_ENV !== 'production') console.log('[shared data] Master init in progress...')
      // Load persisted fields
      persisted.forEach(key => {
        const value = getStorage(`vue-devtools-${storageVersion}:shared-data:${key}`)
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

    data = {
      ...internalSharedData
    }

    if (params.Vue) {
      data = params.Vue.observable(data)
    }

    // Update value from other shared data clients
    bridge.on('shared-data:set', ({ key, value }) => {
      setValue(key, value)
    })

    initCbs.forEach(cb => cb())
  })
}

export function onSharedDataInit (cb) {
  initCbs.push(cb)
  return () => {
    const index = initCbs.indexOf(cb)
    if (index !== -1) initCbs.splice(index, 1)
  }
}

export function destroySharedData () {
  bridge.removeAllListeners('shared-data:set')
  watchers = {}
}

let watchers = {}

function setValue (key: string, value: any) {
  // Storage
  if (persist && persisted.includes(key)) {
    setStorage(`vue-devtools-${storageVersion}:shared-data:${key}`, value)
  }
  const oldValue = data[key]
  data[key] = value
  const handlers = watchers[key]
  if (handlers) {
    handlers.forEach(h => h(value, oldValue))
  }
  // Validate Proxy set trap
  return true
}

function sendValue (key: string, value: any) {
  bridge && bridge.send('shared-data:set', {
    key,
    value
  })
}

export function watchSharedData (prop, handler) {
  const list = watchers[prop] || (watchers[prop] = [])
  list.push(handler)
  return () => {
    const index = list.indexOf(handler)
    if (index !== -1) list.splice(index, 1)
  }
}

const proxy: Partial<typeof internalSharedData> = {}
Object.keys(internalSharedData).forEach(key => {
  Object.defineProperty(proxy, key, {
    configurable: false,
    get: () => data[key],
    set: (value) => {
      sendValue(key, value)
      setValue(key, value)
    }
  })
})

export default proxy
