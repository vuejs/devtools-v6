import { BackendContext } from '@vue-devtools/app-backend-api'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { App, ComponentInstance } from '@vue/devtools-api'
import { BridgeSubscriptions } from '@vue-devtools/shared-utils'
import { addTimelineEvent } from './timeline'
import { getAppRecord } from './app'
import { getComponentId, sendComponentTreeData } from './component'
import { isSubscribed } from './util/subscriptions'

let uniqueGroupId = 0

export async function performanceMarkStart (
  app: App,
  uid: number,
  instance: ComponentInstance,
  type: string,
  time: number,
  ctx: BackendContext
) {
  if (!SharedData.performanceMonitoringEnabled) return
  const appRecord = getAppRecord(app, ctx)
  const componentName = await ctx.api.getComponentName(instance)
  const groupId = uniqueGroupId++
  const groupKey = `${uid}-${type}`
  appRecord.perfGroupIds.set(groupKey, { groupId, time })
  addTimelineEvent({
    layerId: 'performance',
    event: {
      time,
      data: {
        component: componentName,
        type,
        measure: 'start'
      },
      title: componentName,
      subtitle: type,
      groupId
    }
  }, app, ctx)
}

export async function performanceMarkEnd (
  app: App,
  uid: number,
  instance: ComponentInstance,
  type: string,
  time: number,
  ctx: BackendContext
) {
  if (!SharedData.performanceMonitoringEnabled) return
  const appRecord = getAppRecord(app, ctx)
  const componentName = await ctx.api.getComponentName(instance)
  const groupKey = `${uid}-${type}`
  const { groupId, time: startTime } = appRecord.perfGroupIds.get(groupKey)
  const duration = time - startTime
  addTimelineEvent({
    layerId: 'performance',
    event: {
      time,
      data: {
        component: componentName,
        type,
        measure: 'end',
        duration: {
          _custom: {
            type: 'Duration',
            value: duration,
            display: `${duration} ms`
          }
        }
      },
      title: componentName,
      subtitle: type,
      groupId
    }
  }, app, ctx)

  // Mark on component
  if (duration > 10 && (!instance.__VUE_DEVTOOLS_SLOW__ || instance.__VUE_DEVTOOLS_SLOW__.duration < duration)) {
    instance.__VUE_DEVTOOLS_SLOW__ = {
      duration
    }

    const id = getComponentId(app, uid, ctx)
    if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
      requestAnimationFrame(() => {
        sendComponentTreeData(appRecord, id, ctx.currentAppRecord.componentFilter, ctx)
      })
    }
  }
}
