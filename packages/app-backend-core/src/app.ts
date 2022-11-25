import {
  AppRecord,
  SimpleAppRecord,
  AppRecordOptions,
  BackendContext,
  DevtoolsBackend,
} from '@vue-devtools/app-backend-api'
import { BridgeEvents, isBrowser, SharedData } from '@vue-devtools/shared-utils'
import { App } from '@vue/devtools-api'
import slug from 'speakingurl'
import { JobQueue } from './util/queue'
import { scan } from './legacy/scan'
import { addBuiltinLayers, removeLayersForApp } from './timeline'
import { getBackend, availableBackends } from './backend'
import { hook } from './global-hook.js'

const jobs = new JobQueue()

let recordId = 0

type AppRecordResolver = (record: AppRecord) => void | Promise<void>
const appRecordPromises = new Map<App, AppRecordResolver[]>()

export async function registerApp (options: AppRecordOptions, ctx: BackendContext) {
  return jobs.queue('regiserApp', () => registerAppJob(options, ctx))
}

async function registerAppJob (options: AppRecordOptions, ctx: BackendContext) {
  // Dedupe
  if (ctx.appRecords.find(a => a.options.app === options.app)) {
    return
  }

  if (!options.version) {
    throw new Error('[Vue Devtools] Vue version not found')
  }

  // Find correct backend
  const baseFrameworkVersion = parseInt(options.version.substring(0, options.version.indexOf('.')))
  for (let i = 0; i < availableBackends.length; i++) {
    const backendOptions = availableBackends[i]
    if (backendOptions.frameworkVersion === baseFrameworkVersion) {
      // Enable backend if it's not enabled
      const backend = getBackend(backendOptions, ctx)

      await createAppRecord(options, backend, ctx)

      break
    }
  }
}

async function createAppRecord (options: AppRecordOptions, backend: DevtoolsBackend, ctx: BackendContext) {
  const rootInstance = await backend.api.getAppRootInstance(options.app)
  if (rootInstance) {
    if ((await backend.api.getComponentDevtoolsOptions(rootInstance)).hide) {
      options.app._vueDevtools_hidden_ = true
      return
    }

    recordId++
    const name = await backend.api.getAppRecordName(options.app, recordId.toString())
    const id = getAppRecordId(options.app, slug(name))

    const [el]: HTMLElement[] = await backend.api.getComponentRootElements(rootInstance)

    const record: AppRecord = {
      id,
      name,
      options,
      backend,
      lastInspectedComponentId: null,
      instanceMap: new Map(),
      rootInstance,
      perfGroupIds: new Map(),
      iframe: isBrowser && document !== el.ownerDocument ? el.ownerDocument?.location?.pathname : null,
      meta: options.meta ?? {},
    }

    options.app.__VUE_DEVTOOLS_APP_RECORD__ = record
    const rootId = `${record.id}:root`
    record.instanceMap.set(rootId, record.rootInstance)
    record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId

    // Timeline
    addBuiltinLayers(record, ctx)

    ctx.appRecords.push(record)

    if (backend.options.setupApp) {
      backend.options.setupApp(backend.api, record)
    }

    await backend.api.registerApplication(options.app)

    ctx.bridge.send(BridgeEvents.TO_FRONT_APP_ADD, {
      appRecord: mapAppRecord(record),
    })

    if (appRecordPromises.has(options.app)) {
      for (const r of appRecordPromises.get(options.app)) {
        await r(record)
      }
    }

    // Auto select first app
    if (ctx.currentAppRecord == null) {
      await selectApp(record, ctx)
    }
  } else if (SharedData.debugInfo) {
    console.warn('[Vue devtools] No root instance found for app, it might have been unmounted', options.app)
  }
}

export async function selectApp (record: AppRecord, ctx: BackendContext) {
  ctx.currentAppRecord = record
  ctx.currentInspectedComponentId = record.lastInspectedComponentId
  ctx.bridge.send(BridgeEvents.TO_FRONT_APP_SELECTED, {
    id: record.id,
    lastInspectedComponentId: record.lastInspectedComponentId,
  })
}

