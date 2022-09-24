import { App } from '@vue/devtools-api'
import { BackendContext, CustomInspector } from '@vue-devtools/app-backend-api'
import { BridgeEvents, parse, stringify } from '@vue-devtools/shared-utils'

export function getInspector (inspectorId: string, app: App, ctx: BackendContext) {
  return ctx.customInspectors.find(i => i.id === inspectorId && i.appRecord.options.app === app)
}

export async function getInspectorWithAppId (inspectorId: string, appId: string, ctx: BackendContext): Promise<CustomInspector> {
  for (const i of ctx.customInspectors) {
    if (i.id === inspectorId && i.appRecord.id === appId) {
      return i
    }
  }
  return null
}

export async function sendInspectorTree (inspector: CustomInspector, ctx: BackendContext) {
  const rootNodes = await inspector.appRecord.backend.api.getInspectorTree(inspector.id, inspector.appRecord.options.app, inspector.treeFilter)
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
    appId: inspector.appRecord.id,
    inspectorId: inspector.id,
    rootNodes,
  })
}

export async function sendInspectorState (inspector: CustomInspector, ctx: BackendContext) {
  const state = inspector.selectedNodeId ? await inspector.appRecord.backend.api.getInspectorState(inspector.id, inspector.appRecord.options.app, inspector.selectedNodeId) : null
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
    appId: inspector.appRecord.id,
    inspectorId: inspector.id,
    state: stringify(state),
  })
}

export async function editInspectorState (inspector: CustomInspector, nodeId: string, dotPath: string, type: string, state: any, ctx: BackendContext) {
  await inspector.appRecord.backend.api.editInspectorState(inspector.id, inspector.appRecord.options.app, nodeId, dotPath, type, {
    ...state,
    value: state.value != null ? parse(state.value, true) : state.value,
  })
}

export async function sendCustomInspectors (ctx: BackendContext) {
  const inspectors = []
  for (const i of ctx.customInspectors) {
    inspectors.push({
      id: i.id,
      appId: i.appRecord.id,
      pluginId: i.plugin.descriptor.id,
      label: i.label,
      icon: i.icon,
      treeFilterPlaceholder: i.treeFilterPlaceholder,
      stateFilterPlaceholder: i.stateFilterPlaceholder,
      noSelectionText: i.noSelectionText,
      actions: i.actions?.map(a => ({
        icon: a.icon,
        tooltip: a.tooltip,
      })),
      nodeActions: i.nodeActions?.map(a => ({
        icon: a.icon,
        tooltip: a.tooltip,
      })),
    })
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
    inspectors,
  })
}

export async function selectInspectorNode (inspector: CustomInspector, nodeId: string, ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE, {
    appId: inspector.appRecord.id,
    inspectorId: inspector.id,
    nodeId,
  })
}
