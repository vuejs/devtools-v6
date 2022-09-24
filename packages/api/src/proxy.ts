import type { Context, DevtoolsPluginApi, Hookable } from './api/index.js'
import type { PluginDescriptor } from './plugin.js'
import { HOOK_PLUGIN_SETTINGS_SET } from './const.js'
import { now } from './time.js'

interface QueueItem {
  method: string
  args: any[]
  resolve?: (value?: any) => void
}

export class ApiProxy<TTarget extends DevtoolsPluginApi<any> = DevtoolsPluginApi<any>> {
  target: TTarget | null
  targetQueue: QueueItem[]
  proxiedTarget: TTarget

  onQueue: QueueItem[]
  proxiedOn: Hookable<Context>

  plugin: PluginDescriptor
  hook: any
  fallbacks: Record<string, any>

  constructor (plugin: PluginDescriptor, hook: any) {
    this.target = null
    this.targetQueue = []
    this.onQueue = []

    this.plugin = plugin
    this.hook = hook

    const defaultSettings: Record<string, any> = {}
    if (plugin.settings) {
      for (const id in plugin.settings) {
        const item = plugin.settings[id]
        defaultSettings[id] = item.defaultValue
      }
    }
    const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`
    let currentSettings = Object.assign({}, defaultSettings)
    try {
      const raw = localStorage.getItem(localSettingsSaveId)
      const data = JSON.parse(raw)
      Object.assign(currentSettings, data)
    } catch (e) {
      // noop
    }

    this.fallbacks = {
      getSettings () {
        return currentSettings
      },
      setSettings (value) {
        try {
          localStorage.setItem(localSettingsSaveId, JSON.stringify(value))
        } catch (e) {
          // noop
        }
        currentSettings = value
      },
      now () {
        return now()
      },
    }

    if (hook) {
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value)
        }
      })
    }

    this.proxiedOn = new Proxy({} as Hookable<Context>, {
      get: (_target, prop: string) => {
        if (this.target) {
          return this.target.on[prop]
        } else {
          return (...args) => {
            this.onQueue.push({
              method: prop,
              args,
            })
          }
        }
      },
    })

    this.proxiedTarget = new Proxy({} as TTarget, {
      get: (_target, prop: string) => {
        if (this.target) {
          return this.target[prop]
        } else if (prop === 'on') {
          return this.proxiedOn
        } else if (Object.keys(this.fallbacks).includes(prop)) {
          return (...args) => {
            this.targetQueue.push({
              method: prop,
              args,
              resolve: () => { /* noop */ },
            })
            return this.fallbacks[prop](...args)
          }
        } else {
          return (...args) => {
            return new Promise(resolve => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve,
              })
            })
          }
        }
      },
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
