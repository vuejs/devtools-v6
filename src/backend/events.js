import { stringify } from '../util'

export function initEventsBackend (bridge, instanceMap, getInstanceName) {
  bridge.on('trigger-event', (event) => {
    const instance = instanceMap.get(event.instanceId)
    instance._events[event.eventName][0](event.eventData)
  })
  instanceMap.forEach((instance) => {
    const listeners = instance._events
    if (listeners) {
      Object.keys(listeners).forEach((eventName) => {
        if (!eventName.startsWith('hook:')) {
          const oldEventFunc = listeners[eventName][0]
          listeners[eventName][0] = (...args) => {
            oldEventFunc.apply(instance, args)
            bridge.send('event:emit', stringify({
              instanceId: instance._uid,
              instanceName: getInstanceName(instance),
              eventName: eventName,
              eventData: args[0],
              timestamp: Date.now()
            }))
          }
        }
      })
    }
  })
}
