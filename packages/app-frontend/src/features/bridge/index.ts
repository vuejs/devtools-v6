import { onUnmounted } from '@vue/composition-api'
import { Bridge, BridgeEvents } from '@vue-devtools/shared-utils'

let bridge: Bridge

export function useBridge () {
  const cbs = []

  function onBridge (event: BridgeEvents, cb: (payload: any) => void | Promise<void>) {
    cbs.push({ event, cb })
    bridge.on(event, cb)
  }

  const subs = []

  function subscribe (type: string, payload: any) {
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

export function setBridge (b: Bridge) {
  bridge = b
}

export function getBridge (): Bridge | null {
  return bridge
}
