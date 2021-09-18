import { BackendContext, TimelineMarker } from '@vue-devtools/app-backend-api'
import { getAppRecordId } from './app'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { TimelineMarkerOptions } from '@vue/devtools-api'

export async function addTimelineMarker (options: TimelineMarkerOptions, ctx: BackendContext) {
  if (!ctx.currentAppRecord) {
    options.all = true
  }
  const marker: TimelineMarker = {
    ...options,
    app: options.all ? null : ctx.currentAppRecord?.options.app
  }
  ctx.timelineMarkers.push(marker)
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_MARKER, {
    marker: await serializeMarker(marker),
    appId: ctx.currentAppRecord.id
  })
}

export async function sendTimelineMarkers (ctx: BackendContext) {
  const markers = ctx.timelineMarkers.filter(marker => marker.all || marker.app === ctx.currentAppRecord.options.app)
  const result = []
  for (const marker of markers) {
    result.push(await serializeMarker(marker))
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LOAD_MARKERS, {
    markers: result,
    appId: ctx.currentAppRecord.id
  })
}

async function serializeMarker (marker: TimelineMarker) {
  return {
    id: marker.id,
    appId: marker.app ? await getAppRecordId(marker.app) : null,
    all: marker.all,
    time: marker.time,
    label: marker.label,
    color: marker.color
  }
}
