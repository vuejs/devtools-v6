import {
  createBackendContext,
  BackendContext,
  Plugin,
  BuiltinBackendFeature,
  AppRecord,
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
  target,
  getPluginSettings,
  SharedData,
  isBrowser,
  raf,
} from '@vue-devtools/shared-utils'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
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
  getComponentInstance,
  refreshComponentTreeSearch,
  sendComponentUpdateTracking,
} from './component'
import { addQueuedPlugins, addPlugin, sendPluginList, addPreviouslyRegisteredPlugins } from './plugin'
import { PluginDescriptor, SetupFunction, TimelineLayerOptions, TimelineEventOptions, CustomInspectorOptions, Hooks, now } from '@vue/devtools-api'
import { registerApp, selectApp, waitForAppsRegistration, sendApps, _legacy_getAndRegisterApps, getAppRecord, removeApp } from './app'
import { sendInspectorTree, getInspector, getInspectorWithAppId, sendInspectorState, editInspectorState, sendCustomInspectors, selectInspectorNode } from './inspector'
import { showScreenshot } from './timeline-screenshot'
import { performanceMarkEnd, performanceMarkStart } from './perf'
import { initOnPageConfig } from './page-config'
import { sendTimelineMarkers, addTimelineMarker } from './timeline-marker'
import { flashComponent } from './flash.js'

let ctx: BackendContext = target.__vdevtools_ctx ?? null
let connected = target.__vdevtools_connected ?? false

