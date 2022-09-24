import { stringify, BridgeEvents, parse, SharedData } from '@vue-devtools/shared-utils'
import { AppRecord, BackendContext, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { getAppRecord } from './app'
import { App, ComponentInstance, EditStatePayload, now } from '@vue/devtools-api'

const MAX_$VM = 10
const $vmQueue = []

export async function sendComponentTreeData (appRecord: AppRecord, instanceId: string, filter = '', maxDepth: number = null, recursively = false, ctx: BackendContext) {
  if (!instanceId || appRecord !== ctx.currentAppRecord) return

  // Flush will send all components in the tree
  // So we skip individiual tree updates
  if (
    instanceId !== '_root' &&
    ctx.currentAppRecord.backend.options.features.includes(BuiltinBackendFeature.FLUSH)
  ) {
    return
  }

  const instance = getComponentInstance(appRecord, instanceId, ctx)
  if (!instance) {
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, {
      instanceId,
      treeData: null,
      notFound: true,
    })
  } else {
    if (filter) filter = filter.toLowerCase()
    if (maxDepth == null) {
      maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1
    }
    const data = await appRecord.backend.api.walkComponentTree(instance, maxDepth, filter, recursively)
    const payload = {
      instanceId,
      treeData: stringify(data),
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, payload)
  }
}

export async function sendSelectedComponentData (appRecord: AppRecord, instanceId: string, ctx: BackendContext) {
  if (!instanceId || appRecord !== ctx.currentAppRecord) return
  const instance = getComponentInstance(appRecord, instanceId, ctx)
  if (!instance) {
    sendEmptyComponentData(instanceId, ctx)
  } else {
    // Expose instance on window
    if (typeof window !== 'undefined') {
      const win = (window as any)
      win.$vm = instance

      // $vm0, $vm1, $vm2, ...
      if ($vmQueue[0] !== instance) {
        if ($vmQueue.length >= MAX_$VM) {
          $vmQueue.pop()
        }
        for (let i = $vmQueue.length; i > 0; i--) {
          win[`$vm${i}`] = $vmQueue[i] = $vmQueue[i - 1]
        }
        win.$vm0 = $vmQueue[0] = instance
      }
    }
    if (SharedData.debugInfo) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG] inspect', instance)
    }
    const parentInstances = await appRecord.backend.api.walkComponentParents(instance)
    const payload = {
      instanceId,
      data: stringify(await appRecord.backend.api.inspectComponent(instance, ctx.currentAppRecord.options.app)),
      parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__),
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload)
    markSelectedInstance(instanceId, ctx)
  }
}

export function markSelectedInstance (instanceId: string, ctx: BackendContext) {
  ctx.currentInspectedComponentId = instanceId
  ctx.currentAppRecord.lastInspectedComponentId = instanceId
}

export function sendEmptyComponentData (instanceId: string, ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
    instanceId,
    data: null,
  })
}

export async function editComponentState (instanceId: string, dotPath: string, type: string, state: EditStatePayload, ctx: BackendContext) {
  if (!instanceId) return
  const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx)
  if (instance) {
    if ('value' in state && state.value != null) {
      state.value = parse(state.value, true)
    }
    await ctx.currentAppRecord.backend.api.editComponentState(instance, dotPath, type, state, ctx.currentAppRecord.options.app)
    await sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx)
  }
}

export async function getComponentId (app: App, uid: number, instance: ComponentInstance, ctx: BackendContext) {
  try {
    if (instance.__VUE_DEVTOOLS_UID__) return instance.__VUE_DEVTOOLS_UID__
    const appRecord = await getAppRecord(app, ctx)
    if (!appRecord) return null
    const isRoot = appRecord.rootInstance === instance
    return `${appRecord.id}:${isRoot ? 'root' : uid}`
  } catch (e) {
    if (SharedData.debugInfo) {
      console.error(e)
    }
    return null
  }
}

export function getComponentInstance (appRecord: AppRecord, instanceId: string, ctx: BackendContext) {
  if (instanceId === '_root') {
    instanceId = `${appRecord.id}:root`
  }
  const instance = appRecord.instanceMap.get(instanceId)
  if (!instance && SharedData.debugInfo) {
    console.warn(`Instance uid=${instanceId} not found`)
  }
  return instance
}

export async function refreshComponentTreeSearch (ctx: BackendContext) {
  if (!ctx.currentAppRecord.componentFilter) return
  await sendComponentTreeData(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, null, false, ctx)
}

export async function sendComponentUpdateTracking (instanceId: string, ctx: BackendContext) {
  if (!instanceId) return
  const payload = {
    instanceId,
    time: Date.now(), // Use normal date
  }
  ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_UPDATED, payload)
}
