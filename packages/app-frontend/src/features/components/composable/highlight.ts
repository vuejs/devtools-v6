import { useBridge } from '@front/features/bridge'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { Ref } from '@vue/composition-api'

export function useComponentHighlight (id: Ref<string>) {
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
