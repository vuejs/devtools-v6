import {
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
  stringify,
  initSharedData,
  BridgeSubscriptions
} from '@vue-devtools/shared-utils'

import { backend as backendVue1 } from '@vue-devtools/app-backend-vue1'
import { backend as backendVue2 } from '@vue-devtools/app-backend-vue2'
import { backend as backendVue3 } from '@vue-devtools/app-backend-vue3'

import { hook } from './global-hook'
import { getAppRecord } from './util/app'
import { subscribe, unsubscribe, isSubscribed } from './util/subscriptions'

const availableBackends = [
  backendVue1,
  backendVue2,
  backendVue3
]

const enabledBackends: Set<DevtoolsBackend> = new Set()

let ctx: BackendContext

let recordId = 0

export async function initBackend (bridge: Bridge) {
  ctx = createBackendContext({
    bridge
  })

  await initSharedData({
    bridge,
    persist: false
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

  hook.on(HookEvents.APP_ADD, app => {
    // Will init connect
    hook.emit(HookEvents.INIT)

    registerApp(app)
  })

  if (hook.apps.length) {
    hook.emit(HookEvents.INIT)
    hook.apps.forEach(app => {
      registerApp(app)
    })
  }
}

function connect () {
  ctx.currentTab = BuiltinTabs.COMPONENTS

  // Subscriptions

  ctx.bridge.on(BridgeEvents.TO_BACK_SUBSCRIBE, ({ type, payload }) => {
    subscribe(type, payload)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_UNSUBSCRIBE, ({ type, payload }) => {
    unsubscribe(type, payload)
  })

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
      await selectApp(record)
    }
  })

  // Components

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_TREE, (instanceId) => {
    if (instanceId === '_root') {
      instanceId = `${ctx.currentAppRecord.id}:root`
    }
    sendComponentTreeData(instanceId)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
    if (instanceId === '_root') {
      instanceId = `${ctx.currentAppRecord.id}:root`
    }
    sendSelectedComponentData(instanceId)
  })

  hook.on(HookEvents.COMPONENT_UPDATED, (app, uid) => {
    const appRecord = getAppRecord(app, ctx)
    const id = `${appRecord.id}:${uid}`
    if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendSelectedComponentData(id)
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, (app, uid, parentUid) => {
    const appRecord = getAppRecord(app, ctx)
    const parentId = `${appRecord.id}:${parentUid}`
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      sendComponentTreeData(parentId)
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
    const appRecord = getAppRecord(app, ctx)
    const parentId = `${appRecord.id}:${parentUid}`
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      sendComponentTreeData(parentId)
    }

    const id = `${appRecord.id}:${uid}`
    if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendEmptyComponentData(id)
    }
    ctx.currentAppRecord.instanceMap.delete(id)
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
  const baseFrameworkVersion = parseInt(options.version.substr(0, options.version.indexOf('.')))
  for (let i = 0; i < availableBackends.length; i++) {
    const backend = availableBackends[i]
    if (backend.frameworkVersion === baseFrameworkVersion) {
      // Enabled backend
      if (!enabledBackends.has(backend)) {
        console.log('Enabling backend for Vue', backend.frameworkVersion)
        await backend.setup(ctx.api)
      }

      // Create app record
      const id = recordId++
      const name = await ctx.api.getAppRecordName(options.app, id)
      record = {
        id,
        name,
        options,
        backend,
        lastInspectedComponentId: null,
        instanceMap: new Map(),
        rootInstance: await ctx.api.getAppRootInstance(options.app)
      }
      record.instanceMap.set(`${record.id}:root`, record.rootInstance)
      await ctx.api.registerApplication(record)
      ctx.appRecords.push(record)
      ctx.bridge.send(BridgeEvents.TO_FRONT_APP_ADD, mapAppRecord(record))

      // Auto select first app
      if (ctx.currentAppRecord == null) {
        await selectApp(record)
      }

      break
    }
  }
}

async function selectApp (record: AppRecord) {
  ctx.currentAppRecord = record
  ctx.currentInspectedComponentId = record.lastInspectedComponentId
  ctx.bridge.send(BridgeEvents.TO_FRONT_APP_SELECTED, {
    id: record.id,
    lastInspectedComponentId: record.lastInspectedComponentId
  })
}

function mapAppRecord (record: AppRecord): SimpleAppRecord {
  return {
    id: record.id,
    name: record.name,
    version: record.options.version
  }
}

async function flushAll () {
  // @TODO notify frontend
}

async function sendComponentTreeData (instanceId: string) {
  if (!instanceId) return
  const instance = ctx.currentAppRecord.instanceMap.get(instanceId)
  if (!instance) {
    console.warn(`Instance uid=${instanceId} not found`)
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, {
      instanceId,
      treeData: null
    })
  } else {
    const maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1
    const payload = {
      instanceId,
      treeData: stringify(await ctx.api.walkComponentTree(instance, maxDepth))
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, payload)
  }
}

async function sendSelectedComponentData (instanceId: string) {
  if (!instanceId) return
  const instance = ctx.currentAppRecord.instanceMap.get(instanceId)
  if (!instance) {
    console.warn(`Instance uid=${instanceId} not found`)
    sendEmptyComponentData(instanceId)
  } else {
    ctx.currentInspectedComponentId = instanceId
    ctx.currentAppRecord.lastInspectedComponentId = instanceId
    const payload = {
      instanceId,
      data: stringify(await ctx.api.inspectComponent(instance))
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload)
  }
}

function sendEmptyComponentData (instanceId: string) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
    instanceId,
    data: null
  })
}
