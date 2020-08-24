import { BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents, stringify } from '@vue-devtools/shared-utils'
import { hook } from './global-hook'
import { getAppRecord } from './util/app'

export interface Event<TData = any, TMeta = any> {
  time: number
  data: TData
  meta: TMeta
}

export function setupTimeline (ctx: BackendContext) {
  setupBuiltinLayers(ctx)
}

function setupBuiltinLayers (ctx: BackendContext) {
  window.addEventListener('click', event => {
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      layerId: 'mouse',
      event: {
        time: Date.now(),
        data: stringify({
          type: 'click',
          x: event.clientX,
          y: event.clientY
        })
      } as Event
    })
  })

  window.addEventListener('keyup', event => {
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      layerId: 'keyboard',
      event: {
        time: Date.now(),
        data: stringify({
          type: 'keyup',
          code: event.keyCode,
          key: event.key,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey
        })
      } as Event
    })
  })

  hook.on(HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
    const appRecord = getAppRecord(app, ctx)
    const id = `${appRecord.id}:${instance.uid}`
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      layerId: 'component-event',
      event: {
        time: Date.now(),
        data: stringify({
          component: {
            _custom: {
              type: 'component-definition',
              display: (await ctx.api.getComponentName(instance)) || '<i>Unknown Component</i>'
            }
          },
          event,
          params
        }),
        meta: {
          componentId: id
        }
      } as Event
    })
  })
}
