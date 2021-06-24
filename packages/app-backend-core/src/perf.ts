import { BackendContext } from '@vue-devtools/app-backend-api'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { App, ComponentInstance } from '@vue/devtools-api'
import { BridgeSubscriptions } from '@vue-devtools/shared-utils'
import { addTimelineEvent } from './timeline'
import { getAppRecord } from './app'
import { getComponentId, sendComponentTreeData } from './component'
import { isSubscribed } from './util/subscriptions'

export async function performanceMarkStart (
  app: App,
  uid: number,
  instance: ComponentInstance,
  type: string,
  time: number,
  ctx: BackendContext
) {
  try {
    if (!SharedData.performanceMonitoringEnabled) return
    const appRecord = await getAppRecord(app, ctx)
    const componentName = await ctx.api.getComponentName(instance)
    const groupId = ctx.perfUniqueGroupId++
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
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e)
    }
  }
}

export async function performanceMarkEnd (
  app: App,
  uid: number,
  instance: ComponentInstance,
  type: string,
  time: number,
  ctx: BackendContext
) {
  try {
    if (!SharedData.performanceMonitoringEnabled) return
    const appRecord = await getAppRecord(app, ctx)
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
    const tooSlow = duration > 10
    if (tooSlow || instance.__VUE_DEVTOOLS_SLOW__) {
      let change = false
      if (tooSlow && !instance.__VUE_DEVTOOLS_SLOW__) {
        instance.__VUE_DEVTOOLS_SLOW__ = {
          duration: null,
          measures: {}
        }
      }

      const data = instance.__VUE_DEVTOOLS_SLOW__

      if (tooSlow && (data.duration == null || data.duration < duration)) {
        data.duration = duration
        change = true
      }

      if (data.measures[type] == null || data.measures[type] < duration) {
        data.measures[type] = duration
        change = true
      }

      if (change) {
        // Update component tree
        const id = await getComponentId(app, uid, ctx)
        if (isSubscribed(BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
          requestAnimationFrame(() => {
            sendComponentTreeData(appRecord, id, ctx.currentAppRecord.componentFilter, null, ctx)
          })
        }
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e)
    }
  }
}

export function handleAddPerformanceTag (ctx: BackendContext) {
  ctx.api.on.visitComponentTree(payload => {
    if (payload.componentInstance.__VUE_DEVTOOLS_SLOW__) {
      const { duration, measures } = payload.componentInstance.__VUE_DEVTOOLS_SLOW__

      let tooltip = '<div class="grid grid-cols-2 gap-2 font-mono text-xs">'
      for (const type in measures) {
        const d = measures[type]
        tooltip += `<div>${type}</div><div class="text-right text-black rounded px-1 ${d > 30 ? 'bg-red-400' : d > 10 ? 'bg-yellow-400' : 'bg-green-400'}">${d} ms</div>`
      }
      tooltip += '</div>'

      payload.treeNode.tags.push({
        backgroundColor: duration > 30 ? 0xF87171 : 0xFBBF24,
        textColor: 0x000000,
        label: `${duration} ms`,
        tooltip
      })
    }
  })
}
