import { DevtoolsApi } from '@vue-devtools/app-backend-api'
import { HookEvents, SharedData } from '@vue-devtools/shared-utils'
import { instanceMap } from './tree'

const COMPONENT_HOOKS = {
  beforeCreate: { start: 'create' },
  created: { end: 'create' },
  beforeMount: { start: 'mount' },
  mounted: { end: 'mount' },
  beforeUpdate: { start: 'update' },
  updated: { end: 'update' },
  beforeDestroyed: { start: 'destroy' },
  destroyed: { end: 'destroy' },
}

export function initPerf (api: DevtoolsApi, app, Vue) {
  // Global mixin
  Vue.mixin({
    beforeCreate () {
      applyPerfHooks(api, this, app)
    },
  })

  // Apply to existing components
  instanceMap?.forEach(vm => applyPerfHooks(api, vm, app))
}

export function applyPerfHooks (api: DevtoolsApi, vm, app) {
  if (vm.$options.$_devtoolsPerfHooks) return
  vm.$options.$_devtoolsPerfHooks = true

  for (const hook in COMPONENT_HOOKS) {
    const { start, end } = COMPONENT_HOOKS[hook]
    const handler = function (this: any) {
      if (SharedData.performanceMonitoringEnabled) {
        api.ctx.hook.emit(
          start ? HookEvents.PERFORMANCE_START : HookEvents.PERFORMANCE_END,
          app,
          this._uid,
          this,
          start ?? end,
          api.now(),
        )
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
  }
}
