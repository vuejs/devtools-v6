import { BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents, keys, stringify } from '@vue-devtools/shared-utils'
import { TimelineEvent } from '@vue/devtools-api'
import { hook } from './global-hook'
import { getAppRecord } from './app'

export interface TimelineEventPayload<TData = any, TMeta = any> {
  appId: number | 'all'
  layerId: string
  event: TimelineEvent<TData, TMeta>
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
          }),
          title: eventType
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
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
          }),
          title: event.key
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
        title: event,
        meta: {
          componentId: id
        }
      }
    } as TimelineEventPayload)
  })
}

export function sendTimelineLayers (ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, {
    layers: ctx.timelineLayers.map(layer => ({
      id: layer.id,
      label: layer.label,
      color: layer.color,
      appId: getAppRecord(layer.app, ctx)?.id
    }))
  })
}
