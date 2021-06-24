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
  revive,
  target
} from '@vue-devtools/shared-utils'
import { hook } from './global-hook'
import { subscribe, unsubscribe, isSubscribed } from './util/subscriptions'
import { highlight, unHighlight } from './highlighter'
import { setupTimeline, sendTimelineLayers, addTimelineEvent, clearTimeline, sendTimelineEventData, sendTimelineLayerEvents } from './timeline'
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
import { registerApp, selectApp, waitForAppsRegistration, sendApps, _legacy_getAndRegisterApps, getAppRecord, removeApp } from './app'
import { sendInspectorTree, getInspector, getInspectorWithAppId, sendInspectorState, editInspectorState, sendCustomInspectors, selectInspectorNode } from './inspector'
import { showScreenshot } from './timeline-screenshot'
import { handleAddPerformanceTag, performanceMarkEnd, performanceMarkStart } from './perf'
import { initOnPageConfig } from './page-config'

let ctx: BackendContext = target.__vdevtools_ctx ?? null
let connected = target.__vdevtools_connected ?? false

export async function initBackend (bridge: Bridge) {
  await initSharedData({
    bridge,
    persist: false
  })

  initOnPageConfig()

  if (!connected) {
    // connected = false
    ctx = target.__vdevtools_ctx = createBackendContext({
      bridge,
      hook
    })

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

    // Add apps that already sent init
    if (hook.apps.length) {
      hook.apps.forEach(app => {
        registerApp(app, ctx)
        connect()
      })
    }
  } else {
    ctx.bridge = bridge
    connectBridge()
  }
}

