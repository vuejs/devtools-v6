import { Context, DevtoolsPluginApi, Hookable } from './api'

interface QueueItem {
  method: string
  args: any[]
  resolve?: (value?: any) => void
}

export class ApiProxy<TTarget extends DevtoolsPluginApi = DevtoolsPluginApi> {
  target: TTarget | null
  targetQueue: QueueItem[]
  proxiedTarget: TTarget

  onQueue: QueueItem[]
  proxiedOn: Hookable<Context>

  constructor () {
    this.target = null
    this.targetQueue = []
    this.onQueue = []

    this.proxiedOn = new Proxy({} as Hookable<Context>, {
      get: (_target, prop: string) => {
        if (this.target) {
          return this.target.on[prop]
        } else {
          return (...args) => {
            this.onQueue.push({
              method: prop,
              args
            })
          }
        }
      }
    })

    this.proxiedTarget = new Proxy({} as TTarget, {
      get: (_target, prop: string) => {
        if (this.target) {
          return this.target[prop]
        } else if (prop === 'on') {
          return this.proxiedOn
        } else {
          return (...args) => {
            return new Promise(resolve => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve
              })
            })
          }
        }
      }
    })
  }

  async setRealTarget (target: TTarget) {
    this.target = target

    for (const item of this.onQueue) {
      this.target.on[item.method](...item.args)
    }

    for (const item of this.targetQueue) {
      item.resolve(await this.target[item.method](...item.args))
    }
  }
}
