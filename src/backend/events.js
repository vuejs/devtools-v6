import { stringify } from '../util'

export function initEventsBackend (Vue, bridge, getInstanceName) {
  let recording = true

  bridge.on('events:toggle-recording', enabled => {
    recording = enabled
  })

  const vueEmit = Vue.prototype.$emit
  Vue.prototype.$emit = function () {
    const res = vueEmit.apply(this, arguments)

    if (recording) {
      const eventName = arguments[0]
      if (!eventName.startsWith('hook:')) {
        bridge.send('event:emit', stringify({
          instanceId: this._uid,
          instanceName: getInstanceName(this),
          eventName: eventName,
          eventData: arguments[1],
          timestamp: Date.now()
        }))
      }
    }

    return res
  }
}
