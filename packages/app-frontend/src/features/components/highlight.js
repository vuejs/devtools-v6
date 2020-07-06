import { useBridge } from '../bridge'
import { BridgeEvents } from '@vue-devtools/shared-utils'

export function useComponentHighlight (id) {
  const { bridge } = useBridge()

  function highlight () {
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, id.value)
  }

  function unhighlight () {
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT)
  }

  return {
    highlight,
    unhighlight
  }
}
