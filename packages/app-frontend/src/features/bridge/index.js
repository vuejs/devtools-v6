import { onUnmounted } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'

let bridge

export function useBridge () {
  const cbs = []

  function onBridge (event, cb) {
    cbs.push({ event, cb })
    bridge.on(event, cb)
  }

  const subs = []

  function subscribe (type, payload) {
    const sub = { type, payload }
    subs.push(sub)
    bridge.send(BridgeEvents.TO_BACK_SUBSCRIBE, sub)
    return () => {
      const index = subs.indexOf(sub)
      if (index !== -1) {
        subs.splice(index, 1)
      }
      bridge.send(BridgeEvents.TO_BACK_UNSUBSCRIBE, sub)
    }
  }

  onUnmounted(() => {
    for (const { event, cb } of cbs) {
      bridge.off(event, cb)
    }

    for (const sub of subs) {
      bridge.send(BridgeEvents.TO_BACK_UNSUBSCRIBE, sub)
    }
  })

  return {
    bridge,
    onBridge,
    subscribe
  }
}

export function setBridge (b) {
  bridge = b
}

export function getBridge () {
  return bridge
}
