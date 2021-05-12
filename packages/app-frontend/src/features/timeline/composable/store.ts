import { ref } from '@vue/composition-api'
import { ID } from '@vue/devtools-api'
import type { Container, Graphics } from 'pixi.js-legacy'

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
  appId: number
  stackedEvents: TimelineEvent[]
  group: EventGroup
  stackParent: TimelineEvent
  screenshot: EventScreenshot
  container: Container
  g: Graphics
}

export interface LayerFromBackend {
  id: string
  label: string
  color: number
  appId?: number
  pluginId?: string
}

export interface Layer extends LayerFromBackend {
  events: TimelineEvent[]
  displayedEvents: TimelineEvent[]
  eventTimeMap: { [time: number]: TimelineEvent }
  groupsMap: Record<EventGroup['id'], EventGroup>
  groups: EventGroup[]
  height: number
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

export const selectedEvent = ref<TimelineEvent>(null)
export const hoverLayerId = ref<Layer['id']>(null)

export const inspectedEvent = ref<TimelineEvent>(null)
export const inspectedEventData = ref(null)
export const inspectedEventPendingId = ref<TimelineEvent['id']>(null)

export const screenshots = ref<EventScreenshot[]>([])
