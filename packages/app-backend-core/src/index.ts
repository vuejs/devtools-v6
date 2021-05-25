import {
  createBackendContext,
  BackendContext,
  Plugin,
  BuiltinBackendFeature,
  AppRecord
} from '@vue-devtools/app-backend-api'
import {
  Bridge,
  HookEvents,
  BridgeEvents,
  BuiltinTabs,
  initSharedData,
  BridgeSubscriptions,
  parse,
  revive
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
import { PluginDescriptor, SetupFunction, TimelineLayerOptions, TimelineEventOptions, CustomInspectorOptions } from '@vue/devtools-api'
import { registerApp, selectApp, waitForAppsRegistration, sendApps, _legacy_getAndRegisterApps, getAppRecord } from './app'
import { sendInspectorTree, getInspector, getInspectorWithAppId, sendInspectorState, editInspectorState, sendCustomInspectors } from './inspector'
import { showScreenshot } from './timeline-screenshot'
import { handleAddPerformanceTag, performanceMarkEnd, performanceMarkStart } from './perf'
import { initOnPageConfig } from './page-config'

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

  initOnPageConfig()

  if (hook.Vue) {
    connect()
    _legacy_getAndRegisterApps(hook.Vue, ctx)
  } else {
    hook.once(HookEvents.INIT, (Vue) => {
      _legacy_getAndRegisterApps(Vue, ctx)
    })
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
    await unHighlight()
  })

  // Apps

  ctx.bridge.on(BridgeEvents.TO_BACK_APP_LIST, () => {
    sendApps(ctx)
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
    ctx.currentAppRecord.componentFilter = filter
    sendComponentTreeData(ctx.currentAppRecord, instanceId, filter, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
    sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx)
  })

  hook.on(HookEvents.COMPONENT_UPDATED, (app, uid) => {
    let id: string
    let appRecord: AppRecord
    if (app && uid != null) {
      id = getComponentId(app, uid, ctx)
      appRecord = getAppRecord(app, ctx)
    } else {
      id = ctx.currentInspectedComponentId
      appRecord = ctx.currentAppRecord
    }
    if (id && isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendSelectedComponentData(appRecord, id, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, (app, uid, parentUid, component) => {
    const id = getComponentId(app, uid, ctx)
    if (component) {
      if (component.__VUE_DEVTOOLS_UID__ == null) {
        component.__VUE_DEVTOOLS_UID__ = id
      }
      if (!ctx.currentAppRecord.instanceMap.has(id)) {
        ctx.currentAppRecord.instanceMap.set(id, component)
      }
    }

    const appRecord = getAppRecord(app, ctx)

    const parentId = getComponentId(app, parentUid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      requestAnimationFrame(() => {
        sendComponentTreeData(appRecord, parentId, ctx.currentAppRecord.componentFilter, ctx)
      })
    }

    if (ctx.currentInspectedComponentId === id) {
      sendSelectedComponentData(appRecord, id, ctx)
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
    const parentId = getComponentId(app, parentUid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
      requestAnimationFrame(() => {
        sendComponentTreeData(getAppRecord(app, ctx), parentId, ctx.currentAppRecord.componentFilter, ctx)
      })
    }

    const id = getComponentId(app, uid, ctx)
    if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
      sendEmptyComponentData(id, ctx)
    }
    ctx.currentAppRecord.instanceMap.delete(id)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, ({ instanceId, dotPath, type, value, newKey, remove }) => {
    editComponentState(instanceId, dotPath, type, { value, newKey, remove }, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({ instanceId }) => {
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
    if (instance) {
      const [el] = await ctx.api.getComponentRootElements(instance)
      if (el) {
        // @ts-ignore
        window.__VUE_DEVTOOLS_INSPECT_TARGET__ = el
        ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null)
      }
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, async ({ instanceId }) => {
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
    if (instance) {
      const [el] = await ctx.api.getComponentRootElements(instance)
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
        setTimeout(() => {
          highlight(instance, ctx)
        }, 500)
        setTimeout(() => {
          unHighlight()
        }, 2000)
      }
    }
  })

  // Component perf

  hook.on(HookEvents.PERFORMANCE_START, (app, uid, vm, type, time) => {
    performanceMarkStart(app, uid, vm, type, time, ctx)
  })

  hook.on(HookEvents.PERFORMANCE_END, (app, uid, vm, type, time) => {
    performanceMarkEnd(app, uid, vm, type, time, ctx)
  })

  handleAddPerformanceTag(ctx)

  // Highlighter

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, instanceId => {
    highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, () => {
    unHighlight()
  })

  hook.on(HookEvents.COMPONENT_HIGHLIGHT, instanceId => {
    highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx)
  })

  hook.on(HookEvents.COMPONENT_UNHIGHLIGHT, () => {
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
    sendCustomInspectors(ctx)
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

  // Misc

  ctx.bridge.on(BridgeEvents.TO_BACK_LOG, (payload: { level: string, value: any, serialized?: boolean, revive?: boolean }) => {
    let value = payload.value
    if (payload.serialized) {
      value = parse(value, payload.revive)
    } else if (payload.revive) {
      value = revive(value)
    }
    console[payload.level](value)
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

  // Legacy flush
  hook.off('flush')
  hook.on('flush', () => {
    if (ctx.currentAppRecord?.backend.availableFeatures.includes(BuiltinBackendFeature.FLUSH)) {
      sendComponentTreeData(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, ctx)
      if (ctx.currentInspectedComponentId) {
        sendSelectedComponentData(ctx.currentAppRecord, ctx.currentInspectedComponentId, ctx)
      }
    }
  })
}
