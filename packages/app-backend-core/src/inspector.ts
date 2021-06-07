import { App } from '@vue/devtools-api'
import { BackendContext, CustomInspector } from '@vue-devtools/app-backend-api'
import { BridgeEvents, parse, stringify } from '@vue-devtools/shared-utils'
import { getAppRecordId } from './app'

export function getInspector (inspectorId: string, app: App, ctx: BackendContext) {
  return ctx.customInspectors.find(i => i.id === inspectorId && i.app === app)
}

export function getInspectorWithAppId (inspectorId: string, appId: number, ctx: BackendContext) {
  return ctx.customInspectors.find(i => i.id === inspectorId && getAppRecordId(i.app) === appId)
}

export async function sendInspectorTree (inspector: CustomInspector, ctx: BackendContext) {
  const rootNodes = await ctx.api.getInspectorTree(inspector.id, inspector.app, inspector.treeFilter)
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
    appId: getAppRecordId(inspector.app),
    inspectorId: inspector.id,
    rootNodes
  })
}

export async function sendInspectorState (inspector: CustomInspector, ctx: BackendContext) {
  const state = inspector.selectedNodeId ? await ctx.api.getInspectorState(inspector.id, inspector.app, inspector.selectedNodeId) : null
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
    appId: getAppRecordId(inspector.app),
    inspectorId: inspector.id,
    state: stringify(state)
  })
}

export async function editInspectorState (inspector: CustomInspector, nodeId: string, dotPath: string, type: string, state: any, ctx: BackendContext) {
  await ctx.api.editInspectorState(inspector.id, inspector.app, nodeId, dotPath, type, {
    ...state,
    value: state.value != null ? parse(state.value, true) : state.value
  })
}

export async function sendCustomInspectors (ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
    inspectors: ctx.customInspectors.map(i => ({
      id: i.id,
      appId: getAppRecordId(i.app),
      pluginId: i.plugin.descriptor.id,
      label: i.label,
      icon: i.icon,
      treeFilterPlaceholder: i.treeFilterPlaceholder,
      stateFilterPlaceholder: i.stateFilterPlaceholder,
      noSelectionText: i.noSelectionText,
      actions: i.actions?.map(a => ({
        icon: a.icon,
        tooltip: a.tooltip
      }))
    }))
  })
}

export async function selectInspectorNode (inspector: CustomInspector, nodeId: string, ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE, {
    appId: getAppRecordId(inspector.app),
    inspectorId: inspector.id,
    nodeId
  })
}
