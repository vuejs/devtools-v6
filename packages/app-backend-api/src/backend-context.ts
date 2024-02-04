import type { Bridge } from '@vue-devtools/shared-utils'
import type {
  CustomInspectorOptions,
  ID,
  TimelineEventOptions,
  TimelineLayerOptions,
  TimelineMarkerOptions,
  WithId,
} from '@vue/devtools-api'
import type { AppRecord } from './app-record'
import type { Plugin } from './plugin'
import type { DevtoolsHook } from './global-hook'
import type { DevtoolsBackend } from './backend'

export interface BackendContext {
  bridge: Bridge
  hook: DevtoolsHook
  backends: DevtoolsBackend[]
  appRecords: AppRecord[]
  currentTab: string
  currentAppRecord: AppRecord
  currentInspectedComponentId: string
  plugins: Plugin[]
  currentPlugin: Plugin
  timelineLayers: TimelineLayer[]
  nextTimelineEventId: number
  timelineEventMap: Map<ID, TimelineEventOptions & WithId>
  perfUniqueGroupId: number
  customInspectors: CustomInspector[]
  timelineMarkers: TimelineMarker[]
}

export interface TimelineLayer extends TimelineLayerOptions {
  appRecord: AppRecord | null
  plugin: Plugin
  events: (TimelineEventOptions & WithId)[]
}

export interface TimelineMarker extends TimelineMarkerOptions {
  appRecord: AppRecord | null
}

export interface CustomInspector extends CustomInspectorOptions {
  appRecord: AppRecord
  plugin: Plugin
  treeFilter: string
  selectedNodeId: string
}

export interface CreateBackendContextOptions {
  bridge: Bridge
  hook: DevtoolsHook
}

export function createBackendContext(options: CreateBackendContextOptions): BackendContext {
  return {
    bridge: options.bridge,
    hook: options.hook,
    backends: [],
    appRecords: [],
    currentTab: null,
    currentAppRecord: null,
    currentInspectedComponentId: null,
    plugins: [],
    currentPlugin: null,
    timelineLayers: [],
    nextTimelineEventId: 0,
    timelineEventMap: new Map(),
    perfUniqueGroupId: 0,
    customInspectors: [],
    timelineMarkers: [],
  }
}
