export enum BuiltinTabs {
  COMPONENTS = 'components',
  TIMELINE = 'timeline',
  PLUGINS = 'plugins',
  SETTINGS = 'settings',
}

export enum BridgeEvents {
  // Misc
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
  TO_BACK_LOG = 'b:log',

  // Apps
  /** App was registered */
  TO_FRONT_APP_ADD = 'f:app:add',
  /** Get app list */
  TO_BACK_APP_LIST = 'b:app:list',
  TO_FRONT_APP_LIST = 'f:app:list',
  TO_FRONT_APP_REMOVE = 'f:app:remove',
  TO_BACK_APP_SELECT = 'b:app:select',
  TO_FRONT_APP_SELECTED = 'f:app:selected',

  // Components
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
  TO_BACK_COMPONENT_EDIT_STATE = 'b:component:edit-state',
  TO_BACK_COMPONENT_PICK = 'b:component:pick',
  TO_FRONT_COMPONENT_PICK = 'f:component:pick',
  TO_BACK_COMPONENT_PICK_CANCELED = 'b:component:pick-canceled',
  TO_FRONT_COMPONENT_PICK_CANCELED = 'f:component:pick-canceled',
  TO_BACK_COMPONENT_INSPECT_DOM = 'b:component:inspect-dom',
  TO_FRONT_COMPONENT_INSPECT_DOM = 'f:component:inspect-dom',
  TO_BACK_COMPONENT_RENDER_CODE = 'b:component:render-code',
  TO_FRONT_COMPONENT_RENDER_CODE = 'f:component:render-code',

  // Timeline
  TO_FRONT_TIMELINE_EVENT = 'f:timeline:event',
  TO_BACK_TIMELINE_LAYER_LIST = 'b:timeline:layer-list',
  TO_FRONT_TIMELINE_LAYER_LIST = 'f:timeline:layer-list',
  TO_FRONT_TIMELINE_LAYER_ADD = 'f:timeline:layer-add',
  TO_BACK_TIMELINE_SHOW_SCREENSHOT = 'b:timeline:show-screenshot',
  TO_BACK_TIMELINE_CLEAR = 'b:timeline:clear',
  TO_BACK_TIMELINE_EVENT_DATA = 'b:timeline:event-data',
  TO_FRONT_TIMELINE_EVENT_DATA = 'f:timeline:event-data',
  TO_BACK_TIMELINE_LAYER_LOAD_EVENTS = 'b:timeline:layer-load-events',
  TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS = 'f:timeline:layer-load-events',

  // Plugins
  TO_BACK_DEVTOOLS_PLUGIN_LIST = 'b:devtools-plugin:list',
  TO_FRONT_DEVTOOLS_PLUGIN_LIST = 'f:devtools-plugin:list',
  TO_FRONT_DEVTOOLS_PLUGIN_ADD = 'f:devtools-plugin:add',

  // Custom inspectors
  TO_BACK_CUSTOM_INSPECTOR_LIST = 'b:custom-inspector:list',
  TO_FRONT_CUSTOM_INSPECTOR_LIST = 'f:custom-inspector:list',
  TO_FRONT_CUSTOM_INSPECTOR_ADD = 'f:custom-inspector:add',
  TO_BACK_CUSTOM_INSPECTOR_TREE = 'b:custom-inspector:tree',
  TO_FRONT_CUSTOM_INSPECTOR_TREE = 'f:custom-inspector:tree',
  TO_BACK_CUSTOM_INSPECTOR_STATE = 'b:custom-inspector:state',
  TO_FRONT_CUSTOM_INSPECTOR_STATE = 'f:custom-inspector:state',
  TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE = 'b:custom-inspector:edit-state',
  TO_BACK_CUSTOM_INSPECTOR_ACTION = 'b:custom-inspector:action',
  TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE = 'f:custom-inspector:select-node',

  // Custom state
  TO_BACK_CUSTOM_STATE_ACTION = 'b:custom-state:action'
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
  COMPONENT_HIGHLIGHT = 'component:highlight',
  COMPONENT_UNHIGHLIGHT = 'component:unhighlight',
  SETUP_DEVTOOLS_PLUGIN = 'devtools-plugin:setup',
  TIMELINE_LAYER_ADDED = 'timeline:layer-added',
  TIMELINE_EVENT_ADDED = 'timeline:event-added',
  CUSTOM_INSPECTOR_ADD = 'custom-inspector:add',
  CUSTOM_INSPECTOR_SEND_TREE = 'custom-inspector:send-tree',
  CUSTOM_INSPECTOR_SEND_STATE = 'custom-inspector:send-state',
  CUSTOM_INSPECTOR_SELECT_NODE = 'custom-inspector:select-node',
  PERFORMANCE_START = 'perf:start',
  PERFORMANCE_END = 'perf:end',
  /**
   * @deprecated
   */
  FLUSH = 'flush',
}
