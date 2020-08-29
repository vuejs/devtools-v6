import { App } from '.'
import { BackendContext } from './backend-context'
import { ComponentTreeNode, InspectedComponentData } from './component'

export enum Hooks {
  GET_APP_RECORD_NAME = 'getAppRecordName',
  GET_APP_ROOT_INSTANCE = 'getAppRootInstance',
  REGISTER_APPLICATION = 'registerApplication',
  WALK_COMPONENT_TREE = 'walkComponentTree',
  WALK_COMPONENT_PARENTS = 'walkComponentParents',
  INSPECT_COMPONENT = 'inspectComponent',
  GET_COMPONENT_BOUNDS = 'getComponentBounds',
  GET_COMPONENT_NAME = 'getComponentName',
  GET_ELEMENT_COMPONENT = 'getElementComponent'
}

export interface ComponentBounds {
  left: number
  top: number
  width: number
  height: number
}

export type HookPayloads = {
  [Hooks.GET_APP_RECORD_NAME]: {
    app: App
    name: string
  }
  [Hooks.GET_APP_ROOT_INSTANCE]: {
    app: App
    root: any
  }
  [Hooks.REGISTER_APPLICATION]: {
    app: App
  }
  [Hooks.WALK_COMPONENT_TREE]: {
    componentInstance: any // @TODO
    componentTreeData: ComponentTreeNode
    maxDepth: number
    filter: string
  }
  [Hooks.WALK_COMPONENT_PARENTS]: {
    componentInstance: any // @TODO
    parentInstances: any[] // @TODO
  }
  [Hooks.INSPECT_COMPONENT]: {
    componentInstance: any // @TODO
    instanceData: InspectedComponentData
  }
  [Hooks.GET_COMPONENT_BOUNDS]: {
    componentInstance: any // @TODO
    bounds: ComponentBounds
  }
  [Hooks.GET_COMPONENT_NAME]: {
    componentInstance: any // @TODO
    name: string
  }
  [Hooks.GET_ELEMENT_COMPONENT]: {
    element: any
    componentInstance: any // @TODO
  }
}

export type HookHandler<TPayload> = (payload: TPayload, ctx: BackendContext) => void | Promise<void>

export class DevtoolsHookable {
  private handlers: Partial<{ [eventType in Hooks]: HookHandler<HookPayloads[eventType]>[] }> = {}

  private hook<T extends Hooks> (eventType: T, handler: HookHandler<HookPayloads[T]>) {
    const handlers = (this.handlers[eventType] = this.handlers[eventType] || []) as HookHandler<HookPayloads[T]>[]
    handlers.push(handler)
  }

  async callHandlers<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext) {
    if (this.handlers[eventType]) {
      const handlers = this.handlers[eventType] as HookHandler<HookPayloads[T]>[]
      for (let i = 0; i < handlers.length; i++) {
        await handlers[i](payload, ctx)
      }
    }
    return payload
  }

  getAppRecordName (handler: HookHandler<HookPayloads[Hooks.GET_APP_RECORD_NAME]>) {
    this.hook(Hooks.GET_APP_RECORD_NAME, handler)
  }

  getAppRootInstance (handler: HookHandler<HookPayloads[Hooks.GET_APP_ROOT_INSTANCE]>) {
    this.hook(Hooks.GET_APP_ROOT_INSTANCE, handler)
  }

  registerApplication (handler: HookHandler<HookPayloads[Hooks.REGISTER_APPLICATION]>) {
    this.hook(Hooks.REGISTER_APPLICATION, handler)
  }

  walkComponentTree (handler: HookHandler<HookPayloads[Hooks.WALK_COMPONENT_TREE]>) {
    this.hook(Hooks.WALK_COMPONENT_TREE, handler)
  }

  walkComponentParents (handler: HookHandler<HookPayloads[Hooks.WALK_COMPONENT_PARENTS]>) {
    this.hook(Hooks.WALK_COMPONENT_PARENTS, handler)
  }

  inspectComponent (handler: HookHandler<HookPayloads[Hooks.INSPECT_COMPONENT]>) {
    this.hook(Hooks.INSPECT_COMPONENT, handler)
  }

  getComponentBounds (handler: HookHandler<HookPayloads[Hooks.GET_COMPONENT_BOUNDS]>) {
    this.hook(Hooks.GET_COMPONENT_BOUNDS, handler)
  }

  getComponentName (handler: HookHandler<HookPayloads[Hooks.GET_COMPONENT_NAME]>) {
    this.hook(Hooks.GET_COMPONENT_NAME, handler)
  }

  getElementComponent (handler: HookHandler<HookPayloads[Hooks.GET_ELEMENT_COMPONENT]>) {
    this.hook(Hooks.GET_ELEMENT_COMPONENT, handler)
  }
}