export async function initBackend (bridge: Bridge) {
  await initSharedData({
    bridge,
    persist: false,
  })

  SharedData.isBrowser = isBrowser

  initOnPageConfig()

  if (!connected) {
    // First connect
    ctx = target.__vdevtools_ctx = createBackendContext({
      bridge,
      hook,
    })

    SharedData.legacyApps = false
    if (hook.Vue) {
      connect()
      _legacy_getAndRegisterApps(ctx, true)
      SharedData.legacyApps = true
    }
    hook.on(HookEvents.INIT, () => {
      _legacy_getAndRegisterApps(ctx, true)
      SharedData.legacyApps = true
    })

    hook.on(HookEvents.APP_ADD, async app => {
      await registerApp(app, ctx)
      connect()
    })

    // Add apps that already sent init
    if (hook.apps.length) {
      hook.apps.forEach(app => {
        registerApp(app, ctx)
        connect()
      })
    }
  } else {
    // Reconnect
    ctx.bridge = bridge
    connectBridge()
    ctx.bridge.send(BridgeEvents.TO_FRONT_RECONNECTED)
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

  hook.on(HookEvents.APP_UNMOUNT, async app => {
    await removeApp(app, ctx)
  })

  // Components

  const sendComponentUpdate = throttle(async (appRecord: AppRecord, id: string) => {
    try {
      // Update component inspector
      if (id && isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
        await sendSelectedComponentData(appRecord, id, ctx)
      }

      // Update tree (tags)
      if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
        await sendComponentTreeData(appRecord, id, appRecord.componentFilter, 0, false, ctx)
      }
    } catch (e) {
      if (SharedData.debugInfo) {
        console.error(e)
      }
    }
  }, 100)

  hook.on(HookEvents.COMPONENT_UPDATED, async (app, uid, parentUid, component) => {
    try {
      if (!app || (typeof uid !== 'number' && !uid) || !component) return
      let id: string
      let appRecord: AppRecord
      if (app && uid != null) {
        id = await getComponentId(app, uid, component, ctx)
        appRecord = await getAppRecord(app, ctx)
      } else {
        id = ctx.currentInspectedComponentId
        appRecord = ctx.currentAppRecord
      }

      if (SharedData.trackUpdates) {
        await sendComponentUpdateTracking(id, ctx)
      }

      if (SharedData.flashUpdates) {
        await flashComponent(component, appRecord.backend)
      }

      await sendComponentUpdate(appRecord, id)
    } catch (e) {
      if (SharedData.debugInfo) {
        console.error(e)
      }
    }
  })

  hook.on(HookEvents.COMPONENT_ADDED, async (app, uid, parentUid, component) => {
    try {
      if (!app || (typeof uid !== 'number' && !uid) || !component) return
      const id = await getComponentId(app, uid, component, ctx)
      const appRecord = await getAppRecord(app, ctx)
      if (component) {
        if (component.__VUE_DEVTOOLS_UID__ == null) {
          component.__VUE_DEVTOOLS_UID__ = id
        }
        if (!appRecord.instanceMap.has(id)) {
          appRecord.instanceMap.set(id, component)
        }
      }

      if (parentUid != null) {
        const parentInstances = await appRecord.backend.api.walkComponentParents(component)
        if (parentInstances.length) {
          // Check two parents level to update `hasChildren
          for (let i = 0; i < parentInstances.length; i++) {
            const parentId = await getComponentId(app, parentUid, parentInstances[i], ctx)
            if (i < 2 && isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
              raf(() => {
                sendComponentTreeData(appRecord, parentId, appRecord.componentFilter, null, false, ctx)
              })
            }

            if (SharedData.trackUpdates) {
              await sendComponentUpdateTracking(parentId, ctx)
            }
          }
        }
      }

      if (ctx.currentInspectedComponentId === id) {
        await sendSelectedComponentData(appRecord, id, ctx)
      }

      if (SharedData.trackUpdates) {
        await sendComponentUpdateTracking(id, ctx)
      }

      if (SharedData.flashUpdates) {
        await flashComponent(component, appRecord.backend)
      }

      await refreshComponentTreeSearch(ctx)
    } catch (e) {
      if (SharedData.debugInfo) {
        console.error(e)
      }
    }
  })

  hook.on(HookEvents.COMPONENT_REMOVED, async (app, uid, parentUid, component) => {
    try {
      if (!app || (typeof uid !== 'number' && !uid) || !component) return
      const appRecord = await getAppRecord(app, ctx)
      if (parentUid != null) {
        const parentInstances = await appRecord.backend.api.walkComponentParents(component)
        if (parentInstances.length) {
          const parentId = await getComponentId(app, parentUid, parentInstances[0], ctx)
          if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
            raf(async () => {
              try {
                sendComponentTreeData(await getAppRecord(app, ctx), parentId, appRecord.componentFilter, null, false, ctx)
              } catch (e) {
                if (SharedData.debugInfo) {
                  console.error(e)
                }
              }
            })
          }
        }
      }

      const id = await getComponentId(app, uid, component, ctx)
      if (isSubscribed(BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
        await sendEmptyComponentData(id, ctx)
      }
      appRecord.instanceMap.delete(id)

      await refreshComponentTreeSearch(ctx)
    } catch (e) {
      if (SharedData.debugInfo) {
        console.error(e)
      }
    }
  })

  hook.on(HookEvents.TRACK_UPDATE, (id, ctx) => {
    sendComponentUpdateTracking(id, ctx)
  })

  hook.on(HookEvents.FLASH_UPDATE, (instance, backend) => {
    flashComponent(instance, backend)
  })

  // Component perf

  hook.on(HookEvents.PERFORMANCE_START, async (app, uid, vm, type, time) => {
    await performanceMarkStart(app, uid, vm, type, time, ctx)
  })

  hook.on(HookEvents.PERFORMANCE_END, async (app, uid, vm, type, time) => {
    await performanceMarkEnd(app, uid, vm, type, time, ctx)
  })

  // Highlighter

  hook.on(HookEvents.COMPONENT_HIGHLIGHT, async instanceId => {
    await highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx.currentAppRecord.backend, ctx)
  })

  hook.on(HookEvents.COMPONENT_UNHIGHLIGHT, async () => {
    await unHighlight()
  })

  // Timeline

  setupTimeline(ctx)

  hook.on(HookEvents.TIMELINE_LAYER_ADDED, async (options: TimelineLayerOptions, plugin: Plugin) => {
    const appRecord = await getAppRecord(plugin.descriptor.app, ctx)
    ctx.timelineLayers.push({
      ...options,
      appRecord,
      plugin,
      events: [],
    })
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {})
  })

  hook.on(HookEvents.TIMELINE_EVENT_ADDED, async (options: TimelineEventOptions, plugin: Plugin) => {
    await addTimelineEvent(options, plugin.descriptor.app, ctx)
  })

  // Custom inspectors

  hook.on(HookEvents.CUSTOM_INSPECTOR_ADD, async (options: CustomInspectorOptions, plugin: Plugin) => {
    const appRecord = await getAppRecord(plugin.descriptor.app, ctx)
    ctx.customInspectors.push({
      ...options,
      appRecord,
      plugin,
      treeFilter: '',
      selectedNodeId: null,
    })
    ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {})
  })

  hook.on(HookEvents.CUSTOM_INSPECTOR_SEND_TREE, async (inspectorId: string, plugin: Plugin) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app, ctx)
    if (inspector) {
      await sendInspectorTree(inspector, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
    }
  })

  hook.on(HookEvents.CUSTOM_INSPECTOR_SEND_STATE, async (inspectorId: string, plugin: Plugin) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app, ctx)
    if (inspector) {
      await sendInspectorState(inspector, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
    }
  })

  hook.on(HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, async (inspectorId: string, nodeId: string, plugin: Plugin) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app, ctx)
    if (inspector) {
      await selectInspectorNode(inspector, nodeId, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
    }
  })

  // Plugins

  try {
    await addPreviouslyRegisteredPlugins(ctx)
  } catch (e) {
    console.error(`Error adding previously registered plugins:`)
    console.error(e)
  }
  try {
    await addQueuedPlugins(ctx)
  } catch (e) {
    console.error(`Error adding queued plugins:`)
    console.error(e)
  }

  hook.on(HookEvents.SETUP_DEVTOOLS_PLUGIN, async (pluginDescriptor: PluginDescriptor, setupFn: SetupFunction) => {
    await addPlugin({ pluginDescriptor, setupFn }, ctx)
  })

  target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ = true

  // Legacy flush

  const handleFlush = debounce(async () => {
    if (ctx.currentAppRecord?.backend.options.features.includes(BuiltinBackendFeature.FLUSH)) {
      await sendComponentTreeData(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, null, false, ctx)
      if (ctx.currentInspectedComponentId) {
        await sendSelectedComponentData(ctx.currentAppRecord, ctx.currentInspectedComponentId, ctx)
      }
    }
  }, 500)

  hook.off(HookEvents.FLUSH)
  hook.on(HookEvents.FLUSH, handleFlush)

  // Connect done

  try {
    await addTimelineMarker({
      id: 'vue-devtools-init-backend',
      time: now(),
      label: 'Vue Devtools connected',
      color: 0x41B883,
      all: true,
    }, ctx)
  } catch (e) {
    console.error(`Error while adding devtools connected timeline marker:`)
    console.error(e)
  }
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

  ctx.bridge.on(BridgeEvents.TO_BACK_APP_LIST, async () => {
    await sendApps(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_APP_SELECT, async id => {
    if (id == null) return
    const record = ctx.appRecords.find(r => r.id === id)
    if (record) {
      await selectApp(record, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`App with id ${id} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_SCAN_LEGACY_APPS, () => {
    if (hook.Vue) {
      _legacy_getAndRegisterApps(ctx)
    }
  })

  // Components

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_TREE, async ({ instanceId, filter, recursively }) => {
    ctx.currentAppRecord.componentFilter = filter
    subscribe(BridgeSubscriptions.COMPONENT_TREE, { instanceId })
    await sendComponentTreeData(ctx.currentAppRecord, instanceId, filter, null, recursively, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, async (instanceId) => {
    await sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, async ({ instanceId, dotPath, type, value, newKey, remove }) => {
    await editComponentState(instanceId, dotPath, type, { value, newKey, remove }, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({ instanceId }) => {
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
    if (instance) {
      const [el] = await ctx.currentAppRecord.backend.api.getComponentRootElements(instance)
      if (el) {
        // @ts-ignore
        target.__VUE_DEVTOOLS_INSPECT_TARGET__ = el
        ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null)
      }
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, async ({ instanceId }) => {
    if (!isBrowser) return
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
    if (instance) {
      const [el] = await ctx.currentAppRecord.backend.api.getComponentRootElements(instance)
      if (el) {
        if (typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          })
        } else {
          // Handle nodes that don't implement scrollIntoView
          const bounds = await ctx.currentAppRecord.backend.api.getComponentBounds(instance)
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
            inline: 'center',
          })
          setTimeout(() => {
            document.body.removeChild(scrollTarget)
          }, 2000)
        }
        highlight(instance, ctx.currentAppRecord.backend, ctx)
        setTimeout(() => {
          unHighlight()
        }, 2000)
      }
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_RENDER_CODE, async ({ instanceId }) => {
    if (!isBrowser) return
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
    if (instance) {
      const { code } = await ctx.currentAppRecord.backend.api.getComponentRenderCode(instance)
      ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_RENDER_CODE, {
        instanceId,
        code,
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

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, async instanceId => {
    await highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx.currentAppRecord.backend, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, async () => {
    await unHighlight()
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

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, async () => {
    await sendTimelineLayers(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, async ({ screenshot }) => {
    await showScreenshot(screenshot, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_CLEAR, async () => {
    await clearTimeline(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({ id }) => {
    await sendTimelineEventData(id, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LAYER_LOAD_EVENTS, async ({ appId, layerId }) => {
    await sendTimelineLayerEvents(appId, layerId, ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_TIMELINE_LOAD_MARKERS, async () => {
    await sendTimelineMarkers(ctx)
  })

  // Custom inspectors

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, async () => {
    await sendCustomInspectors(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, async ({ inspectorId, appId, treeFilter }) => {
    const inspector = await getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      inspector.treeFilter = treeFilter
      sendInspectorTree(inspector, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, async ({ inspectorId, appId, nodeId }) => {
    const inspector = await getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      inspector.selectedNodeId = nodeId
      sendInspectorState(inspector, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({ inspectorId, appId, nodeId, path, type, payload }) => {
    const inspector = await getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      await editInspectorState(inspector, nodeId, path, type, payload, ctx)
      inspector.selectedNodeId = nodeId
      await sendInspectorState(inspector, ctx)
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
    }
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, async ({ inspectorId, appId, actionIndex, actionType, args }) => {
    const inspector = await getInspectorWithAppId(inspectorId, appId, ctx)
    if (inspector) {
      const action = inspector[actionType ?? 'actions'][actionIndex]
      try {
        await action.action(...(args ?? []))
      } catch (e) {
        if (SharedData.debugInfo) {
          console.error(e)
        }
      }
    } else if (SharedData.debugInfo) {
      console.warn(`Inspector ${inspectorId} not found`)
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
    // eslint-disable-next-line no-console
    console[payload.level](value)
  })

  // Plugins

  ctx.bridge.on(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, async () => {
    await sendPluginList(ctx)
  })

  ctx.bridge.on(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED, ({ pluginId, key, newValue, oldValue }) => {
    const settings = getPluginSettings(pluginId)
    ctx.hook.emit(HookEvents.PLUGIN_SETTINGS_SET, pluginId, settings)
    ctx.currentAppRecord.backend.api.callHook(Hooks.SET_PLUGIN_SETTINGS, {
      app: ctx.currentAppRecord.options.app,
      pluginId,
      key,
      newValue,
      oldValue,
      settings,
    })
  })

  ctx.bridge.send(BridgeEvents.TO_FRONT_TITLE, { title: document.title })
  // Watch page title
  const titleEl = document.querySelector('title')
  if (titleEl && typeof MutationObserver !== 'undefined') {
    if (pageTitleObserver) {
      pageTitleObserver.disconnect()
    }
    pageTitleObserver = new MutationObserver((mutations) => {
      const title = mutations[0].target as HTMLTitleElement
      ctx.bridge.send(BridgeEvents.TO_FRONT_TITLE, { title: title.innerText })
    })
    pageTitleObserver.observe(titleEl, { subtree: true, characterData: true, childList: true })
  }
}

let pageTitleObserver: MutationObserver
