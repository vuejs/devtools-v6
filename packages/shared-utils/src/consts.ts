export enum BuiltinTabs {
  COMPONENTS = 'components',
  TIMELINE = 'timeline', // @TODO
  SETTINGS = 'settings',
}

export enum BridgeEvents {
  /** Backend is ready */
  TO_FRONT_READY = 'f:ready',
  /** Displays the "detected Vue" console log */
  TO_BACK_LOG_DETECTED_VUE = 'b:log-detected-vue',
  /** Force refresh */
  TO_BACK_REFRESH = 'b:refresh',
  /** Tab was switched */
  TO_BACK_TAB_SWITCH = 'b:tab:switch',
  /** App was registered */
  TO_FRONT_APP_ADD = 'f:app:add',
  /** Get app list */
  TO_BACK_APP_LIST = 'b:app:list',
  TO_FRONT_APP_LIST = 'f:app:list',
  TO_BACK_APP_SELECT = 'b:app:select',
  TO_FRONT_APP_SELECTED = 'f:app:selected',
  TO_FRONT_COMPONENT_FLUSH = 'f:component:flush',
  TO_BACK_COMPONENT_SELECT = 'b:component:select',
  TO_FRONT_COMPONENT_SELECTED = 'f:component:selected',
  TO_BACK_COMPONENT_SCROLL_TO = 'b:component:scroll-to',
  TO_BACK_COMPONENT_FILTER = 'b:component:filter',
  TO_BACK_COMPONENT_MOUSE_OVER = 'b:component:mouse-over',
  TO_BACK_COMPONENT_MOUSE_OUT = 'b:component:mouse-out',
  TO_BACK_COMPONENT_CONTEXT_MENU_TARGET = 'b:component:context-menu-target',
  /** Request a component to be inspected */
  TO_FRONT_COMPONENT_INSPECT = 'f:component:inspect',
  TO_BACK_COMPONENT_SET_DATA = 'b:component:set-data',
}

export enum HookEvents {
  INIT = 'init',
  FLUSH = 'flush',
}
