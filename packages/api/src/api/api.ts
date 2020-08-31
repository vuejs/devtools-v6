import { Hookable } from './hooks'
import { Context } from './context'
import { ComponentInstance } from './component'

export interface DevtoolsPluginApi {
  on: Hookable<Context>
  notifyComponentUpdate (instance: ComponentInstance)
  addTimelineLayer (options: TimelineLayerOptions)
  addTimelineEvent (options: TimelineEventOptions)
}

export interface TimelineLayerOptions {
  id: string
  label: string
  color: number
}

export interface TimelineEventOptions {
  layerId: string
  event: TimelineEvent
  all?: boolean
}

export interface TimelineEvent<TData = any, TMeta = any> {
  time: number
  data: TData
  meta: TMeta
}
