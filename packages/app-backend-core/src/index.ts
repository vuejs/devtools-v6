import {
  createBackendContext,
  BackendContext
} from '@vue-devtools/app-backend-api'
import {
  Bridge,
  HookEvents,
  BridgeEvents,
  BuiltinTabs,
  initSharedData,
  BridgeSubscriptions,
  stringify
} from '@vue-devtools/shared-utils'
import { hook } from './global-hook'
import { subscribe, unsubscribe, isSubscribed } from './util/subscriptions'
import { highlight, unHighlight } from './highlighter'
import { setupTimeline, sendTimelineLayers, TimelineEventPayload } from './timeline'
import ComponentPicker from './component-pick'
import {
  sendComponentTreeData,
  sendSelectedComponentData,
  sendEmptyComponentData,
  getComponentId
} from './component'
import { addQueuedPlugins, addPlugin, sendPluginList } from './plugin'
import { PluginDescriptor, SetupFunction, TimelineLayerOptions, App, TimelineEventOptions } from '@vue/devtools-api'
import { registerApp, selectApp, mapAppRecord, getAppRecord } from './app'

let ctx: BackendContext

export async function initBackend (bridge: Bridge) {
  ctx = createBackendContext({
    bridge,
    hook
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
    }, ctx)
  } else {
    hook.once(HookEvents.INIT, connect)
  }

  hook.on(HookEvents.APP_ADD, app => {
    // Will init connect
    hook.emit(HookEvents.INIT)

    registerApp(app, ctx)
  })
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
    ctx.bridge.send(BridgeEvents.TO_FRONT_APP_LIST, {
      apps: ctx.appRecords.map(mapAppRecord)
    })
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_APP_SELECT, async id => {
    const record = ctx.appRecords.find(r => r.id === id)
    if (!record) {
      console.error(`App with id ${id} not found`)
    } else {
      await selectApp(record, ctx)
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
    const id = app ? getComponentId(app, uid, ctx) : ctx.currentInspectedComponentId
    if (id && isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendSelectedComponentData(id, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, (app, uid, parentUid) => {
    const parentId = getComponentId(app, parentUid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      // @TODO take into account current filter
      sendComponentTreeData(parentId, null, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
    const parentId = getComponentId(app, parentUid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      // @TODO take into account current filter
      sendComponentTreeData(parentId, null, ctx)
    }

    const id = getComponentId(app, uid, ctx)
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

  hook.on(HookEvents.TIMELINE_LAYER_ADDED, (options: TimelineLayerOptions, app: App) => {
    ctx.timelineLayers.push({
      ...options,
      app
    })
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {})
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, () => {
    sendTimelineLayers(ctx)
  })

  hook.on(HookEvents.TIMELINE_EVENT_ADDED, (options: TimelineEventOptions, app: App) => {
    const appId = app && getAppRecord(app, ctx)?.id
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      appId: options.all || !app || appId == null ? 'all' : appId,
      layerId: options.layerId,
      event: {
        time: options.event.time,
        data: stringify(options.event.data)
      }
    } as TimelineEventPayload)
  })

  // Plugins

  addQueuedPlugins(ctx)

  hook.on(HookEvents.SETUP_DEVTOOLS_PLUGIN, (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) => {
    addPlugin(pluginDescriptor, setupFn, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, () => {
    sendPluginList(ctx)
  })

  // @TODO
}

async function flushAll () {
  // @TODO notify frontend
}
