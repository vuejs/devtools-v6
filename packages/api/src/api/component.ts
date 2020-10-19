import { InspectorNodeTag } from './api'

export type ComponentInstance = any // @TODO

export interface ComponentTreeNode {
  uid: number
  id: string
  name: string
  renderKey: string
  inactive: boolean
  isFragment: boolean
  hasChildren: boolean
  children: ComponentTreeNode[]
  positionTop?: number
  consoleId?: string
  isRouterView?: boolean
  macthedRouteSegment?: string
  tags: InspectorNodeTag[]
}

export interface InspectedComponentData {
  id: string
  name: string
  file: string
  state: ComponentState[]
  functional?: boolean
}

export interface StateBase {
  key: string
  value: any
  editable: boolean
  objectType?: 'ref' | 'reactive' | 'computed' | 'other'
  raw?: string
}

export interface ComponentStateBase extends StateBase {
  type: string
}

export interface ComponentPropState extends ComponentStateBase {
  meta?: {
    type: string
    required: boolean
    /** Vue 1 only */
    mode?: 'default' | 'sync' | 'once'
  }
}

export type ComponentBuiltinCustomStateTypes = 'function' | 'map' | 'set' | 'reference' | 'component' | 'component-definition' | 'router' | 'store'

export interface ComponentCustomState extends ComponentStateBase {
  value: {
    _custom: {
      type: ComponentBuiltinCustomStateTypes | string
      display?: string
      tooltip?: string
      value?: any
      abstract?: boolean
      file?: string
      uid?: number
      readOnly?: boolean
      /** Configure immediate child fields */
      fields?: {
        abstract?: boolean
      }
    }
  }
}

export type ComponentState = ComponentStateBase | ComponentPropState | ComponentCustomState
