import { stringify, BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { BackendContext } from '@vue-devtools/app-backend-api'
import { getAppRecord } from './app'
import { App, EditStatePayload } from '@vue/devtools-api'

export async function sendComponentTreeData (instanceId: string, filter = '', ctx: BackendContext) {
  if (!instanceId) return
  const instance = getComponentInstance(instanceId, ctx)
  if (!instance) {
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, {
      instanceId,
      treeData: null,
      notFound: true
    })
  } else {
    if (filter) filter = filter.toLowerCase()
    const maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1
    const payload = {
      instanceId,
      treeData: stringify(await ctx.api.walkComponentTree(instance, maxDepth, filter))
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, payload)
  }
}

export async function sendSelectedComponentData (instanceId: string, ctx: BackendContext) {
  if (!instanceId) return
  markSelectedInstance(instanceId, ctx)
  const instance = getComponentInstance(instanceId, ctx)
  if (!instance) {
    sendEmptyComponentData(instanceId, ctx)
  } else {
    // Expose instance on window
    if (typeof window !== 'undefined') {
      (window as any).$vm = instance
    }
    const payload = {
      instanceId,
      data: stringify(await ctx.api.inspectComponent(instance))
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload)
  }
}

export function markSelectedInstance (instanceId: string, ctx: BackendContext) {
  ctx.currentInspectedComponentId = instanceId
  ctx.currentAppRecord.lastInspectedComponentId = instanceId
}

export function sendEmptyComponentData (instanceId: string, ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
    instanceId,
    data: null
  })
}

export async function editComponentState (instanceId: string, dotPath: string, state: EditStatePayload, ctx: BackendContext) {
  if (!instanceId) return
  const instance = getComponentInstance(instanceId, ctx)
  if (instance) {
    if ('value' in state && state.value != null) {
      state.value = parse(state.value, true)
    }
    await ctx.api.editComponentState(instance, dotPath, state)
    await sendSelectedComponentData(instanceId, ctx)
  }
}

export function getComponentId (app: App, uid: number, ctx: BackendContext) {
  const appRecord = getAppRecord(app, ctx)
  if (!appRecord) return null
  return `${appRecord.id}:${uid === 0 ? 'root' : uid}`
}

export function getComponentInstance (instanceId: string, ctx: BackendContext) {
  if (instanceId === '_root') {
    instanceId = `${ctx.currentAppRecord.id}:root`
  }
  const instance = ctx.currentAppRecord.instanceMap.get(instanceId)
  if (!instance) {
    console.warn(`Instance uid=${instanceId} not found`)
  }
  return instance
}
