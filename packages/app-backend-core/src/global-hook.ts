import { AppRecord } from '@vue-devtools/app-backend-api'
import { target } from '@vue-devtools/shared-utils'

export interface DevtoolsHook {
  emit: (event: string, ...payload: any[]) => void
  on: (event: string, handler: Function) => void
  once: (event: string, handler: Function) => void
  off: (event?: string, handler?: Function) => void
  appRecords: AppRecord[]
  Vue?: any
}

// hook should have been injected before this executes.
export const hook: DevtoolsHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__
