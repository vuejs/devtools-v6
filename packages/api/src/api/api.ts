import { Hookable } from './hooks'
import { Context } from './context'
import { ComponentInstance } from './component'

export interface DevtoolsPluginApi {
  on: Hookable<Context>
  notifyComponentUpdate (instance: ComponentInstance)
}
