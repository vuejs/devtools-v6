import { DevtoolsBackend } from './backend'
import { App, ComponentInstance } from '@vue/devtools-api'

export interface AppRecordOptions {
  app: App
  version: string
  types: { [key: string]: string | symbol }
}

export interface AppRecord {
  id: number
  name: string
  options: AppRecordOptions
  backend: DevtoolsBackend
  lastInspectedComponentId: string
  instanceMap: Map<string, ComponentInstance>
  rootInstance: ComponentInstance
}

/**
 * Used in the frontend
 */
export interface SimpleAppRecord {
  id: number
  name: string
  version: string
}
