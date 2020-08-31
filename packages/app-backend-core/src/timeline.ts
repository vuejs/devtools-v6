import { BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents, stringify } from '@vue-devtools/shared-utils'
import { hook } from './global-hook'
import { getAppRecord } from './app'

export interface TimelineEventPayload<TData = any, TMeta = any> {
  appId: number | 'all'
  layerId: string
  event: Event<TData, TMeta>
}

export interface Event<TData = any, TMeta = any> {
  time: number
  data: TData
  meta: TMeta
}

export function setupTimeline (ctx: BackendContext) {
  setupBuiltinLayers(ctx)
}

function setupBuiltinLayers (ctx: BackendContext) {
  ;['mousedown', 'mouseup', 'click', 'dblclick'].forEach(eventType => {
    // @ts-ignore
    window.addEventListener(eventType, (event: MouseEvent) => {
      ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
        appId: 'all',
        layerId: 'mouse',
        event: {
          time: Date.now(),
          data: stringify({
            type: eventType,
            x: event.clientX,
            y: event.clientY
          })
        }
      } as TimelineEventPayload)
    }, {
      capture: true,
      passive: true
    })
  })

  ;['keyup', 'keydown', 'keypress'].forEach(eventType => {
    // @ts-ignore
    window.addEventListener(eventType, (event: KeyboardEvent) => {
      ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
        appId: 'all',
        layerId: 'keyboard',
        event: {
          time: Date.now(),
          data: stringify({
            type: eventType,
            code: event.keyCode,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
          })
        }
      } as TimelineEventPayload)
    }, {
      capture: true,
      passive: true
    })
  })

  hook.on(HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
    const appRecord = getAppRecord(app, ctx)
    const id = `${appRecord.id}:${instance.uid}`
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      appId: appRecord.id,
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
      }
    } as TimelineEventPayload)
  })
}
