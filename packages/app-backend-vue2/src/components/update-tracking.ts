import { DevtoolsApi } from '@vue-devtools/app-backend-api'
import { HookEvents, SharedData } from '@vue-devtools/shared-utils'
import throttle from 'lodash/throttle'
import { getUniqueId } from './util.js'

export function initUpdateTracking (api: DevtoolsApi, Vue) {
  // Global mixin
  Vue.mixin({
    beforeCreate () {
      applyTrackingUpdateHook(api, this)
    },
  })
}

const COMPONENT_HOOKS = [
  'created',
  'updated',
]

export function applyTrackingUpdateHook (api: DevtoolsApi, vm) {
  if (vm.$options.$_devtoolsUpdateTrackingHooks) return
  vm.$options.$_devtoolsUpdateTrackingHooks = true

  const handler = throttle(async function (this: any) {
    if (SharedData.trackUpdates) {
      api.ctx.hook.emit(HookEvents.TRACK_UPDATE, getUniqueId(this), api.ctx)

      const parents = await api.walkComponentParents(this)
      for (const parent of parents) {
        api.ctx.hook.emit(HookEvents.TRACK_UPDATE, getUniqueId(parent), api.ctx)
      }
    }

    if (SharedData.flashUpdates) {
      api.ctx.hook.emit(HookEvents.FLASH_UPDATE, this, api.backend)
    }
  }, 100)
  for (const hook of COMPONENT_HOOKS) {
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
