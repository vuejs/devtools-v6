import {
  createBackendContext,
  BackendContext,
  Plugin
} from '@vue-devtools/app-backend-api'
import {
  Bridge,
  HookEvents,
  BridgeEvents,
  BuiltinTabs,
  initSharedData,
  BridgeSubscriptions
} from '@vue-devtools/shared-utils'
import { hook } from './global-hook'
import { subscribe, unsubscribe, isSubscribed } from './util/subscriptions'
import { highlight, unHighlight } from './highlighter'
import { setupTimeline, sendTimelineLayers, addTimelineEvent, clearTimeline, sendTimelineEventData } from './timeline'
import ComponentPicker from './component-pick'
import {
  sendComponentTreeData,
  sendSelectedComponentData,
  sendEmptyComponentData,
  getComponentId,
  editComponentState,
  getComponentInstance
} from './component'
import { addQueuedPlugins, addPlugin, sendPluginList, addPreviouslyRegisteredPlugins } from './plugin'
import { PluginDescriptor, SetupFunction, TimelineLayerOptions, App, TimelineEventOptions, CustomInspectorOptions } from '@vue/devtools-api'
import { registerApp, selectApp, mapAppRecord, getAppRecordId, waitForAppsRegistration } from './app'
import { sendInspectorTree, getInspector, getInspectorWithAppId, sendInspectorState, editInspectorState } from './inspector'
import { showScreenshot } from './timeline-screenshot'

let ctx: BackendContext
let connected = false

export async function initBackend (bridge: Bridge) {
  connected = false
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

  hook.on(HookEvents.APP_ADD, async app => {
    await registerApp(app, ctx)

    // Will init connect
    hook.emit(HookEvents.INIT)
  })

  // In case we close and open devtools again
  if (hook.apps.length) {
    hook.apps.forEach(app => {
      registerApp(app, ctx)
      connect()
    })
  }
}

async function connect () {
  if (connected) {
    return
  }
  connected = true

  await waitForAppsRegistration()

  console.log('%cconnect', 'color: blue;')

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
    if (id == null) return
    const record = ctx.appRecords.find(r => r.id === id)
    if (!record) {
      console.error(`App with id ${id} not found`)
    } else {
      await selectApp(record, ctx)
    }
  })

  // Components

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_TREE, ({ instanceId, filter }) => {
    sendComponentTreeData(instanceId, filter, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
    sendSelectedComponentData(instanceId, ctx)
  })

  hook.on(HookEvents.COMPONENT_UPDATED, (app, uid) => {
    const id = app ? getComponentId(app, uid, ctx) : ctx.currentInspectedComponentId
    if (id && isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendSelectedComponentData(id, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, (app, uid, parentUid, component) => {
    // console.log('hook: component added', app, uid, parentUid, component)

    const id = getComponentId(app, uid, ctx)
    if (component) {
      if (component.__VUE_DEVTOOLS_UID__ == null) {
        component.__VUE_DEVTOOLS_UID__ = id
      }
      if (!ctx.currentAppRecord.instanceMap.has(id)) {
        ctx.currentAppRecord.instanceMap.set(id, component)
      }
    }

    const parentId = getComponentId(app, parentUid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      // @TODO take into account current filter
      requestAnimationFrame(() => {
        sendComponentTreeData(parentId, null, ctx)
      })
    }

    if (ctx.currentInspectedComponentId === id) {
      sendSelectedComponentData(id, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
    const parentId = getComponentId(app, parentUid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      // @TODO take into account current filter
      requestAnimationFrame(() => {
        sendComponentTreeData(parentId, null, ctx)
      })
    }

    const id = getComponentId(app, uid, ctx)
    if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendEmptyComponentData(id, ctx)
    }
    ctx.currentAppRecord.instanceMap.delete(id)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, ({ instanceId, dotPath, value, newKey, remove }) => {
    editComponentState(instanceId, dotPath, { value, newKey, remove }, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({ instanceId }) => {
    const instance = getComponentInstance(instanceId, ctx)
    if (instance) {
      const [el] = await ctx.api.getComponentRootElements(instance)
      if (el) {
        // @ts-ignore
        window.__VUE_DEVTOOLS_INSPECT_TARGET__ = el
        ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null)
      }
    }
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

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, () => {
    sendTimelineLayers(ctx)
  })

  hook.on(HookEvents.TIMELINE_LAYER_ADDED, (options: TimelineLayerOptions, plugin: Plugin) => {
    ctx.timelineLayers.push({
      ...options,
      app: plugin.descriptor.app,
      plugin
    })
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {})
  })

  hook.on(HookEvents.TIMELINE_EVENT_ADDED, (options: TimelineEventOptions, plugin: Plugin) => {
    addTimelineEvent(options, plugin.descriptor.app, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, ({ screenshot }) => {
    showScreenshot(screenshot, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_CLEAR, () => {
    clearTimeline(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({ id }) => {
    await sendTimelineEventData(id, ctx)
  })

  // Custom inspectors

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, () => {
    ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
      inspectors: ctx.customInspectors.map(i => ({
        id: i.id,
        appId: getAppRecordId(i.app),
        pluginId: i.plugin.descriptor.id,
        label: i.label,
        icon: i.icon,
        treeFilterPlaceholder: i.treeFilterPlaceholder,
        stateFilterPlaceholder: i.stateFilterPlaceholder
      }))
    })
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, ({ inspectorId, appId, treeFilter }) => {
    const inspector = getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      inspector.treeFilter = treeFilter
      sendInspectorTree(inspector, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, ({ inspectorId, appId, nodeId }) => {
    const inspector = getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      inspector.selectedNodeId = nodeId
      sendInspectorState(inspector, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  hook.on(HookEvents.CUSTOM_INSPECTOR_ADD, (options: CustomInspectorOptions, plugin: Plugin) => {
    ctx.customInspectors.push({
      ...options,
      app: plugin.descriptor.app,
      plugin,
      treeFilter: '',
      selectedNodeId: null
    })
    ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {})
  })

  hook.on(HookEvents.CUSTOM_INSPECTOR_SEND_TREE, (inspectorId: string, plugin: Plugin) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app, ctx)
    if (inspector) {
      sendInspectorTree(inspector, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  hook.on(HookEvents.CUSTOM_INSPECTOR_SEND_STATE, (inspectorId: string, plugin: Plugin) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app, ctx)
    if (inspector) {
      sendInspectorState(inspector, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({ inspectorId, appId, nodeId, path, payload }) => {
    const inspector = getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      await editInspectorState(inspector, nodeId, path, payload, ctx)
      inspector.selectedNodeId = nodeId
      await sendInspectorState(inspector, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  // Plugins

  addPreviouslyRegisteredPlugins(ctx)
  addQueuedPlugins(ctx)

  ctx.bridge.on(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, () => {
    sendPluginList(ctx)
  })

  hook.on(HookEvents.SETUP_DEVTOOLS_PLUGIN, (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) => {
    addPlugin(pluginDescriptor, setupFn, ctx)
  })

  // @TODO

  console.log('%cconnect done', 'color: green')
}

async function flushAll () {
  // @TODO notify frontend
}
