export interface ComponentTreeNode {
  uid: number
  id: number
  name: string
  renderKey: string
  inactive: boolean
  isFragment: boolean
  children: ComponentTreeNode[]
  positionTop: number
  consoleId?: string
  isRouterView?: boolean
  macthedRouteSegment?: string
}

export interface InspectedComponentData {
  id: number
  name: string
  file: string
  state: ComponentState[]
  functional?: boolean
}

export interface ComponentStateBase {
  type: string
  key: string
  value: any
  editable: boolean
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
