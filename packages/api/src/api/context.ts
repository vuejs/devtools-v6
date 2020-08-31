import { DevtoolsPluginApi } from './api'

export interface Context {
  api: DevtoolsPluginApi
  currentTab: string
}
