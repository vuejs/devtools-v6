import { Bridge } from './bridge'

export interface Shell {
  connect: (cb: ((bridge: Bridge) => void | Promise<void>)) => void
  onReload: (cb: (() => void | Promise<void>)) => void
}
