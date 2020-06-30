import { onUnmounted } from '@vue/composition-api'

let bridge

export function useBridge () {
  const cbs = []

  function onBridge (event, cb) {
    cbs.push({ event, cb })
    bridge.on(event, cb)
  }

  onUnmounted(() => {
    for (const { event, cb } of cbs) {
      bridge.off(event, cb)
    }
  })

  return {
    bridge,
    onBridge
  }
}

export function setBridge (b) {
  bridge = b
}
