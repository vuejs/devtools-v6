import cloneDeep from 'lodash/cloneDeep'
import { Bridge, BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { getApps } from '@front/features/apps'
import {
  inspectedEvent,
  inspectedEventData,
  inspectedEventPendingId
} from './store'
import { getLayers, fetchLayers, layerFactory } from './layers'
import { addEvent } from './events'
import { resetTimeline } from './reset'

export function setupTimelineBridgeEvents (bridge: Bridge) {
  resetTimeline(false)

  bridge.on(BridgeEvents.TO_FRONT_TIMELINE_EVENT, ({ appId, layerId, event }) => {
    const appIds = appId === 'all' ? getApps().map(app => app.id) : [appId]
    for (const appId of appIds) {
      const layer = getLayers(appId).find(l => l.id === layerId)
      if (!layer) {
        console.error(`Layer ${layerId} not found`)
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
      const existingLayers = getLayers(layer.appId)
      if (!existingLayers.some(l => l.id === layer.id)) {
        existingLayers.push(layerFactory(layer))
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
}
