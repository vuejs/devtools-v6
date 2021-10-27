
import { DevtoolsBackendOptions, DevtoolsBackend, createBackend, BackendContext } from '@vue-devtools/app-backend-api'

import { backend as backendVue1 } from '@vue-devtools/app-backend-vue1'
import { backend as backendVue2 } from '@vue-devtools/app-backend-vue2'
import { backend as backendVue3 } from '@vue-devtools/app-backend-vue3'

import { handleAddPerformanceTag } from './perf'

export const availableBackends = [
  backendVue1,
  backendVue2,
  backendVue3,
]

const enabledBackends: Map<DevtoolsBackendOptions, DevtoolsBackend> = new Map()

export function getBackend (backendOptions: DevtoolsBackendOptions, ctx: BackendContext) {
  let backend: DevtoolsBackend
  if (!enabledBackends.has(backendOptions)) {
    // Create backend
    backend = createBackend(backendOptions, ctx)
    handleAddPerformanceTag(backend, ctx)
    enabledBackends.set(backendOptions, backend)
    ctx.backends.push(backend)
  } else {
    backend = enabledBackends.get(backendOptions)
  }
  return backend
}
