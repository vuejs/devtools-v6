import {
  AppRecord,
  SimpleAppRecord,
  AppRecordOptions,
  BackendContext,
  DevtoolsBackend
} from '@vue-devtools/app-backend-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { JobQueue } from './util/queue'

import { backend as backendVue1 } from '@vue-devtools/app-backend-vue1'
import { backend as backendVue2 } from '@vue-devtools/app-backend-vue2'
import { backend as backendVue3 } from '@vue-devtools/app-backend-vue3'

const availableBackends = [
  backendVue1,
  backendVue2,
  backendVue3
]

const enabledBackends: Set<DevtoolsBackend> = new Set()
const jobs = new JobQueue()

let recordId = 0

export async function registerApp (options: AppRecordOptions, ctx: BackendContext) {
  return jobs.queue(() => registerAppJob(options, ctx))
}

async function registerAppJob (options: AppRecordOptions, ctx: BackendContext) {
  // Dedupe
  if (ctx.appRecords.find(a => a.options === options)) {
    return
  }

  let record: AppRecord
  const baseFrameworkVersion = parseInt(options.version.substr(0, options.version.indexOf('.')))
  for (let i = 0; i < availableBackends.length; i++) {
    const backend = availableBackends[i]
    if (backend.frameworkVersion === baseFrameworkVersion) {
      // Enabled backend
      if (!enabledBackends.has(backend)) {
        console.log('Enabling backend for Vue', backend.frameworkVersion)
        backend.setup(ctx.api)
        enabledBackends.add(backend)
      }

      // Create app record
      const id = getAppRecordId(options.app)
      const name = await ctx.api.getAppRecordName(options.app, id)
      record = {
        id,
        name,
        options,
        backend,
        lastInspectedComponentId: null,
        instanceMap: new Map(),
        rootInstance: await ctx.api.getAppRootInstance(options.app),
        timelineEventMap: new Map()
      }
      options.app.__VUE_DEVTOOLS_APP_RECORD__ = record
      const rootId = `${record.id}:root`
      record.instanceMap.set(rootId, record.rootInstance)
      record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId
      await ctx.api.registerApplication(record)
      ctx.appRecords.push(record)
      ctx.bridge.send(BridgeEvents.TO_FRONT_APP_ADD, {
        appRecord: mapAppRecord(record)
      })

      // Auto select first app
      if (ctx.currentAppRecord == null) {
        await selectApp(record, ctx)
      }

      break
    }
  }
}

export async function selectApp (record: AppRecord, ctx: BackendContext) {
  ctx.currentAppRecord = record
  ctx.currentInspectedComponentId = record.lastInspectedComponentId
  ctx.bridge.send(BridgeEvents.TO_FRONT_APP_SELECTED, {
    id: record.id,
    lastInspectedComponentId: record.lastInspectedComponentId
  })
}

export function mapAppRecord (record: AppRecord): SimpleAppRecord {
  return {
    id: record.id,
    name: record.name,
    version: record.options.version
  }
}

export function getAppRecordId (app): number {
  if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
    return app.__VUE_DEVTOOLS_APP_RECORD_ID__
  }
  const id = recordId++
  app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id
  return id
}

export function getAppRecord (app: any, ctx: BackendContext) {
  return ctx.appRecords.find(ar => ar.options.app === app)
}

export function waitForAppsRegistration () {
  return jobs.queue(async () => { /* NOOP */ })
}
