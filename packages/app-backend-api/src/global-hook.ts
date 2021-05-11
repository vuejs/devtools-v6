/* eslint-disable @typescript-eslint/ban-types */

import { AppRecordOptions } from './app-record'

export interface DevtoolsHook {
  emit: (event: string, ...payload: any[]) => void
  on: <T extends Function>(event: string, handler: T) => void
  once: <T extends Function>(event: string, handler: T) => void
  off: <T extends Function>(event?: string, handler?: T) => void
  Vue?: any
  apps: AppRecordOptions[]
}
