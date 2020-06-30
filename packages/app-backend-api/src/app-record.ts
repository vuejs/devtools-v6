import { DevtoolsBackend } from './backend'

export type App = any // @TODO

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
  instanceMap: Map<string, any>
  rootInstance: any
}

/**
 * Used in the frontend
 */
export interface SimpleAppRecord {
  id: number
  name: string
  version: string
}
