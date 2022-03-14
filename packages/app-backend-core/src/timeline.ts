import { BackendContext, AppRecord } from '@vue-devtools/app-backend-api'
import { BridgeEvents, HookEvents, stringify, SharedData, isBrowser } from '@vue-devtools/shared-utils'
import { App, ID, TimelineEventOptions, WithId, now, isPerformanceSupported } from '@vue/devtools-api'
import { hook } from './global-hook'
import { getAppRecord, getAppRecordId } from './app'
import { builtinLayers } from './timeline-builtins'

export function setupTimeline (ctx: BackendContext) {
  setupBuiltinLayers(ctx)
}

export function addBuiltinLayers (appRecord: AppRecord, ctx: BackendContext) {
  for (const layerDef of builtinLayers) {
    ctx.timelineLayers.push({
      ...layerDef,
      appRecord,
      plugin: null,
      events: [],
    })
  }
}

function setupBuiltinLayers (ctx: BackendContext) {
  if (isBrowser) {
    ['mousedown', 'mouseup', 'click', 'dblclick'].forEach(eventType => {
      // @ts-ignore
      window.addEventListener(eventType, async (event: MouseEvent) => {
        await addTimelineEvent({
          layerId: 'mouse',
          event: {
            time: now(),
            data: {
              type: eventType,
              x: event.clientX,
              y: event.clientY,
            },
            title: eventType,
          },
        }, null, ctx)
      }, {
        capture: true,
        passive: true,
      })
    })

    ;['keyup', 'keydown', 'keypress'].forEach(eventType => {
      // @ts-ignore
      window.addEventListener(eventType, async (event: KeyboardEvent) => {
        await addTimelineEvent({
          layerId: 'keyboard',
          event: {
            time: now(),
            data: {
              type: eventType,
              key: event.key,
              ctrlKey: event.ctrlKey,
              shiftKey: event.shiftKey,
              altKey: event.altKey,
              metaKey: event.metaKey,
            },
            title: event.key,
          },
        }, null, ctx)
      }, {
        capture: true,
        passive: true,
      })
    })
  }

  hook.on(HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
    try {
      if (!SharedData.componentEventsEnabled) return

      const appRecord = await getAppRecord(app, ctx)
      const componentId = `${appRecord.id}:${instance.uid}`
      const componentDisplay = (await appRecord.backend.api.getComponentName(instance)) || '<i>Unknown Component</i>'

      await addTimelineEvent({
        layerId: 'component-event',
        event: {
          time: now(),
          data: {
            component: {
              _custom: {
                type: 'component-definition',
                display: componentDisplay,
              },
            },
            event,
            params,
          },
          title: event,
          subtitle: `by ${componentDisplay}`,
          meta: {
            componentId,
            bounds: await appRecord.backend.api.getComponentBounds(instance),
          },
        },
      }, app, ctx)
    } catch (e) {
      if (SharedData.debugInfo) {
        console.error(e)
      }
    }
  })
}

export async function sendTimelineLayers (ctx: BackendContext) {
  const layers = []
  for (const layer of ctx.timelineLayers) {
    try {
      layers.push({
        id: layer.id,
        label: layer.label,
        color: layer.color,
        appId: layer.appRecord?.id,
        pluginId: layer.plugin?.descriptor.id,
        groupsOnly: layer.groupsOnly,
        skipScreenshots: layer.skipScreenshots,
        ignoreNoDurationGroups: layer.ignoreNoDurationGroups,
      })
    } catch (e) {
      if (SharedData.debugInfo) {
        console.error(e)
      }
    }
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, {
    layers,
  })
}

export async function addTimelineEvent (options: TimelineEventOptions, app: App, ctx: BackendContext) {
  const appId = app ? getAppRecordId(app) : null
  const isAllApps = options.all || !app || appId == null

  const id = ctx.nextTimelineEventId++

  const eventData: TimelineEventOptions & WithId = {
    id,
    ...options,
    all: isAllApps,
  }
  ctx.timelineEventMap.set(eventData.id, eventData)

  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
    appId: eventData.all ? 'all' : appId,
    layerId: eventData.layerId,
    event: mapTimelineEvent(eventData),
  })

  const layer = ctx.timelineLayers.find(l => (isAllApps || l.appRecord?.options.app === app) && l.id === options.layerId)
  if (layer) {
    layer.events.push(eventData)
  } else if (SharedData.debugInfo) {
    console.warn(`Timeline layer ${options.layerId} not found`)
  }
}

const initialTime = Date.now()
export const dateThreshold = initialTime - 1_000_000
export const perfTimeDiff = initialTime - now()

function mapTimelineEvent (eventData: TimelineEventOptions & WithId) {
  let time = eventData.event.time
  if (isPerformanceSupported() && time < dateThreshold) {
    time += perfTimeDiff
  }
  return {
    id: eventData.id,
    time: Math.round(time * 1000),
    logType: eventData.event.logType,
    groupId: eventData.event.groupId,
    title: eventData.event.title,
    subtitle: eventData.event.subtitle,
  }
}

export async function clearTimeline (ctx: BackendContext) {
  ctx.timelineEventMap.clear()
  for (const layer of ctx.timelineLayers) {
    layer.events = []
  }
  for (const backend of ctx.backends) {
    await backend.api.clearTimeline()
  }
}

export async function sendTimelineEventData (id: ID, ctx: BackendContext) {
  let data = null
  const eventData = ctx.timelineEventMap.get(id)
  if (eventData) {
    data = await ctx.currentAppRecord.backend.api.inspectTimelineEvent(eventData, ctx.currentAppRecord.options.app)
    data = stringify(data)
  } else if (SharedData.debugInfo) {
    console.warn(`Event ${id} not found`, ctx.timelineEventMap.keys())
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, {
    eventId: id,
    data,
  })
}

export function removeLayersForApp (app: App, ctx: BackendContext) {
  const layers = ctx.timelineLayers.filter(l => l.appRecord?.options.app === app)
  for (const layer of layers) {
    const index = ctx.timelineLayers.indexOf(layer)
    if (index !== -1) ctx.timelineLayers.splice(index, 1)
    for (const e of layer.events) {
      ctx.timelineEventMap.delete(e.id)
    }
  }
}

export function sendTimelineLayerEvents (appId: string, layerId: string, ctx: BackendContext) {
  const app = ctx.appRecords.find(ar => ar.id === appId)?.options.app
  if (!app) return
  const layer = ctx.timelineLayers.find(l => l.appRecord?.options.app === app && l.id === layerId)
  if (!layer) return
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS, {
    appId,
    layerId,
    events: layer.events.map(e => mapTimelineEvent(e)),
  })
}
