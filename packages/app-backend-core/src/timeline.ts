import { BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents, keys, stringify } from '@vue-devtools/shared-utils'
import { App, TimelineEvent, TimelineEventOptions } from '@vue/devtools-api'
import { hook } from './global-hook'
import { getAppRecord, getAppRecordId } from './app'

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
      addTimelineEvent({
        layerId: 'mouse',
        event: {
          time: Date.now(),
          data: {
            type: eventType,
            x: event.clientX,
            y: event.clientY
          },
          title: eventType
        }
      }, null, ctx)
    }, {
      capture: true,
      passive: true
    })
  })

  ;['keyup', 'keydown', 'keypress'].forEach(eventType => {
    // @ts-ignore
    window.addEventListener(eventType, (event: KeyboardEvent) => {
      addTimelineEvent({
        layerId: 'keyboard',
        event: {
          time: Date.now(),
          data: {
            type: eventType,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
          },
          title: event.key
        }
      }, null, ctx)
    }, {
      capture: true,
      passive: true
    })
  })

  hook.on(HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
    const appRecord = getAppRecord(app, ctx)
    const componentId = `${appRecord.id}:${instance.uid}`
    const componentDisplay = (await ctx.api.getComponentName(instance)) || '<i>Unknown Component</i>'

    addTimelineEvent({
      layerId: 'component-event',
      event: {
        time: Date.now(),
        data: {
          component: {
            _custom: {
              type: 'component-definition',
              display: componentDisplay
            }
          },
          event,
          params
        },
        title: event,
        subtitle: `by ${componentDisplay}`,
        meta: {
          componentId,
          bounds: await ctx.api.getComponentBounds(instance)
        }
      }
    }, app, ctx)
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

export function addTimelineEvent (options: TimelineEventOptions, app: App, ctx: BackendContext) {
  const appId = app && getAppRecordId(app)
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
    appId: options.all || !app || appId == null ? 'all' : appId,
    layerId: options.layerId,
    event: {
      ...options.event,
      data: stringify(options.event.data)
    }
  } as TimelineEventPayload)
}
