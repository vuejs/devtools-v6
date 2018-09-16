import SharedData, { watch } from 'src/shared-data'
import { getComponentName } from 'src/util'

const COMPONENT_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroyed',
  'destroyed'
]

const RENDER_HOOKS = {
  beforeMount: { after: 'mountRender' },
  mounted: { before: 'mountRender' },
  beforeUpdate: { after: 'updateRender' },
  updated: { before: 'updateRender' }
}

let frames = 0
let frameTime
let secondsTimer
let bridge

let componentMetrics

export function initPerfBackend (Vue, _bridge, instanceMap) {
  bridge = _bridge

  // Global mixin
  Vue.mixin({
    beforeCreate () {
      applyHooks(this)
    }
  })

  // Apply to existing components
  instanceMap.forEach(applyHooks)

  watch('recordPerf', value => {
    if (value) {
      startRecording()
    } else {
      stopRecording()
    }
  })
}

function startRecording () {
  frames = 0
  frameTime = performance.now()
  secondsTimer = setInterval(frameInterval, 500)
  componentMetrics = {}
  requestAnimationFrame(frame)
}

function stopRecording () {
  clearInterval(secondsTimer)
}

function frame () {
  frames++
  if (SharedData.recordPerf) {
    requestAnimationFrame(frame)
  }
}

function frameInterval () {
  const metric = {
    type: 'fps',
    time: Date.now(),
    start: frameTime,
    end: frameTime = performance.now()
  }
  metric.value = Math.round(frames / (metric.end - metric.start) * 1000)
  frames = 0
  bridge.send('perf:add-metric', metric)
}

function applyHooks (vm) {
  if (vm.$options.$_devtoolsPerfHooks) return
  vm.$options.$_devtoolsPerfHooks = true

  const renderMetrics = {}

  COMPONENT_HOOKS.forEach(hook => {
    const renderHook = RENDER_HOOKS[hook]

    const handler = function () {
      if (SharedData.recordPerf) {
        // Before
        const time = performance.now()
        if (renderHook && renderHook.before) {
          // Render hook ends before one hook
          const metric = renderMetrics[renderHook.before]
          if (metric) {
            metric.end = time
            addComponentMetric(vm.$options, renderHook.before, metric.start, metric.end)
          }
        }

        // After
        this.$once(`hook:${hook}`, () => {
          const newTime = performance.now()
          addComponentMetric(vm.$options, hook, time, newTime)
          if (renderHook && renderHook.after) {
            // Render hook starts after one hook
            renderMetrics[renderHook.after] = {
              start: newTime,
              end: 0
            }
          }
        })
      }
    }
    const currentValue = vm.$options[hook]
    if (Array.isArray(currentValue)) {
      vm.$options[hook] = [handler, ...currentValue]
    } else if (typeof currentValue === 'function') {
      vm.$options[hook] = [handler, currentValue]
    } else {
      vm.$options[hook] = [handler]
    }
  })
}

function addComponentMetric (options, type, start, end) {
  const duration = end - start
  const name = getComponentName(options)

  const metric = componentMetrics[name] = componentMetrics[name] || {
    id: name,
    hooks: {},
    totalTime: 0
  }

  const hook = metric.hooks[type] = metric.hooks[type] || {
    count: 0,
    totalTime: 0
  }
  hook.count++
  hook.totalTime += duration

  metric.totalTime += duration

  bridge.send('perf:upsert-metric', { type: 'componentRender', data: metric })
}