export function mapAppRecord (record: AppRecord): SimpleAppRecord {
  return {
    id: record.id,
    name: record.name,
    version: record.options.version,
    iframe: record.iframe,
  }
}

const appIds = new Set()

export function getAppRecordId (app, defaultId?: string): string {
  if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
    return app.__VUE_DEVTOOLS_APP_RECORD_ID__
  }
  let id = defaultId ?? (recordId++).toString()

  if (defaultId && appIds.has(id)) {
    let count = 1
    while (appIds.has(`${defaultId}_${count}`)) {
      count++
    }
    id = `${defaultId}_${count}`
  }

  appIds.add(id)

  app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id
  return id
}

export async function getAppRecord (app: any, ctx: BackendContext): Promise<AppRecord> {
  const record = app.__VUE_DEVTOOLS_APP_RECORD__ ?? ctx.appRecords.find(ar => ar.options.app === app)
  if (record) {
    return record
  }
  if (app._vueDevtools_hidden_) return null
  return new Promise((resolve, reject) => {
    let resolvers = appRecordPromises.get(app)
    let timedOut = false
    if (!resolvers) {
      resolvers = []
      appRecordPromises.set(app, resolvers)
    }
    const fn = (record) => {
      if (!timedOut) {
        clearTimeout(timer)
        resolve(record)
      }
    }
    resolvers.push(fn)
    const timer = setTimeout(() => {
      timedOut = true
      const index = resolvers.indexOf(fn)
      if (index !== -1) resolvers.splice(index, 1)
      if (SharedData.debugInfo) {
        // eslint-disable-next-line no-console
        console.log('Timed out waiting for app record', app)
      }
      reject(new Error(`Timed out getting app record for app`))
    }, 60000)
  })
}

export function waitForAppsRegistration () {
  return jobs.queue('waitForAppsRegistrationNoop', async () => { /* NOOP */ })
}

export async function sendApps (ctx: BackendContext) {
  const appRecords = []

  for (const appRecord of ctx.appRecords) {
    appRecords.push(appRecord)
  }

  ctx.bridge.send(BridgeEvents.TO_FRONT_APP_LIST, {
    apps: appRecords.map(mapAppRecord),
  })
}

function removeAppRecord (appRecord: AppRecord, ctx: BackendContext) {
  try {
    appIds.delete(appRecord.id)
    const index = ctx.appRecords.indexOf(appRecord)
    if (index !== -1) ctx.appRecords.splice(index, 1)
    removeLayersForApp(appRecord.options.app, ctx)
    ctx.bridge.send(BridgeEvents.TO_FRONT_APP_REMOVE, { id: appRecord.id })
  } catch (e) {
    if (SharedData.debugInfo) {
      console.error(e)
    }
  }
}

export async function removeApp (app: App, ctx: BackendContext) {
  try {
    const appRecord = await getAppRecord(app, ctx)
    if (appRecord) {
      removeAppRecord(appRecord, ctx)
    }
  } catch (e) {
    if (SharedData.debugInfo) {
      console.error(e)
    }
  }
}

let scanTimeout: any

// eslint-disable-next-line camelcase
export function _legacy_getAndRegisterApps (ctx: BackendContext, clear = false) {
  setTimeout(() => {
    try {
      if (clear) {
        // Remove apps that are legacy
        ctx.appRecords.forEach(appRecord => {
          if (appRecord.meta.Vue) {
            removeAppRecord(appRecord, ctx)
          }
        })
      }

      const apps = scan()

      clearTimeout(scanTimeout)
      if (!apps.length) {
        scanTimeout = setTimeout(() => _legacy_getAndRegisterApps(ctx), 1000)
      }

      apps.forEach(app => {
        const Vue = hook.Vue
        registerApp({
          app,
          types: {},
          version: Vue?.version,
          meta: {
            Vue,
          },
        }, ctx)
      })
    } catch (e) {
      console.error(`Error scanning for legacy apps:`)
      console.error(e)
    }
  }, 0)
}
