import { DevtoolsBackend } from './backend'
import { App, ComponentInstance, TimelineEventOptions, ID, WithId } from '@vue/devtools-api'

export interface AppRecordOptions {
  app: App
  version: string
  types: { [key: string]: string | symbol }
  meta?: any
}

export interface AppRecord {
  id: number
  name: string
  options: AppRecordOptions
  backend: DevtoolsBackend
  lastInspectedComponentId: string
  instanceMap: Map<string, ComponentInstance>
  rootInstance: ComponentInstance
  componentFilter?: string
  perfGroupIds: Map<string, { groupId: number, time: number }>
  iframe: string
  meta: any
}

/**
 * Used in the frontend
 */
export interface SimpleAppRecord {
  id: number
  name: string
  version: string
  iframe: string
}
