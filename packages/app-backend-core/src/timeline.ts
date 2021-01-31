import { AppRecord, BackendContext } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents, stringify } from '@vue-devtools/shared-utils'
import { App, ID, TimelineEventOptions, WithId } from '@vue/devtools-api'
import { hook } from './global-hook'
import { getAppRecord, getAppRecordId } from './app'

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
      appId: getAppRecord(layer.app, ctx)?.id,
      pluginId: layer.plugin.descriptor.id
    }))
  })
}

let nextTimelineEventId = 0

export function addTimelineEvent (options: TimelineEventOptions, app: App, ctx: BackendContext) {
  const appId = app && getAppRecordId(app)
  const isAllApps = options.all || !app || appId == null

  const id = nextTimelineEventId++

  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
    appId: isAllApps ? 'all' : appId,
    layerId: options.layerId,
    event: {
      id,
      time: options.event.time,
      logType: options.event.logType,
      groupId: options.event.groupId,
      title: options.event.title,
      subtitle: options.event.subtitle
    }
  })

  const eventData = {
    id,
    ...options
  }

  if (!isAllApps && app) {
    const appRecord = getAppRecord(app, ctx)
    registerTimelineEvent(eventData, appRecord, ctx)
  } else {
    ctx.appRecords.forEach(appRecord => registerTimelineEvent(eventData, appRecord, ctx))
  }
}

function registerTimelineEvent (options: TimelineEventOptions & WithId, appRecord: AppRecord, ctx: BackendContext) {
  appRecord.timelineEventMap.set(options.id, options)
}

export function clearTimeline (ctx: BackendContext) {
  ctx.appRecords.forEach(appRecord => {
    appRecord.timelineEventMap.clear()
  })
}

export async function sendTimelineEventData (id: ID, ctx: BackendContext) {
  let data = null
  const eventData = ctx.currentAppRecord.timelineEventMap.get(id)
  if (eventData) {
    data = await ctx.api.inspectTimelineEvent(eventData)
    data = stringify(data)
  } else {
    console.warn(`Event ${id} not found`)
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, {
    eventId: id,
    data
  })
}
