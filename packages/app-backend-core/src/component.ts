import { stringify, BridgeEvents, parse } from '@vue-devtools/shared-utils'
import { AppRecord, BackendContext } from '@vue-devtools/app-backend-api'
import { getAppRecord } from './app'
import { App, EditStatePayload } from '@vue/devtools-api'

export async function sendComponentTreeData (appRecord: AppRecord, instanceId: string, filter = '', ctx: BackendContext) {
  if (!instanceId) return
  const instance = getComponentInstance(appRecord, instanceId, ctx)
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

export async function sendSelectedComponentData (appRecord: AppRecord, instanceId: string, ctx: BackendContext) {
  if (!instanceId) return
  markSelectedInstance(instanceId, ctx)
  const instance = getComponentInstance(appRecord, instanceId, ctx)
  if (!instance) {
    sendEmptyComponentData(instanceId, ctx)
  } else {
    // Expose instance on window
    if (typeof window !== 'undefined') {
      (window as any).$vm = instance
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('inspect', instance)
    }
    const parentInstances = await ctx.api.walkComponentParents(instance)
    const payload = {
      instanceId,
      data: stringify(await ctx.api.inspectComponent(instance, ctx.currentAppRecord.options.app)),
      parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__)
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

export async function editComponentState (instanceId: string, dotPath: string, type: string, state: EditStatePayload, ctx: BackendContext) {
  if (!instanceId) return
  const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
  if (instance) {
    if ('value' in state && state.value != null) {
      state.value = parse(state.value, true)
    }
    await ctx.api.editComponentState(instance, dotPath, type, state, ctx.currentAppRecord.options.app)
    await sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx)
  }
}

export function getComponentId (app: App, uid: number, ctx: BackendContext) {
  const appRecord = getAppRecord(app, ctx)
  if (!appRecord) return null
  return `${appRecord.id}:${uid === 0 ? 'root' : uid}`
}

export function getComponentInstance (appRecord: AppRecord, instanceId: string, ctx: BackendContext) {
  if (instanceId === '_root') {
    instanceId = `${appRecord.id}:root`
  }
  const instance = appRecord.instanceMap.get(instanceId)
  if (!instance && process.env.NODE_ENV !== 'production') {
    console.warn(`Instance uid=${instanceId} not found`)
  }
  return instance
}
