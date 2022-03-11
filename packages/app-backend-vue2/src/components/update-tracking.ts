import { DevtoolsApi } from '@vue-devtools/app-backend-api'
import { SharedData } from '@vue-devtools/shared-utils'
import { sendComponentUpdateTracking } from '@vue-devtools/app-backend-core/lib/component'
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
      sendComponentUpdateTracking(getUniqueId(this), api.ctx)

      const parents = await api.walkComponentParents(this)
      for (const parent of parents) {
        sendComponentUpdateTracking(getUniqueId(parent), api.ctx)
      }
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
