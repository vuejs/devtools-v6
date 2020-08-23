import { BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents } from '@vue-devtools/shared-utils'
import { hook } from './global-hook'
import { getAppRecord } from './util/app'

export interface Event<TData = any> {
  time: number
  data: TData
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
        data: {
          type: 'click',
          x: event.clientX,
          y: event.clientY
        }
      } as Event
    })
  })

  window.addEventListener('keyup', event => {
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      layerId: 'keyboard',
      event: {
        time: Date.now(),
        data: {
          type: 'keyup',
          code: event.keyCode,
          key: event.key,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey
        }
      } as Event
    })
  })

  hook.on(HookEvents.COMPONENT_EMIT, (app, uid, event, params) => {
    const appRecord = getAppRecord(app, ctx)
    const id = `${appRecord.id}:${uid}`
    ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
      layerId: 'component-event',
      event: {
        time: Date.now(),
        data: {
          event,
          params,
          componentId: id
        }
      } as Event
    })
  })
}
