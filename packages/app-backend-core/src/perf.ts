import { BackendContext } from '@vue-devtools/app-backend-api'
import { App, ComponentInstance } from '@vue/devtools-api'
import { addTimelineEvent } from './timeline'
import { getAppRecord } from './app'

let uniqueGroupId = 0

export async function performanceMarkStart (
  app: App,
  instanceId: string,
  instance: ComponentInstance,
  type: string,
  time: number,
  ctx: BackendContext
) {
  const appRecord = getAppRecord(app, ctx)
  const componentName = await ctx.api.getComponentName(instance)
  const groupId = uniqueGroupId++
  const groupKey = `${instanceId}-${type}`
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
  instanceId: string,
  instance: ComponentInstance,
  type: string,
  time: number,
  ctx: BackendContext
) {
  const appRecord = getAppRecord(app, ctx)
  const componentName = await ctx.api.getComponentName(instance)
  const groupKey = `${instanceId}-${type}`
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
}
