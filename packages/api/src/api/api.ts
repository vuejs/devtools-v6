import { Hookable } from './hooks'
import { Context } from './context'
import { ComponentInstance, ComponentState, StateBase } from './component'

export interface DevtoolsPluginApi {
  on: Hookable<Context>
  notifyComponentUpdate (instance: ComponentInstance)
  addTimelineLayer (options: TimelineLayerOptions)
  addTimelineEvent (options: TimelineEventOptions)
  addInspector (options: CustomInspectorOptions)
  sendInspectorTree (inspectorId: string)
  sendInspectorState (inspectorId: string)
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

export interface CustomInspectorOptions {
  id: string
  label: string
  icon?: string
  treeFilterPlaceholder?: string
  stateFilterPlaceholder?: string
}

export interface CustomInspectorNode {
  id: string
  label: string
  children?: CustomInspectorNode[]
  tags?: CustomInspectorNodeTag[]
}

export interface CustomInspectorNodeTag {
  label: string
  textColor: number
  backgroundColor: number
}

export interface CustomInspectorState {
  [key: string]: (StateBase | ComponentState)[]
}
