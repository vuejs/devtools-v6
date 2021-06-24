import { Bridge, hasPluginPermission, HookEvents, PluginPermission, set } from '@vue-devtools/shared-utils'
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
  WithId,
  ComponentTreeNode,
  ComponentDevtoolsOptions
} from '@vue/devtools-api'
import { DevtoolsHookable } from './hooks'
import { BackendContext } from './backend-context'
import { Plugin } from './plugin'

let backendOn: DevtoolsHookable
const pluginOn: DevtoolsHookable[] = []

export class DevtoolsApi {
  bridge: Bridge
  ctx: BackendContext

  constructor (bridge: Bridge, ctx: BackendContext) {
    this.bridge = bridge
    this.ctx = ctx
    if (!backendOn) { backendOn = new DevtoolsHookable(ctx) }
  }

  get on () {
    return backendOn
  }

  async callHook<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext = this.ctx) {
    payload = await backendOn.callHandlers(eventType, payload, ctx)
    for (const on of pluginOn) {
      payload = await on.callHandlers(eventType, payload, ctx)
    }
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

  async visitComponentTree (instance: ComponentInstance, treeNode: ComponentTreeNode, filter: string = null, app: App) {
    const payload = await this.callHook(Hooks.VISIT_COMPONENT_TREE, {
      app,
      componentInstance: instance,
      treeNode,
      filter
    })
    return payload.treeNode
  }

  async walkComponentParents (instance: ComponentInstance) {
    const payload = await this.callHook(Hooks.WALK_COMPONENT_PARENTS, {
      componentInstance: instance,
      parentInstances: []
    })
    return payload.parentInstances
  }

  async inspectComponent (instance: ComponentInstance, app: App) {
    const payload = await this.callHook(Hooks.INSPECT_COMPONENT, {
      app,
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

  async getComponentInstances (app: App) {
    const payload = await this.callHook(Hooks.GET_COMPONENT_INSTANCES, {
      app,
      componentInstances: []
    })
    return payload.componentInstances
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

  async editComponentState (instance: ComponentInstance, dotPath: string, type: string, state: EditStatePayload, app: App) {
    const arrayPath = dotPath.split('.')
    const payload = await this.callHook(Hooks.EDIT_COMPONENT_STATE, {
      app,
      componentInstance: instance,
      path: arrayPath,
      type,
      state,
      set: (object, path = arrayPath, value = state.value, cb?) => set(object, path, value, cb || createDefaultSetCallback(state))
    })
    return payload.componentInstance
  }

  async getComponentDevtoolsOptions (instance: ComponentInstance): Promise<ComponentDevtoolsOptions> {
    const payload = await this.callHook(Hooks.GET_COMPONENT_DEVTOOLS_OPTIONS, {
      componentInstance: instance,
      options: null
    })
    return payload.options || {}
  }

  async getComponentRenderCode (instance: ComponentInstance): Promise<{
    code: string
  }> {
    const payload = await this.callHook(Hooks.GET_COMPONENT_RENDER_CODE, {
      componentInstance: instance,
      code: null
    })
    return {
      code: payload.code
    }
  }

  async inspectTimelineEvent (eventData: TimelineEventOptions & WithId, app: App) {
    const payload = await this.callHook(Hooks.INSPECT_TIMELINE_EVENT, {
      event: eventData.event,
      layerId: eventData.layerId,
      app,
      data: eventData.event.data,
      all: eventData.all
    })
    return payload.data
  }

  async clearTimeline () {
    await this.callHook(Hooks.TIMELINE_CLEARED, {})
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

  async editInspectorState (inspectorId: string, app: App, nodeId: string, dotPath: string, type: string, state: EditStatePayload) {
    const arrayPath = dotPath.split('.')
    await this.callHook(Hooks.EDIT_INSPECTOR_STATE, {
      inspectorId,
      app,
      nodeId,
      path: arrayPath,
      type,
      state,
      set: (object, path = arrayPath, value = state.value, cb?) => set(object, path, value, cb || createDefaultSetCallback(state))
    })
  }
}

function createDefaultSetCallback (state: EditStatePayload) {
  return (obj, field, value) => {
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
}

export class DevtoolsPluginApiInstance implements DevtoolsPluginApi {
  bridge: Bridge
  ctx: BackendContext
  plugin: Plugin
  on: DevtoolsHookable

  constructor (plugin: Plugin, ctx: BackendContext) {
    this.bridge = ctx.bridge
    this.ctx = ctx
    this.plugin = plugin
    this.on = new DevtoolsHookable(ctx, plugin)
    pluginOn.push(this.on)
  }

  // Plugin API

  async notifyComponentUpdate (instance: ComponentInstance = null) {
    if (!this.enabled || !this.hasPermission(PluginPermission.COMPONENTS)) return

    if (instance) {
      this.ctx.hook.emit(HookEvents.COMPONENT_UPDATED, ...await this.ctx.api.transformCall(HookEvents.COMPONENT_UPDATED, instance))
    } else {
      this.ctx.hook.emit(HookEvents.COMPONENT_UPDATED)
    }
  }

  addTimelineLayer (options: TimelineLayerOptions) {
    if (!this.enabled || !this.hasPermission(PluginPermission.TIMELINE)) return false

    this.ctx.hook.emit(HookEvents.TIMELINE_LAYER_ADDED, options, this.plugin)
    return true
  }

  addTimelineEvent (options: TimelineEventOptions) {
    if (!this.enabled || !this.hasPermission(PluginPermission.TIMELINE)) return false

    this.ctx.hook.emit(HookEvents.TIMELINE_EVENT_ADDED, options, this.plugin)
    return true
  }

  addInspector (options: CustomInspectorOptions) {
    if (!this.enabled || !this.hasPermission(PluginPermission.CUSTOM_INSPECTOR)) return false

    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_ADD, options, this.plugin)
    return true
  }

  sendInspectorTree (inspectorId: string) {
    if (!this.enabled || !this.hasPermission(PluginPermission.CUSTOM_INSPECTOR)) return false

    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_SEND_TREE, inspectorId, this.plugin)
    return true
  }

  sendInspectorState (inspectorId: string) {
    if (!this.enabled || !this.hasPermission(PluginPermission.CUSTOM_INSPECTOR)) return false

    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_SEND_STATE, inspectorId, this.plugin)
    return true
  }

  selectInspectorNode (inspectorId: string, nodeId: string) {
    if (!this.enabled || !this.hasPermission(PluginPermission.CUSTOM_INSPECTOR)) return false

    this.ctx.hook.emit(HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, inspectorId, nodeId, this.plugin)
    return true
  }

  getComponentBounds (instance: ComponentInstance) {
    return this.ctx.api.getComponentBounds(instance)
  }

  getComponentName (instance: ComponentInstance) {
    return this.ctx.api.getComponentName(instance)
  }

  getComponentInstances (app: App) {
    return this.ctx.api.getComponentInstances(app)
  }

  highlightElement (instance: ComponentInstance) {
    if (!this.enabled || !this.hasPermission(PluginPermission.COMPONENTS)) return false

    this.ctx.hook.emit(HookEvents.COMPONENT_HIGHLIGHT, instance.__VUE_DEVTOOLS_UID__, this.plugin)
    return true
  }

  unhighlightElement () {
    if (!this.enabled || !this.hasPermission(PluginPermission.COMPONENTS)) return false

    this.ctx.hook.emit(HookEvents.COMPONENT_UNHIGHLIGHT, this.plugin)
    return true
  }

  private get enabled () {
    return hasPluginPermission(this.plugin.descriptor.id, PluginPermission.ENABLED)
  }

  private hasPermission (permission: PluginPermission) {
    return hasPluginPermission(this.plugin.descriptor.id, permission)
  }
}
