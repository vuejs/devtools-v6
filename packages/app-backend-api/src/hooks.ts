import { Hooks, HookPayloads, Hookable, HookHandler } from '@vue/devtools-api'
import { BackendContext } from './backend-context'
import { Plugin } from './plugin'

type Handler<TPayload> = HookHandler<TPayload, BackendContext>

export interface HookHandlerData<THandlerPayload> {
  handler: Handler<THandlerPayload>
  plugin: Plugin
}

export class DevtoolsHookable implements Hookable<BackendContext> {
  private handlers: Partial<{ [eventType in Hooks]: HookHandlerData<HookPayloads[eventType]>[] }> = {}
  private ctx: BackendContext

  constructor (ctx: BackendContext) {
    this.ctx = ctx
  }

  private hook<T extends Hooks> (eventType: T, handler: Handler<HookPayloads[T]>) {
    const handlers = (this.handlers[eventType] = this.handlers[eventType] || []) as HookHandlerData<HookPayloads[T]>[]
    handlers.push({
      handler,
      plugin: this.ctx.currentPlugin
    })
  }

  async callHandlers<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext) {
    if (this.handlers[eventType]) {
      const handlers = this.handlers[eventType] as HookHandlerData<HookPayloads[T]>[]
      for (let i = 0; i < handlers.length; i++) {
        const { handler, plugin } = handlers[i]
        try {
          await handler(payload, ctx)
        } catch (e) {
          console.error(`An error occured in hook ${eventType}${plugin ? ` registered by plugin ${plugin.descriptor.id}` : ''}`)
          console.error(e)
        }
      }
    }
    return payload
  }

  transformCall (handler: Handler<HookPayloads[Hooks.TRANSFORM_CALL]>) {
    this.hook(Hooks.TRANSFORM_CALL, handler)
  }

  getAppRecordName (handler: Handler<HookPayloads[Hooks.GET_APP_RECORD_NAME]>) {
    this.hook(Hooks.GET_APP_RECORD_NAME, handler)
  }

  getAppRootInstance (handler: Handler<HookPayloads[Hooks.GET_APP_ROOT_INSTANCE]>) {
    this.hook(Hooks.GET_APP_ROOT_INSTANCE, handler)
  }

  registerApplication (handler: Handler<HookPayloads[Hooks.REGISTER_APPLICATION]>) {
    this.hook(Hooks.REGISTER_APPLICATION, handler)
  }

  walkComponentTree (handler: Handler<HookPayloads[Hooks.WALK_COMPONENT_TREE]>) {
    this.hook(Hooks.WALK_COMPONENT_TREE, handler)
  }

  walkComponentParents (handler: Handler<HookPayloads[Hooks.WALK_COMPONENT_PARENTS]>) {
    this.hook(Hooks.WALK_COMPONENT_PARENTS, handler)
  }

  inspectComponent (handler: Handler<HookPayloads[Hooks.INSPECT_COMPONENT]>) {
    this.hook(Hooks.INSPECT_COMPONENT, handler)
  }

  getComponentBounds (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_BOUNDS]>) {
    this.hook(Hooks.GET_COMPONENT_BOUNDS, handler)
  }

  getComponentName (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_NAME]>) {
    this.hook(Hooks.GET_COMPONENT_NAME, handler)
  }

  getElementComponent (handler: Handler<HookPayloads[Hooks.GET_ELEMENT_COMPONENT]>) {
    this.hook(Hooks.GET_ELEMENT_COMPONENT, handler)
  }

  getComponentRootElements (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_ROOT_ELEMENTS]>) {
    this.hook(Hooks.GET_COMPONENT_ROOT_ELEMENTS, handler)
  }

  editComponentState (handler: Handler<HookPayloads[Hooks.EDIT_COMPONENT_STATE]>) {
    this.hook(Hooks.EDIT_COMPONENT_STATE, handler)
  }

  inspectTimelineEvent (handler: Handler<HookPayloads[Hooks.INSPECT_TIMELINE_EVENT]>) {
    this.hook(Hooks.INSPECT_TIMELINE_EVENT, handler)
  }

  getInspectorTree (handler: Handler<HookPayloads[Hooks.GET_INSPECTOR_TREE]>) {
    this.hook(Hooks.GET_INSPECTOR_TREE, handler)
  }

  getInspectorState (handler: Handler<HookPayloads[Hooks.GET_INSPECTOR_STATE]>) {
    this.hook(Hooks.GET_INSPECTOR_STATE, handler)
  }

  editInspectorState (handler: Handler<HookPayloads[Hooks.EDIT_INSPECTOR_STATE]>) {
    this.hook(Hooks.EDIT_INSPECTOR_STATE, handler)
  }
}
