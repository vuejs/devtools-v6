import { stringify, BridgeEvents } from '@vue-devtools/shared-utils'
import { BackendContext } from '@vue-devtools/app-backend-api'

export async function sendComponentTreeData (instanceId: string, filter = '', ctx: BackendContext) {
  if (!instanceId) return
  if (filter) filter = filter.toLowerCase()
  const instance = ctx.currentAppRecord.instanceMap.get(instanceId)
  if (!instance) {
    console.warn(`Instance uid=${instanceId} not found`)
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_TREE, {
      instanceId,
      treeData: null
    })
  } else {
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
  const instance = ctx.currentAppRecord.instanceMap.get(instanceId)
  if (!instance) {
    console.warn(`Instance uid=${instanceId} not found`)
    sendEmptyComponentData(instanceId, ctx)
  } else {
    ctx.currentInspectedComponentId = instanceId
    ctx.currentAppRecord.lastInspectedComponentId = instanceId
    const payload = {
      instanceId,
      data: stringify(await ctx.api.inspectComponent(instance))
    }
    ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload)
  }
}

export function sendEmptyComponentData (instanceId: string, ctx: BackendContext) {
  ctx.bridge.send(BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
    instanceId,
    data: null
  })
}
