import { BackendContext, TimelineMarker } from '@vue-devtools/app-backend-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { isPerformanceSupported, TimelineMarkerOptions } from '@vue/devtools-api'
import { dateThreshold, perfTimeDiff } from './timeline'

export async function addTimelineMarker (options: TimelineMarkerOptions, ctx: BackendContext) {
  if (!ctx.currentAppRecord) {
    options.all = true
  }
  const marker: TimelineMarker = {
    ...options,
    appRecord: options.all ? null : ctx.currentAppRecord,
  }
  ctx.timelineMarkers.push(marker)
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_MARKER, {
    marker: await serializeMarker(marker),
    appId: ctx.currentAppRecord?.id,
  })
}

export async function sendTimelineMarkers (ctx: BackendContext) {
  if (!ctx.currentAppRecord) return
  const markers = ctx.timelineMarkers.filter(marker => marker.all || marker.appRecord === ctx.currentAppRecord)
  const result = []
  for (const marker of markers) {
    result.push(await serializeMarker(marker))
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_TIMELINE_LOAD_MARKERS, {
    markers: result,
    appId: ctx.currentAppRecord.id,
  })
}

async function serializeMarker (marker: TimelineMarker) {
  let time = marker.time
  if (isPerformanceSupported() && time < dateThreshold) {
    time += perfTimeDiff
  }
  return {
    id: marker.id,
    appId: marker.appRecord?.id,
    all: marker.all,
    time: Math.round(time * 1000),
    label: marker.label,
    color: marker.color,
  }
}
