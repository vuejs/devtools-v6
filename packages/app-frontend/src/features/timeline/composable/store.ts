import { Ref, ref } from '@vue/composition-api'
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
  y: number
}

export interface EventScreenshot {
  id: number
  time: number
  image: string
  events: TimelineEvent[]
}

export interface TimelineEvent extends TimelineEventFromBackend {
  layer: Layer
  appId: number | 'all'
  group: EventGroup
  screenshot: EventScreenshot
  container: PIXI.Container
  g: PIXI.Graphics
  groupG: PIXI.Graphics
  groupT: PIXI.Text
}

export interface LayerFromBackend {
  id: string
  label: string
  color: number
  appId?: number
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
  height: number
  lastInspectedEvent: TimelineEvent
  loaded: boolean
}

export const startTime = ref(0)
export const endTime = ref(0)
export const minTime = ref(0)
export const maxTime = ref(0)

export const timelineIsEmpty = ref(true)

export const cursorTime = ref<number>(null)

export const layersPerApp = ref<{[appId: number]: Layer[]}>({})
export const hiddenLayersPerApp = ref<{[appId: number]: Layer['id'][]}>({})
export const vScrollPerApp = ref<{[appId: number]: number}>({})

export const selectedEvent: Ref<TimelineEvent> = ref(null)
export const selectedLayer: Ref<Layer> = ref(null)
export const hoverLayerId = ref<Layer['id']>(null)

export const inspectedEvent: Ref<TimelineEvent> = ref(null)
export const inspectedEventData = ref(null)
export const inspectedEventPendingId = ref<TimelineEvent['id']>(null)

export const screenshots = ref<EventScreenshot[]>([])
