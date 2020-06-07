import { Bridge } from '@vue-devtools/shared-utils'

import { DevtoolsHookable, Hooks, HookPayloads } from './hooks'
import { App } from './app-record'
import { BackendContext } from './backend-context'

export class DevtoolsApi {
  bridge: Bridge
  ctx: BackendContext
  on: DevtoolsHookable = new DevtoolsHookable()

  constructor (bridge: Bridge, ctx: BackendContext) {
    this.bridge = bridge
    this.ctx = ctx
  }

  callHook<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext = this.ctx) {
    return this.on.callHandlers(eventType, payload, ctx)
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

  async walkComponentTree (instance: any, maxDepth = -1) {
    const payload = await this.callHook(Hooks.WALK_COMPONENT_TREE, {
      componentInstance: instance,
      componentTreeData: null,
      maxDepth
    })
    return payload.componentTreeData
  }

  async inspectComponent (instanceId: number) {
    const payload = await this.callHook(Hooks.INSPECT_COMPONENT, {
      componentInstanceId: instanceId,
      instanceData: null
    })
    return payload.instanceData
  }
}
