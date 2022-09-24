import { Ref, ref } from 'vue'
import { ID } from '@vue/devtools-api'
import * as PIXI from 'pixi.js-legacy'

export interface TimelineEventFromBackend {
  id: number
  time: number
  logType: 'default' | 'warning' | 'error'
  groupId: ID
  title: string
  subtitle: string
}

export interface EventGroup {
  id: ID
  events: TimelineEvent[]
  firstEvent: TimelineEvent
  lastEvent: TimelineEvent
  duration: number
  nonReactiveDuration: number
  y: number
  oldSize?: number
  oldSelected?: boolean
}

export interface EventScreenshot {
  id: number
  time: number
  image: string
  events: TimelineEvent[]
}

export interface TimelineEvent extends TimelineEventFromBackend {
  layer: Layer
  appId: string | 'all'
  group: EventGroup
  screenshot: EventScreenshot
  container: PIXI.Container
  g: PIXI.Graphics
  groupG: PIXI.Graphics
  groupT: PIXI.BitmapText
  groupText: string
  forcePositionUpdate?: boolean
}

export interface LayerFromBackend {
  id: string
  label: string
  color: number
  appId?: string
  pluginId?: string
  groupsOnly?: boolean
  skipScreenshots?: boolean
  ignoreNoDurationGroups?: boolean
}

export interface Layer extends LayerFromBackend {
  events: TimelineEvent[]
  eventsMap: Record<TimelineEvent['id'], TimelineEvent>
  groups: EventGroup[]
  groupsMap: Record<EventGroup['id'], EventGroup>
  groupPositionCache: Record<number, EventGroup[]>
  height: number
  newHeight: number
  lastInspectedEvent: TimelineEvent
  loaded: boolean
}

export interface MarkerFromBackend {
  id: string
  appId: string
  all?: boolean
  time: number
  label: string
  color: number
}

export interface TimelineMarker extends MarkerFromBackend {
  x: number
}

export const startTime = ref(0)
export const endTime = ref(0)
export const minTime = ref(0)
export const maxTime = ref(0)

export const timelineIsEmpty = ref(true)

export const cursorTime = ref<number>(null)

export const layersPerApp: Ref<{[appId: string]: Layer[]}> = ref({})
export const hiddenLayersPerApp: Ref<{[appId: string]: Layer['id'][]}> = ref({})
export const vScrollPerApp: Ref<{[appId: string]: number}> = ref({})

export const selectedEvent: Ref<TimelineEvent> = ref(null)
export const selectedLayer: Ref<Layer> = ref(null)
export const hoverLayerId: Ref<Layer['id']> = ref(null)

export const inspectedEvent: Ref<TimelineEvent> = ref(null)
export const inspectedEventData = ref(null)
export const inspectedEventPendingId: Ref<TimelineEvent['id']> = ref(null)

export const screenshots: Ref<EventScreenshot[]> = ref([])

export const markersAllApps: Ref<TimelineMarker[]> = ref([])
export const markersPerApp: Ref<{[appId: string]: TimelineMarker[]}> = ref({})
