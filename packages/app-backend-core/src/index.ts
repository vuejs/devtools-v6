import {
  App,
  AppRecord,
  SimpleAppRecord,
  AppRecordOptions,
  BackendContext,
  createBackendContext,
  DevtoolsBackend
} from '@vue-devtools/app-backend-api'
import {
  Bridge,
  HookEvents,
  BridgeEvents,
  BuiltinTabs,
  stringify
} from '@vue-devtools/shared-utils'

import { backend as backendVue1 } from '@vue-devtools/app-backend-vue1'
import { backend as backendVue2 } from '@vue-devtools/app-backend-vue2'
import { backend as backendVue3 } from '@vue-devtools/app-backend-vue3'

import { hook } from './global-hook'

const availableBackends = [
  backendVue1,
  backendVue2,
  backendVue3
]

const enabledBackends: Set<DevtoolsBackend> = new Set()

let ctx: BackendContext

let recordId = 0

export function initBackend (bridge: Bridge) {
  ctx = createBackendContext({
    bridge
  })

  if (hook.Vue) {
    connect()
    registerApp({
      app: hook.Vue,
      types: {},
      version: hook.Vue.version
    })
  } else {
    hook.once(HookEvents.INIT, connect)
  }
}

function connect () {
  ctx.currentTab = BuiltinTabs.COMPONENTS

  // Tabs

  ctx.bridge.on(BridgeEvents.TO_BACK_TAB_SWITCH, async tab => {
    ctx.currentTab = tab
    await flushAll()
  })

  // Apps

  ctx.bridge.on(BridgeEvents.TO_BACK_APP_LIST, () => {
    ctx.bridge.send(BridgeEvents.TO_FRONT_APP_LIST, ctx.appRecords.map(mapAppRecord))
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_APP_SELECT, async id => {
    const record = ctx.appRecords.find(r => r.id === id)
    if (!record) {
      console.error(`App with id ${id} not found`)
    } else {
      ctx.currentAppRecord = record
      ctx.bridge.send(BridgeEvents.TO_FRONT_APP_SELECTED, id)
    }
  })

  // Flush

  // the backend may get injected to the same page multiple times
  // if the user closes and reopens the devtools.
  // make sure there's only one flush listener.
  hook.off(HookEvents.FLUSH)
  hook.on(HookEvents.FLUSH, async () => {
    await flushAll()
  })

  // @TODO
}

export async function registerApp (options: AppRecordOptions) {
  let record: AppRecord
  const baseFrameworkVersion = parseInt(options.version.substr(options.version.indexOf('.')))
  for (let i = 0; i < availableBackends.length; i++) {
    const backend = availableBackends[i]
    if (backend.frameworkVersion === baseFrameworkVersion) {
      // Enabled backend
      if (!enabledBackends.has(backend)) {
        await backend.setup(ctx.api)
      }

      // Create app record
      const id = recordId++
      const name = await ctx.api.getAppRecordName(options.app, id)
      record = {
        id,
        name,
        options,
        backend
      }
      await ctx.api.registerApplication(record)
      ctx.appRecords.push(record)
      ctx.bridge.send(BridgeEvents.TO_FRONT_APP_ADD, mapAppRecord(record))

      // Auto select first app
      if (ctx.currentAppRecord == null) {
        ctx.currentAppRecord = record
        ctx.bridge.send(BridgeEvents.TO_FRONT_APP_SELECTED, record.id)
      }

      break
    }
  }
}

function mapAppRecord (record: AppRecord): SimpleAppRecord {
  return {
    id: record.id,
    name: record.name
  }
}

async function flushAll () {
  await flushComponents()
}

async function flushComponents () {
  if (ctx.currentTab === BuiltinTabs.COMPONENTS) {
    const rootInstance = await ctx.api.getAppRootInstance(ctx.currentAppRecord)
    if (!rootInstance) {
      console.warn('App is not mounted')
    } else {
      // @TODO
      const payload = stringify({
        inspectedInstance: await ctx.api.inspectComponent(rootInstance),
        instances: await ctx.api.walkComponentTree(rootInstance)
      })
      ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_FLUSH, payload)
    }
  }
}