async function connect () {
  if (connected) {
    return
  }
  connected = target.__vdevtools_connected = true

  await waitForAppsRegistration()

  connectBridge()

  ctx.currentTab = BuiltinTabs.COMPONENTS

  // Apps

  hook.on(HookEvents.APP_UNMOUNT, app => {
    removeApp(app, ctx)
  })

  // Components

  hook.on(HookEvents.COMPONENT_UPDATED, async (app, uid, parentUid, component) => {
    try {
      let id: string
      let appRecord: AppRecord
      if (app && uid != null) {
        id = await getComponentId(app, uid, ctx)
        appRecord = await getAppRecord(app, ctx)
      } else {
        id = ctx.currentInspectedComponentId
        appRecord = ctx.currentAppRecord
      }

      // Update component inspector
      if (id && isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
        sendSelectedComponentData(appRecord, id, ctx)
      }

      // Update tree (tags)
      if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
        sendComponentTreeData(appRecord, id, appRecord.componentFilter, 0, ctx)
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, async (app, uid, parentUid, component) => {
    try {
      const id = await getComponentId(app, uid, ctx)
      const appRecord = await getAppRecord(app, ctx)
      if (component) {
        if (component.__VUE_DEVTOOLS_UID__ == null) {
          component.__VUE_DEVTOOLS_UID__ = id
        }
        if (!appRecord.instanceMap.has(id)) {
          appRecord.instanceMap.set(id, component)
        }
      }

      const parentId = await getComponentId(app, parentUid, ctx)
      if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
        requestAnimationFrame(() => {
          sendComponentTreeData(appRecord, parentId, appRecord.componentFilter, null, ctx)
        })
      }

      if (ctx.currentInspectedComponentId === id) {
        sendSelectedComponentData(appRecord, id, ctx)
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, async (app, uid, parentUid, component) => {
    try {
      const appRecord = await getAppRecord(app, ctx)
      const parentId = await getComponentId(app, parentUid, ctx)
      if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
        requestAnimationFrame(async () => {
          try {
            sendComponentTreeData(await getAppRecord(app, ctx), parentId, appRecord.componentFilter, null, ctx)
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              console.error(e)
            }
          }
        })
      }

      const id = await getComponentId(app, uid, ctx)
      if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
        sendEmptyComponentData(id, ctx)
      }
      appRecord.instanceMap.delete(id)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
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

  hook.on(HookEvents.COMPONENT_HIGHLIGHT, instanceId => {
    highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx)
  })

  hook.on(HookEvents.COMPONENT_UNHIGHLIGHT, () => {
    unHighlight()
  })

  // Timeline

  setupTimeline(ctx)

  hook.on(HookEvents.TIMELINE_LAYER_ADDED, (options: TimelineLayerOptions, plugin: Plugin) => {
    ctx.timelineLayers.push({
      ...options,
      app: plugin.descriptor.app,
      plugin,
      events: []
    })
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {})
  })

  hook.on(HookEvents.TIMELINE_EVENT_ADDED, (options: TimelineEventOptions, plugin: Plugin) => {
    addTimelineEvent(options, plugin.descriptor.app, ctx)
  })

  // Custom inspectors

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

  hook.on(HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, async (inspectorId: string, nodeId: string, plugin: Plugin) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app, ctx)
    if (inspector) {
      await selectInspectorNode(inspector, nodeId, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  // Plugins

  addPreviouslyRegisteredPlugins(ctx)
  addQueuedPlugins(ctx)

  hook.on(HookEvents.SETUP_DEVTOOLS_PLUGIN, (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) => {
    addPlugin(pluginDescriptor, setupFn, ctx)
  })

  // Legacy flush
  hook.off('flush')
  hook.on('flush', () => {
    if (ctx.currentAppRecord?.backend.availableFeatures.includes(BuiltinBackendFeature.FLUSH)) {
      sendComponentTreeData(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, null, ctx)
      if (ctx.currentInspectedComponentId) {
        sendSelectedComponentData(ctx.currentAppRecord, ctx.currentInspectedComponentId, ctx)
      }
    }
  })
}

function connectBridge () {
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
    sendComponentTreeData(ctx.currentAppRecord, instanceId, filter, null, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
    sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx)
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
        if (typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          })
        } else {
          // Handle nodes that don't implement scrollIntoView
          const bounds = await ctx.api.getComponentBounds(instance)
          const scrollTarget = document.createElement('div')
          scrollTarget.style.position = 'absolute'
          scrollTarget.style.width = `${bounds.width}px`
          scrollTarget.style.height = `${bounds.height}px`
          scrollTarget.style.top = `${bounds.top}px`
          scrollTarget.style.left = `${bounds.left}px`
          document.body.appendChild(scrollTarget)
          scrollTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          })
          setTimeout(() => {
            document.body.removeChild(scrollTarget)
          }, 2000)
        }
        highlight(instance, ctx)
        setTimeout(() => {
          unHighlight()
        }, 2000)
      }
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_RENDER_CODE, async ({ instanceId }) => {
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
    if (instance) {
      const { code } = await ctx.api.getComponentRenderCode(instance)
      ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_RENDER_CODE, {
        instanceId,
        code
      })
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_STATE_ACTION, async ({ value, actionIndex }) => {
    const rawAction = value._custom.actions[actionIndex]
    const action = revive(rawAction?.action)
    if (action) {
      try {
        await action()
      } catch (e) {
        console.error(e)
      }
    } else {
      console.warn(`Couldn't revive action ${actionIndex} from`, value)
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

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, () => {
    sendTimelineLayers(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, ({ screenshot }) => {
    showScreenshot(screenshot, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_CLEAR, async () => {
    await clearTimeline(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({ id }) => {
    await sendTimelineEventData(id, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LAYER_LOAD_EVENTS, ({ appId, layerId }) => {
    sendTimelineLayerEvents(appId, layerId, ctx)
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

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({ inspectorId, appId, nodeId, path, type, payload }) => {
    const inspector = getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      await editInspectorState(inspector, nodeId, path, type, payload, ctx)
      inspector.selectedNodeId = nodeId
      await sendInspectorState(inspector, ctx)
    } else {
      console.error(`Inspector ${inspectorId} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, async ({ inspectorId, appId, actionIndex }) => {
    const inspector = getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      const action = inspector.actions[actionIndex]
      try {
        await action.action()
      } catch (e) {
        console.error(e)
      }
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

  ctx.bridge.on(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, () => {
    sendPluginList(ctx)
  })
}
