import { Bridge, HookEvents } from '@vue-devtools/shared-utils'
import {
  Hooks,
  HookPayloads,
  App,
  DevtoolsPluginApi,
  ComponentInstance
} from '@vue/devtools-api'
import { DevtoolsHookable } from './hooks'
import { BackendContext } from './backend-context'

export class DevtoolsApi implements DevtoolsPluginApi {
  bridge: Bridge
  ctx: BackendContext
  protected backendOn: DevtoolsHookable
  protected pluginOn: DevtoolsHookable

  constructor (bridge: Bridge, ctx: BackendContext) {
    this.bridge = bridge
    this.ctx = ctx
    this.backendOn = new DevtoolsHookable(ctx)
    this.pluginOn = new DevtoolsHookable(ctx)
  }

  get on () {
    if (this.ctx.currentPlugin) {
      return this.pluginOn
    } else {
      return this.backendOn
    }
  }

  async callHook<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext = this.ctx) {
    payload = await this.backendOn.callHandlers(eventType, payload, ctx)
    payload = await this.pluginOn.callHandlers(eventType, payload, ctx)
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

  // Plugin API

  async notifyComponentUpdate (instance: ComponentInstance = null) {
    if (instance) {
      this.ctx.hook.emit(HookEvents.COMPONENT_UPDATED, ...await this.transformCall(HookEvents.COMPONENT_UPDATED, instance))
    } else {
      this.ctx.hook.emit(HookEvents.COMPONENT_UPDATED)
    }
  }
}
