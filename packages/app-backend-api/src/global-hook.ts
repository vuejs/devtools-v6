import { AppRecordOptions } from './app-record'

export interface DevtoolsHook {
  emit: (event: string, ...payload: any[]) => void
  on: (event: string, handler: Function) => void
  once: (event: string, handler: Function) => void
  off: (event?: string, handler?: Function) => void
  Vue?: any
  apps: AppRecordOptions[]
}
