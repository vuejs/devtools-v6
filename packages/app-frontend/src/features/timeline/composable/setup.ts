import cloneDeep from 'lodash/cloneDeep'
import { Bridge, BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { getApps } from '@front/features/apps'
import {
  inspectedEvent,
  inspectedEventData,
  inspectedEventPendingId,
  TimelineEvent
} from './store'
import { getLayers, fetchLayers, layerFactory } from './layers'
import { addEvent } from './events'
import { resetTimeline } from './reset'

const pendingEvents: Record<string, TimelineEvent[]> = {}

export function setupTimelineBridgeEvents (bridge: Bridge) {
  resetTimeline(false)

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT, ({ appId, layerId, event }) => {
    const appIds = appId === 'all' ? getApps().map(app => app.id) : [appId]
    for (const appId of appIds) {
      const layer = getLayers(appId).find(l => l.id === layerId)
      if (!layer) {
        // Layer not found
        const pendingKey = `${appId}:${layerId}`
        pendingEvents[pendingKey] = pendingEvents[pendingKey] ?? []
        pendingEvents[pendingKey].push(event)
        return
      }

      addEvent(appId, cloneDeep(event), layer)
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, () => {
    fetchLayers()
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, ({ layers }) => {
    for (const layer of layers) {
      const appIds = layer.appId != null ? [layer.appId] : getApps().map(app => app.id)
      for (const appId of appIds) {
        const existingLayers = getLayers(appId)
        if (!existingLayers.some(l => l.id === layer.id)) {
          existingLayers.push(layerFactory(layer))

          // Add pending events
          const pendingKey = `${appId}:${layer.id}`
          if (pendingEvents[pendingKey] && pendingEvents[pendingKey].length) {
            for (const event of pendingEvents[pendingKey]) {
              addEvent(appId, cloneDeep(event), getLayers(appId).find(l => l.id === layer.id))
            }
            pendingEvents[pendingKey] = []
          }

          // Load existing events that may not have been catched
          bridge.send(BridgeEvents.TO_BACK_TIMELINE_LAYER_LOAD_EVENTS, { layerId: layer.id, appId })
        }
      }
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, ({ eventId, data }) => {
    if (inspectedEvent.value) {
      if (inspectedEvent.value.id === eventId) {
        inspectedEventData.value = parse(data)

        if (data === null) {
          inspectedEvent.value = null
        }
      }
      if (eventId === inspectedEventPendingId.value) {
        inspectedEventPendingId.value = null
      }
    }
  })

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS, ({ appId, layerId, events }) => {
    const layer = getLayers(appId).find(l => l.id === layerId)
    if (!layer) {
      // Layer not found
      const pendingKey = `${appId}:${layerId}`
      pendingEvents[pendingKey] = pendingEvents[pendingKey] ?? []
      pendingEvents[pendingKey].push(...events)
      return
    }

    for (const event of events) {
      addEvent(appId, cloneDeep(event), layer)
    }
  })
}
