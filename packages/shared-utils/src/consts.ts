export enum BuiltinTabs {
  COMPONENTS = 'components',
  TIMELINE = 'timeline',
  SETTINGS = 'settings',
}

export enum BridgeEvents {
  TO_BACK_SUBSCRIBE = 'b:subscribe',
  TO_BACK_UNSUBSCRIBE = 'b:unsubscribe',
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
  TO_BACK_COMPONENT_TREE = 'b:component:tree',
  TO_FRONT_COMPONENT_TREE = 'f:component:tree',
  TO_BACK_COMPONENT_SELECTED_DATA = 'b:component:selected-data',
  TO_FRONT_COMPONENT_SELECTED_DATA = 'f:component:selected-data',
  TO_BACK_COMPONENT_EXPAND = 'b:component:expand',
  TO_FRONT_COMPONENT_EXPAND = 'f:component:expand',
  TO_BACK_COMPONENT_SCROLL_TO = 'b:component:scroll-to',
  TO_BACK_COMPONENT_FILTER = 'b:component:filter',
  TO_BACK_COMPONENT_MOUSE_OVER = 'b:component:mouse-over',
  TO_BACK_COMPONENT_MOUSE_OUT = 'b:component:mouse-out',
  TO_BACK_COMPONENT_CONTEXT_MENU_TARGET = 'b:component:context-menu-target',
  TO_BACK_COMPONENT_SET_DATA = 'b:component:set-data',
  TO_FRONT_TIMELINE_EVENT = 'f:timeline:event'
}

export enum BridgeSubscriptions {
  SELECTED_COMPONENT_DATA = 'component:selected-data',
  COMPONENT_TREE = 'component:tree',
}

export enum HookEvents {
  INIT = 'init',
  APP_INIT = 'app:init',
  APP_ADD = 'app:add',
  APP_UNMOUNT = 'app:unmount',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
  /**
   * @deprecated
   */
  FLUSH = 'flush',
}
