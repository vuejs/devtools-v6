import { PluginDescriptor, SetupFunction } from '@vue/devtools-api'

export interface Plugin {
  descriptor: PluginDescriptor
  setupFn: SetupFunction
  error: Error
}
