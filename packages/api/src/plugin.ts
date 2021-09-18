import { App } from './api'

export interface PluginDescriptor {
  id: string
  label: string
  app: App
  packageName?: string
  homepage?: string
  componentStateTypes?: string[]
  logo?: string
  disableAppScope?: boolean
  /**
   * Run the plugin setup and expose the api even if the devtools is not opened yet.
   * Useful to record timeline events early.
   */
  enableEarlyProxy?: boolean
  settings?: Record<string, PluginSettingsItem>
}

export type PluginSettingsItem = {
  label: string
} & ({
  type: 'boolean'
  defaultValue: boolean
} | {
  type: 'choice'
  defaultValue: string | number
  options: { value: string | number, label: string }[]
  component?: 'select' | 'button-group'
} | {
  type: 'text'
  defaultValue: string
})
