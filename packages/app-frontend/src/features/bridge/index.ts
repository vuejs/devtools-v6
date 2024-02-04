import { onUnmounted } from 'vue'
import type { Bridge } from '@vue-devtools/shared-utils'
import { BridgeEvents } from '@vue-devtools/shared-utils'

let bridge: Bridge

interface Sub {
  type: string
  key: string
}

export function useBridge() {
  const cbs = []

  function onBridge(event: BridgeEvents, cb: (payload: any) => void | Promise<void>) {
    cbs.push({ event, cb })
    bridge.on(event, cb)
  }

  const subs: Sub[] = []

  function subscribe(type: string, key: string) {
    const sub = { type, key }
    subs.push(sub)
    bridge.send(BridgeEvents.TO_BACK_SUBSCRIBE, key)
    return () => {
      const index = subs.indexOf(sub)
      if (index !== -1) {
        subs.splice(index, 1)
      }
      bridge.send(BridgeEvents.TO_BACK_UNSUBSCRIBE, key)
    }
  }

  onUnmounted(() => {
    for (const { event, cb } of cbs) {
      bridge.off(event, cb)
    }

    for (const sub of subs) {
      bridge.send(BridgeEvents.TO_BACK_UNSUBSCRIBE, sub.key)
    }
  })

  return {
    bridge,
    onBridge,
    subscribe,
  }
}

export function setBridge(b: Bridge) {
  bridge = b
}

export function getBridge(): Bridge | null {
  return bridge
}
