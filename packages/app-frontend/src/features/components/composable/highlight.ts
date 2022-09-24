import { getBridge } from '@front/features/bridge'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { Ref } from 'vue'
import throttle from 'lodash/throttle'

const throttledSend = throttle((id?: string) => {
  if (id) {
    getBridge().send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, id)
  } else {
    getBridge().send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT)
  }
}, 200)

export function useComponentHighlight (id: Ref<string>) {
  function highlight () {
    throttledSend(id.value)
  }

  function unhighlight () {
    throttledSend(null)
  }

  return {
    highlight,
    unhighlight,
  }
}
