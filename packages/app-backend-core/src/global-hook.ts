import { DevtoolsHook } from '@vue-devtools/app-backend-api'
import { target } from '@vue-devtools/shared-utils'

// hook should have been injected before this executes.
export const hook: DevtoolsHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__
