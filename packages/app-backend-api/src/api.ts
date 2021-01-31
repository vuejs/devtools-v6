import { Bridge, HookEvents, set } from '@vue-devtools/shared-utils'
import {
  Hooks,
  HookPayloads,
  App,
  DevtoolsPluginApi,
  ComponentInstance,
  TimelineLayerOptions,
  TimelineEventOptions,
  CustomInspectorOptions,
  EditStatePayload,
  WithId
} from '@vue/devtools-api'
import { DevtoolsHookable } from './hooks'
import { BackendContext } from './backend-context'
import { Plugin } from './plugin'

let backendOn: DevtoolsHookable
let pluginOn: DevtoolsHookable

export class DevtoolsApi {
  bridge: Bridge
  ctx: BackendContext

  constructor (bridge: Bridge, ctx: BackendContext) {
    this.bridge = bridge
    this.ctx = ctx
    if (!backendOn) { backendOn = new DevtoolsHookable(ctx) }
    if (!pluginOn) { pluginOn = new DevtoolsHookable(ctx) }
  }

  get on () {
    return backendOn
  }

  async callHook<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext = this.ctx) {
    payload = await backendOn.callHandlers(eventType, payload, ctx)
    payload = await pluginOn.callHandlers(eventType, payload, ctx)
    return payload
  }

  async transformCall (callName: string, ...args) {
    const payload = await this.callHook(Hooks.TRANSFORM_CALL, {
      callName,
      inArgs: args,
      outArgs: args.slice()
    })
    return payload.outArgs
  }

  async getAppRecordName (app: App, id: number): Promise<string> {
    const payload = await this.callHook(Hooks.GET_APP_RECORD_NAME, {
      app,
      name: null
    })
    if (payload.name) {
      return payload.name
    } else {
      return `App ${id + 1}`
    }
  }

  async getAppRootInstance (app: App) {
    const payload = await this.callHook(Hooks.GET_APP_ROOT_INSTANCE, {
      app,
      root: null
    })
    return payload.root
  }

  async registerApplication (app: App) {
    await this.callHook(Hooks.REGISTER_APPLICATION, {
      app
    })
  }

  async walkComponentTree (instance: ComponentInstance, maxDepth = -1, filter: string = null) {
    const payload = await this.callHook(Hooks.WALK_COMPONENT_TREE, {
      componentInstance: instance,
      componentTreeData: null,
      maxDepth,
      filter
    })
    return payload.componentTreeData
  }

  async walkComponentParents (instance: ComponentInstance) {
    const payload = await this.callHook(Hooks.WALK_COMPONENT_PARENTS, {
      componentInstance: instance,
      parentInstances: []
    })
    return payload.parentInstances
  }

  async inspectComponent (instance: ComponentInstance) {
    const payload = await this.callHook(Hooks.INSPECT_COMPONENT, {
      componentInstance: instance,
      instanceData: null
    })
    return payload.instanceData
  }

  async getComponentBounds (instance: ComponentInstance) {
    const payload = await this.callHook(Hooks.GET_COMPONENT_BOUNDS, {
      componentInstance: instance,
      bounds: null
    })
    return payload.bounds
  }

  async getComponentName (instance: ComponentInstance) {
    const payload = await this.callHook(Hooks.GET_COMPONENT_NAME, {
      componentInstance: instance,
      name: null
    })
    return payload.name
  }

  async getElementComponent (element: HTMLElement | any) {
    const payload = await this.callHook(Hooks.GET_ELEMENT_COMPONENT, {
      element,
      componentInstance: null
    })
    return payload.componentInstance
  }

  async getComponentRootElements (instance: ComponentInstance) {
    const payload = await this.callHook(Hooks.GET_COMPONENT_ROOT_ELEMENTS, {
      componentInstance: instance,
      rootElements: []
    })
    return payload.rootElements
  }

  async editComponentState (instance: ComponentInstance, dotPath: string, state: EditStatePayload) {
    const payload = await this.callHook(Hooks.EDIT_COMPONENT_STATE, {
      componentInstance: instance,
      path: dotPath.split('.'),
      state
    })
    return payload.componentInstance
  }

  async inspectTimelineEvent (eventData: TimelineEventOptions & WithId) {
    const payload = await this.callHook(Hooks.INSPECT_TIMELINE_EVENT, {
      event: eventData.event,
      layerId: eventData.layerId,
      data: eventData.event.data,
      all: eventData.all
    })
    return payload.data
  }

  async getInspectorTree (inspectorId: string, app: App, filter: string) {
    const payload = await this.callHook(Hooks.GET_INSPECTOR_TREE, {
      inspectorId,
      app,
      filter,
      rootNodes: []
    })
    return payload.rootNodes
  }

  async getInspectorState (inspectorId: string, app: App, nodeId: string) {
    const payload = await this.callHook(Hooks.GET_INSPECTOR_STATE, {
      inspectorId,
      app,
      nodeId,
      state: null
    })
    return payload.state
  }

  async editInspectorState (inspectorId: string, app: App, nodeId: string, dotPath: string, state: EditStatePayload) {
    const defaultSetCallback = (obj, field, value) => {
      if (state.remove || state.newKey) {
        if (Array.isArray(obj)) {
          obj.splice(field, 1)
        } else {
          delete obj[field]
        }
      }
      if (!state.remove) {
        obj[state.newKey || field] = value
      }
    }
    await this.callHook(Hooks.EDIT_INSPECTOR_STATE, {
      inspectorId,
      app,
      nodeId,
      path: dotPath.split('.'),
      state,
      set: (object, path, value, cb?) => set(object, path, value, cb || defaultSetCallback)
    })
  }
}

export class DevtoolsPluginApiInstance implements DevtoolsPluginApi {
  bridge: Bridge
  ctx: BackendContext
  plugin: Plugin

  constructor (plugin: Plugin, ctx: BackendContext) {
    this.bridge = ctx.bridge
    this.ctx = ctx
    this.plugin = plugin
    if (!pluginOn) { pluginOn = new DevtoolsHookable(ctx) }
  }

  get on () {
    return pluginOn
  }

  // Plugin API

  async notifyComponentUpdate (instance: ComponentInstance = null) {
    if (instance) {
      this.ctx.hook.emit(HookEvents.COMPONENT_UPDATED, ...await this.ctx.api.transformCall(HookEvents.COMPONENT_UPDATED, instance))
    } else {
      this.ctx.hook.emit(HookEvents.COMPONENT_UPDATED)
    }
  }

  addTimelineLayer (options: TimelineLayerOptions) {
    this.ctx.hook.emit(HookEvents.TIMELINE_LAYER_ADDED, options, this.plugin)
  }

  addTimelineEvent (options: TimelineEventOptions) {
    this.ctx.hook.emit(HookEvents.TIMELINE_EVENT_ADDED, options, this.plugin)
  }

  addInspector (options: CustomInspectorOptions) {
    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_ADD, options, this.plugin)
  }

  sendInspectorTree (inspectorId: string) {
    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_SEND_TREE, inspectorId, this.plugin)
  }

  sendInspectorState (inspectorId: string) {
    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_SEND_STATE, inspectorId, this.plugin)
  }

  getComponentBounds (instance: ComponentInstance) {
    return this.ctx.api.getComponentBounds(instance)
  }

  getComponentName (instance: ComponentInstance) {
    return this.ctx.api.getComponentName(instance)
  }
}
