import { SharedData } from './shared-data'
import { PluginSettingsItem } from '@vue/devtools-api'

export function getPluginSettings<TSettings extends Record<string, any> = any> (pluginId: string, defaultSettings?: TSettings): TSettings {
  return {
    ...defaultSettings ?? {},
    ...SharedData.pluginSettings[pluginId] ?? {},
  }
}

export function setPluginSettings<TSettings extends Record<string, any> = any> (pluginId: string, settings: TSettings) {
  SharedData.pluginSettings = {
    ...SharedData.pluginSettings,
    [pluginId]: settings,
  }
}

export function getPluginDefaultSettings<TSettings extends Record<string, any> = any> (schema: Record<string, PluginSettingsItem>): TSettings {
  const result: Record<string, any> = {}
  if (schema) {
    for (const id in schema) {
      const item = schema[id]
      result[id] = item.defaultValue
    }
  }
  return result as TSettings
}
