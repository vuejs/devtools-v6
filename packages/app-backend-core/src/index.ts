import {
  AppRecord,
  SimpleAppRecord,
  AppRecordOptions,
  BackendContext,
  createBackendContext,
  DevtoolsBackend,
  App
} from '@vue-devtools/app-backend-api'
import {
  Bridge,
  HookEvents,
  BridgeEvents,
  BuiltinTabs,
  initSharedData,
  BridgeSubscriptions
} from '@vue-devtools/shared-utils'

import { backend as backendVue1 } from '@vue-devtools/app-backend-vue1'
import { backend as backendVue2 } from '@vue-devtools/app-backend-vue2'
import { backend as backendVue3 } from '@vue-devtools/app-backend-vue3'

import { hook } from './global-hook'
import { getAppRecord } from './util/app'
import { subscribe, unsubscribe, isSubscribed } from './util/subscriptions'
import { highlight, unHighlight } from './highlighter'
import { setupTimeline } from './timeline'
import ComponentPicker from './component-pick'
import { sendComponentTreeData, sendSelectedComponentData, sendEmptyComponentData } from './component'

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

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_TREE, ({ instanceId, filter }) => {
    if (instanceId === '_root') {
      instanceId = `${ctx.currentAppRecord.id}:root`
    }
    sendComponentTreeData(instanceId, filter, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
    if (instanceId === '_root') {
      instanceId = `${ctx.currentAppRecord.id}:root`
    }
    sendSelectedComponentData(instanceId, ctx)
  })

  hook.on(HookEvents.COMPONENT_UPDATED, (app, uid) => {
    const id = getComponentId(app, uid)
    if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendSelectedComponentData(id, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, (app, uid, parentUid) => {
    const parentId = getComponentId(app, parentUid)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      // @TODO take into account current filter
      sendComponentTreeData(parentId, null, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
    const parentId = getComponentId(app, parentUid)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      // @TODO take into account current filter
      sendComponentTreeData(parentId, null, ctx)
    }

    const id = getComponentId(app, uid)
    if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendEmptyComponentData(id, ctx)
    }
    ctx.currentAppRecord.instanceMap.delete(id)
  })

  // Highlighter

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, instanceId => {
    highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, () => {
    unHighlight()
  })

  // Component picker

  const componentPicker = new ComponentPicker(ctx)

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_PICK, () => {
    componentPicker.startSelecting()
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_PICK_CANCELED, () => {
    componentPicker.stopSelecting()
  })

  // Timeline

  setupTimeline(ctx)

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
      options.app.__VUE_DEVTOOLS_APP_RECORD__ = record
      const rootId = `${record.id}:root`
      record.instanceMap.set(rootId, record.rootInstance)
      record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId
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

function getComponentId (app: App, uid: number) {
  const appRecord = getAppRecord(app, ctx)
  return `${appRecord.id}:${uid === 0 ? 'root' : uid}`
}
